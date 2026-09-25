import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Read-only research script — does NOT change anything. Used to understand the existing
// Dish catalog before adding 10 new dishes: (1) full title list, to check none of the new
// dishes are duplicates of something already in the menu, and (2) a few full example rows,
// to see the conventions already in use for nutrient rounding/units before writing new ones.
//
// Run: npx tsx prisma/research-existing-dishes.ts

async function main() {
  const total = await p.dish.count();
  console.log(`\n=== სულ კერძი ბაზაში: ${total} ===\n`);

  const dishes = await p.dish.findMany({
    select: { id: true, titleKa: true, titleEn: true, mealType: true, ageGroups: true },
    orderBy: { titleKa: 'asc' },
  });

  console.log('=== ყველა კერძის სახელი (დუბლიკატის შესამოწმებლად) ===');
  for (const d of dishes) {
    console.log(`- [${d.mealType}] ${d.titleKa} / ${d.titleEn} (${d.ageGroups.join(',')})`);
  }

  console.log('\n=== 3 სრული მაგალითი (nutrient ფორმატის შესამოწმებლად) ===');
  const samples = await p.dish.findMany({ take: 3, orderBy: { createdAt: 'desc' } });
  for (const d of samples) {
    console.log('\n---');
    console.log(JSON.stringify(d, null, 2));
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
