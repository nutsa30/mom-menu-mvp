import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const MODEL = 'claude-haiku-4-5';
const MAX_HISTORY_TURNS = 8; // keep requests small — this isn't a long-running conversation

// Cache the assembled site-knowledge block in memory between requests (per server
// instance) so we don't re-query the DB on every single chat message — it only
// changes when content is edited, which is infrequent relative to chat traffic.
let knowledgeCache: { text: string; builtAt: number } | null = null;
const KNOWLEDGE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function buildKnowledgeBlock(): Promise<string> {
  if (knowledgeCache && Date.now() - knowledgeCache.builtAt < KNOWLEDGE_TTL_MS) {
    return knowledgeCache.text;
  }

  const [dishes, blogs, faqs, contact] = await Promise.all([
    prisma.dish.findMany({
      select: {
        titleKa: true, mealType: true, ageGroups: true, allergens: true,
        descriptionKa: true, ingredientsKa: true,
      },
    }),
    prisma.blog.findMany({
      where: { isPublished: true },
      select: { titleKa: true, contentKa: true, slug: true },
    }),
    prisma.howItWorksFaq.findMany({ orderBy: { sortOrder: 'asc' }, select: { questionKa: true, answerKa: true } }),
    prisma.contactSettings.findUnique({ where: { id: 'singleton' } }),
  ]);

  const ageLabel: Record<string, string> = { FROM_6: '6თვ+', FROM_9: '9თვ+', FROM_12: '12თვ+', FROM_24: '24თვ+' };
  const mealLabel: Record<string, string> = { BREAKFAST: 'საუზმე', LUNCH: 'სადილი', DINNER: 'ვახშამი', SNACK: 'სნექი' };

  const recipeLines = dishes.map((d) => {
    const ages = d.ageGroups.map((a) => ageLabel[a] ?? a).join('/');
    const allergyNote = d.allergens.length ? `ალერგენები: ${d.allergens.join(', ')}` : 'ალერგენების გარეშე';
    return `- ${d.titleKa} (${mealLabel[d.mealType] ?? d.mealType}, ასაკი: ${ages}, ${allergyNote}). ინგრედიენტები: ${d.ingredientsKa.join(', ')}`;
  }).join('\n');

  const blogLines = blogs.map((b) => `- "${b.titleKa}": ${b.contentKa.replace(/<[^>]+>/g, ' ').slice(0, 400)}...`).join('\n');
  const faqLines = faqs.map((f) => `Q: ${f.questionKa}\nA: ${f.answerKa}`).join('\n\n');

  const text = `
## პაკეტები და ფასები
- FREE — შეუძლია ნახოს კერძების სათაურები, სრული რეცეპტი დაკეტილია.
- RECIPE_PLAN (15₾/თვე) — სრული რეცეპტების ნახვა.
- FULL_PLAN (21₾/თვე, ფასდაკლებით 30-დან) — ყოველდღიური პერსონალური მენიუს გენერაცია ასაკის/ალერგიის/გემოვნების მიხედვით + ავტომატური საყიდლების სია.
- ყველა პირველი გამოწერა იწყება 7-დღიანი სრულიად უფასო საცდელი პერიოდით — ბარათი მხოლოდ მოწმდება (დროებით დაიბლოკება), საერთოდ არაფერი ჩამოიჭრება ამ პერიოდში. 7 დღის შემდეგ, თუ არ გააუქმეს, ხდება რეალური ჩამოჭრა და შემდეგ ყოველთვიურად.
- გაუქმება შესაძლებელია ნებისმიერ დროს ანგარიშის პარამეტრებიდან.
- ხელახლა გამოწერისას (თუ ტრიალი ერთხელ უკვე გამოყენებულია) მეორე უფასო ტრიალი აღარ ეძლევა — პირდაპირ ჩამოიჭრება.

## საკონტაქტო ინფორმაცია
ელფოსტა: ${contact?.email ?? 'info@mommenu.ge'}
პასუხის დრო: ${contact?.responseTimeKa ?? '24 საათის განმავლობაში'}
სამუშაო საათები: ${contact?.workingHoursKa ?? 'ორშ–პარ, 10:00–18:00'}

## ხშირად დასმული კითხვები
${faqLines || '(არ არის დამატებული)'}

## ხელმისაწვდომი რეცეპტები (${dishes.length} სულ)
${recipeLines}

## ბლოგის სტატიები (${blogs.length} გამოქვეყნებული)
${blogLines || '(არ არის გამოქვეყნებული სტატია)'}
`.trim();

  knowledgeCache = { text, builtAt: Date.now() };
  return text;
}

const SYSTEM_INSTRUCTIONS = `
შენ ხარ mom menu-ის (ბავშვის კვების დაგეგმვის საიტი) მომხმარებელთა დახმარების ასისტენტი.

წესები:
1. უპასუხე **მხოლოდ** ქვემოთ მოცემულ ინფორმაციაზე დაყრდნობით. არასდროს გამოიგონო რეცეპტი, ფასი ან წესი, რომელიც აქ არ წერია.
2. თუ კითხვაზე პასუხი ამ ინფორმაციაში არ არსებობს, გულწრფელად თქვი, რომ ამის თაობაზე ზუსტი ინფორმაცია არ გაქვს და მიმართე საკონტაქტო ელფოსტაზე.
3. უპასუხე იმ ენაზე, რომელზეც მომხმარებელმა დაწერა (ქართული ან ინგლისური).
4. იყავი მეგობრული, თბილი, მოკლე და კონკრეტული — არა ზედმეტად ფორმალური.
5. რეცეპტების შესახებ კითხვისას, თუ რამდენიმე შესაფერისი ვარიანტია, შესთავაზე 2-3, არა მთელი სია.
6. არასდროს გასცე სამედიცინო რჩევა — ალერგიის/ჯანმრთელობის სერიოზულ საკითხებზე ურჩიე ექიმთან კონსულტაცია.
`.trim();

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'chatbot_not_configured' }, { status: 503 });
    }

    const body = await req.json();
    const message: string = (body?.message ?? '').toString().trim();
    const history: { role: 'user' | 'assistant'; content: string }[] = Array.isArray(body?.history) ? body.history : [];

    if (!message) return NextResponse.json({ error: 'empty_message' }, { status: 400 });
    if (message.length > 2000) return NextResponse.json({ error: 'message_too_long' }, { status: 400 });

    const knowledge = await buildKnowledgeBlock();
    const client = new Anthropic({ apiKey });

    const trimmedHistory = history.slice(-MAX_HISTORY_TURNS * 2);

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: [
        { type: 'text', text: SYSTEM_INSTRUCTIONS },
        { type: 'text', text: knowledge, cache_control: { type: 'ephemeral' } },
      ],
      messages: [
        ...trimmedHistory.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: message },
      ],
    });

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
    const reply = textBlock?.text ?? 'ბოდიში, პასუხის გენერირება ვერ მოხერხდა.';

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('Chatbot error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
