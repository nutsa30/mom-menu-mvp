// Read-only — prints every dish's title, meal type, age groups, ingredients and prep steps,
// so Claude can review the full catalog and pick out which dishes are genuinely suited to
// shaping and freezing ahead (cutlets, patties, dumplings, etc.), for the new "გაყინვა"
// dashboard tab. Nothing is written to the database.
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function main() {
  const dishes = await p.dish.findMany({
    orderBy: { titleKa: 'asc' },
    select: {
      id: true, titleKa: true, titleEn: true, mealType: true, ageGroups: true,
      ingredientsKa: true, descriptionKa: true, tags: true,
    },
  });

  console.log(`სულ ${dishes.length} კერძი\n`);
  for (const d of dishes) {
    console.log('='.repeat(80));
    console.log(`ID: ${d.id}`);
    console.log(`${d.titleKa} / ${d.titleEn}`);
    console.log(`მიმართულება: ${d.mealType} | ასაკი: ${d.ageGroups.join(', ')} | tags: ${d.tags.join(', ') || '—'}`);
    console.log(`ინგრედიენტები: ${d.ingredientsKa.join('; ')}`);
    console.log(`მომზადება:\n${d.descriptionKa}`);
    console.log('');
  }

  await p.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
