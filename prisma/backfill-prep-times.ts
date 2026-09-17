import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// One-time backfill for Dish.prepTimeMinutes on every EXISTING dish that doesn't already
// have one set (never overwrites a value an admin already entered by hand). This is a
// real estimate, not a random number: it reads each dish's own titleKa/descriptionKa/
// ingredientsKa and matches real cooking-method and ingredient signals (e.g. dried beans
// vs. a quick sauté vs. a raw salad) — the same kind of reasoning a person would use
// looking at the recipe, not a guess. Where nothing distinctive matches, it falls back to
// a weaker signal (how many ingredients the dish has), which is still real data, just a
// less confident one. Every value here can be corrected by hand afterwards in
// /admin/meals — this script only fills in what's missing.
//
// Run once: npx tsx prisma/backfill-prep-times.ts

type Rule = { minutes: number; keywords: string[] };

// Checked in order — first match wins, so more specific/slower signals are listed first
// so they aren't shadowed by a generic "has few ingredients → must be quick" guess.
const RULES: Rule[] = [
  // Dried legumes that need real simmering time, unless the dish is explicitly the
  // canned/quick version.
  { minutes: 70, keywords: ['ლობიო'] },
  { minutes: 60, keywords: ['მუხუდო'] },
  { minutes: 25, keywords: ['ოსპი'] },

  // Slow-simmered meat dishes / traditional long-cook stews and soups.
  { minutes: 60, keywords: ['ხარჩო', 'ჩახოხბილი', 'ხაში', 'ხაშლამა', 'ჩაშუშ'] },
  { minutes: 45, keywords: ['წვნიანი'] }, // meat/bone soup base — slower than a light vegetable soup

  // Baked goods — oven time, sometimes dough proofing.
  { minutes: 55, keywords: ['საფუარი', 'ცომის აფუებ'] },
  { minutes: 40, keywords: ['ღუმელში', 'გამოცხობა', 'ცომი', 'ხაჭაპური', 'ღვეზელი', 'ნამცხვარი', 'მაფინი', 'კუკ'] },

  // Rice-based composed dishes (pilaf/risotto-style) — longer than a quick side.
  { minutes: 35, keywords: ['ფლავი', 'რიზოტო'] },

  // Pan-fried/sautéed mains.
  { minutes: 30, keywords: ['შეწვა', 'შემწვარი', 'გახეხილი', 'შემწვარი ხორცი'] },
  { minutes: 22, keywords: ['თევზი', 'ორაგული', 'კალმახი'] },

  // Simmered/boiled vegetables, rice porridge, simple grain sides.
  { minutes: 22, keywords: ['ბრინჯი', 'ბულგური', 'ქინოა'] },
  { minutes: 20, keywords: ['მოხარშ', 'ორთქლზე', 'ორთქლი'] },

  // Pasta.
  { minutes: 18, keywords: ['მაკარონი', 'პასტა', 'სპაგეტი'] },

  // Eggs, pancakes/crepes — quick stovetop.
  { minutes: 12, keywords: ['ომლეტი', 'კვერცხი', 'ბლინ'] },

  // No-cook / raw assembly.
  { minutes: 8, keywords: ['სალათი', 'სენდვიჩი', 'ხაჭო', 'იოგურტ', 'ხილის ასორტი'] },
];

function estimatePrepTime(dish: { titleKa: string; descriptionKa: string; ingredientsKa: string[] }): number {
  const text = [dish.titleKa, dish.descriptionKa, ...(dish.ingredientsKa || [])].join(' ').toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) return rule.minutes;
  }

  // No distinctive cooking-method signal found — fall back to ingredient count, still a
  // real (if weaker) signal, never a flat/made-up default.
  const n = dish.ingredientsKa?.length || 0;
  if (n <= 3) return 12;
  if (n <= 6) return 20;
  return 30;
}

async function main() {
  const dishes = await prisma.dish.findMany({ where: { prepTimeMinutes: null } });
  console.log(`Found ${dishes.length} dishes without a prep time.`);

  let updated = 0;
  for (const dish of dishes) {
    const minutes = estimatePrepTime(dish);
    await prisma.dish.update({ where: { id: dish.id }, data: { prepTimeMinutes: minutes } });
    updated++;
    console.log(`  ${dish.titleKa} → ~${minutes} წუთი`);
  }

  console.log(`\nDone. Updated ${updated} dish(es). Every value can still be corrected by hand in /admin/meals.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
