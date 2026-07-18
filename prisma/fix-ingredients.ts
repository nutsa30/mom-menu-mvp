import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function run() {
  // Delete unwanted
  const toDelete = ['Fennel', 'Asparagus', 'Turnip', 'Nectarine', 'Papaya', 'Guava'];
  for (const nameEn of toDelete) {
    const d = await p.babyIngredient.deleteMany({ where: { nameEn } });
    console.log(`Deleted ${nameEn}: ${d.count}`);
  }

  // Fix Georgian names
  await p.babyIngredient.updateMany({ where: { nameEn: 'Blueberry' }, data: { nameKa: 'მოცვი' } });
  console.log('Renamed Blueberry → მოცვი');

  await p.babyIngredient.updateMany({ where: { nameEn: 'Orange' }, data: { nameKa: 'ფორთოხალი' } });
  console.log('Renamed Orange → ფორთოხალი');

  await p.babyIngredient.updateMany({ where: { nameEn: 'Sweet Potato' }, data: { nameKa: 'ტკბილი კარტოფილი' } });
  console.log('Renamed Sweet Potato → ტკბილი კარტოფილი');

  // Final count
  const all = await p.babyIngredient.findMany({ orderBy: [{ category: 'asc' }, { minAgeMonths: 'asc' }] });
  const vegs = all.filter(i => i.category === 'vegetable');
  const fruits = all.filter(i => i.category === 'fruit');
  console.log(`\nVEGS (${vegs.length}):`, vegs.map(v => `${v.nameKa}(${v.minAgeMonths}mo)`).join(', '));
  console.log(`FRUITS (${fruits.length}):`, fruits.map(f => `${f.nameKa}(${f.minAgeMonths}mo)`).join(', '));

  await p.$disconnect();
}

run().catch(console.error);
