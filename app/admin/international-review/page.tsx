import { requireAdmin } from '@/lib/auth';
import { ENGLISH_EMAILS } from '@/lib/email-en';
import { prisma } from '@/lib/prisma';
import EmailPreview from './EmailPreview';
export default async function InternationalReview() {
  await requireAdmin();
  const dishes = await prisma.dish.findMany({ select: { id: true, titleKa: true, titleEn: true, descriptionEn: true, ingredientsEn: true } });
  const missing = dishes.filter(d => !d.titleEn.trim() || !d.descriptionEn.trim() || !d.ingredientsEn.length || /[\u10A0-\u10FF]/.test(d.titleEn + d.descriptionEn + d.ingredientsEn.join(' ')));
  const [ingredients, babyIngredients, suggestions, blogs, faqs] = await Promise.all([
    prisma.ingredient.findMany({ select: { titleKa: true, titleEn: true } }),
    prisma.babyIngredient.findMany({ select: { nameKa: true, nameEn: true } }),
    prisma.babyMealSuggestion.findMany({ select: { titleKa: true, titleEn: true } }),
    prisma.blog.findMany({ select: { titleKa: true, titleEn: true, contentEn: true } }),
    prisma.howItWorksFaq.findMany({ select: { questionKa: true, questionEn: true, answerEn: true } }),
  ]);
  const translated = (value: string) => !!value.trim() && !/[\u10A0-\u10FF]/.test(value);
  const groups = [
    { label: 'ინგრედიენტები', records: ingredients.map(i => ({ name: i.titleKa, complete: translated(i.titleEn) })) },
    { label: 'პირველი საკვები', records: babyIngredients.map(i => ({ name: i.nameKa, complete: translated(i.nameEn) })) },
    { label: 'ჩვილის რეცეპტები', records: suggestions.map(i => ({ name: i.titleKa, complete: translated(i.titleEn) })) },
    { label: 'ბლოგი', records: blogs.map(i => ({ name: i.titleKa, complete: translated(i.titleEn) && translated(i.contentEn) })) },
    { label: 'კითხვები და პასუხები', records: faqs.map(i => ({ name: i.questionKa, complete: translated(i.questionEn) && translated(i.answerEn) })) },
  ];
  return <main className="max-w-5xl mx-auto my-6 p-6 space-y-8 rounded-2xl bg-[#FDFBF0] text-[#465940]"><h1 className="text-2xl font-bold">საერთაშორისო ვერსიის შემოწმება</h1><p>რეცეპტების ინგლისური შევსება: {dishes.length - missing.length}/{dishes.length}</p>{missing.map(d => <p key={d.id}>{d.titleKa}: English content needs review.</p>)}{groups.map(group => <section key={group.label}><h2 className="font-bold">{group.label}: {group.records.filter(r => r.complete).length}/{group.records.length}</h2>{group.records.filter(r => !r.complete).map(record => <p key={record.name}>{record.name}: English content needs review.</p>)}</section>)}<EmailPreview keys={Object.keys(ENGLISH_EMAILS)} /></main>;
}
