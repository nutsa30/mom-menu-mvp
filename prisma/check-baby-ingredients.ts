// Read-only: lists every ingredient of the "პირველი საკვები" tracker with the minimum age (months)
// from which it appears for a baby. Run: npx tsx prisma/check-baby-ingredients.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.babyIngredient.findMany({
    orderBy: [{ category: 'asc' }, { minAgeMonths: 'asc' }, { nameKa: 'asc' }],
    select: { nameKa: true, category: true, minAgeMonths: true, isAllergen: true },
  });
  console.log(`სულ ინგრედიენტი: ${rows.length}\n`);
  let cat = '';
  for (const r of rows) {
    if (r.category !== cat) { cat = r.category; console.log(`\n[${cat}]`); }
    console.log(`  ${String(r.minAgeMonths).padStart(2)} თვიდან  ${r.nameKa}${r.isAllergen ? '  (ალერგენი)' : ''}`);
  }
}
main().finally(() => prisma.$disconnect());
