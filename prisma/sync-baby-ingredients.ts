// Makes sure every vegetable/fruit of the "პირველი საკვები" tracker exists in the database and
// is available from the intended age. It only ADDS missing ingredients and LOWERS a too-high
// minimum age to the intended one (never raises anything, never deletes). Run:
//   npx tsx prisma/sync-baby-ingredients.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const INTENDED = [
  { nameKa: 'კარტოფილი', nameEn: 'Potato', minAgeMonths: 6, category: 'vegetable' },
  { nameKa: 'სტაფილო', nameEn: 'Carrot', minAgeMonths: 6, category: 'vegetable' },
  { nameKa: 'გოგრა', nameEn: 'Pumpkin', minAgeMonths: 6, category: 'vegetable' },
  { nameKa: 'ყაბაყი', nameEn: 'Zucchini', minAgeMonths: 6, category: 'vegetable' },
  { nameKa: 'ბარდა', nameEn: 'Peas', minAgeMonths: 6, category: 'vegetable' },
  { nameKa: 'ტკბილი კარტოფილი', nameEn: 'Sweet Potato', minAgeMonths: 6, category: 'vegetable' },
  { nameKa: 'ჭარხალი', nameEn: 'Beetroot', minAgeMonths: 6, category: 'vegetable' },
  { nameKa: 'მწვანე ლობიო', nameEn: 'Green Beans', minAgeMonths: 6, category: 'vegetable' },
  { nameKa: 'ბროკოლი', nameEn: 'Broccoli', minAgeMonths: 7, category: 'vegetable' },
  { nameKa: 'ყვავილოვანი კომბოსტო', nameEn: 'Cauliflower', minAgeMonths: 7, category: 'vegetable' },
  { nameKa: 'ბრიუსელის კომბოსტო', nameEn: 'Brussels Sprouts', minAgeMonths: 7, category: 'vegetable' },
  { nameKa: 'კომბოსტო', nameEn: 'Cabbage', minAgeMonths: 7, category: 'vegetable' },
  { nameKa: 'ისპანახი', nameEn: 'Spinach', minAgeMonths: 8, category: 'vegetable' },
  { nameKa: 'ბადრიჯანი', nameEn: 'Eggplant', minAgeMonths: 8, category: 'vegetable' },
  { nameKa: 'ტკბილი წიწაკა', nameEn: 'Sweet Pepper', minAgeMonths: 8, category: 'vegetable' },
  { nameKa: 'კიტრი', nameEn: 'Cucumber', minAgeMonths: 8, category: 'vegetable' },
  { nameKa: 'სიმინდი', nameEn: 'Corn', minAgeMonths: 8, category: 'vegetable' },
  { nameKa: 'პრასი', nameEn: 'Leek', minAgeMonths: 8, category: 'vegetable' },
  { nameKa: 'ბოლოკი', nameEn: 'Radish', minAgeMonths: 8, category: 'vegetable' },
  { nameKa: 'პომიდორი', nameEn: 'Tomato', minAgeMonths: 9, category: 'vegetable' },
  { nameKa: 'ვაშლი', nameEn: 'Apple', minAgeMonths: 6, category: 'fruit' },
  { nameKa: 'ბანანი', nameEn: 'Banana', minAgeMonths: 6, category: 'fruit' },
  { nameKa: 'მსხალი', nameEn: 'Pear', minAgeMonths: 6, category: 'fruit' },
  { nameKa: 'ატამი', nameEn: 'Peach', minAgeMonths: 6, category: 'fruit' },
  { nameKa: 'ქლიავი', nameEn: 'Plum', minAgeMonths: 6, category: 'fruit' },
  { nameKa: 'ავოკადო', nameEn: 'Avocado', minAgeMonths: 6, category: 'fruit' },
  { nameKa: 'მანგო', nameEn: 'Mango', minAgeMonths: 6, category: 'fruit' },
  { nameKa: 'გარგარი', nameEn: 'Apricot', minAgeMonths: 6, category: 'fruit' },
  { nameKa: 'ნესვი', nameEn: 'Melon', minAgeMonths: 8, category: 'fruit' },
  { nameKa: 'ჟოლო', nameEn: 'Raspberry', minAgeMonths: 8, category: 'fruit' },
  { nameKa: 'მარწყვი', nameEn: 'Strawberry', minAgeMonths: 8, category: 'fruit' },
  { nameKa: 'კივი', nameEn: 'Kiwi', minAgeMonths: 8, category: 'fruit' },
  { nameKa: 'მოცვი', nameEn: 'Blueberry', minAgeMonths: 8, category: 'fruit' },
  { nameKa: 'ალუბალი', nameEn: 'Cherry', minAgeMonths: 8, category: 'fruit' },
  { nameKa: 'მანდარინი', nameEn: 'Mandarin', minAgeMonths: 8, category: 'fruit' },
  { nameKa: 'ანანასი', nameEn: 'Pineapple', minAgeMonths: 8, category: 'fruit' },
  { nameKa: 'საზამთრო', nameEn: 'Watermelon', minAgeMonths: 8, category: 'fruit' },
  { nameKa: 'ლეღვი', nameEn: 'Fig', minAgeMonths: 8, category: 'fruit' },
  { nameKa: 'კომში', nameEn: 'Quince', minAgeMonths: 8, category: 'fruit' },
  { nameKa: 'ფორთოხალი', nameEn: 'Orange', minAgeMonths: 8, category: 'fruit' },
  { nameKa: 'მაყვალი', nameEn: 'Blackberry', minAgeMonths: 8, category: 'fruit' },
  { nameKa: 'მოცხარი', nameEn: 'Currant', minAgeMonths: 8, category: 'fruit' },
  { nameKa: 'ყურძენი', nameEn: 'Grape', minAgeMonths: 10, category: 'fruit' },
  { nameKa: 'ბროწეული', nameEn: 'Pomegranate', minAgeMonths: 10, category: 'fruit' },
];

async function main() {
  let created = 0, lowered = 0;
  for (const ing of INTENDED) {
    const existing = await prisma.babyIngredient.findFirst({ where: { nameEn: ing.nameEn } });
    if (!existing) {
      await prisma.babyIngredient.create({ data: ing });
      console.log(`დაემატა: ${ing.nameKa} (${ing.minAgeMonths} თვიდან)`);
      created++;
    } else if (existing.minAgeMonths > ing.minAgeMonths) {
      await prisma.babyIngredient.update({ where: { id: existing.id }, data: { minAgeMonths: ing.minAgeMonths } });
      console.log(`ასაკი შემცირდა: ${existing.nameKa}  ${existing.minAgeMonths} -> ${ing.minAgeMonths} თვე`);
      lowered++;
    }
  }
  console.log(`\nდაემატა ${created}, ასაკი შემცირდა ${lowered} ინგრედიენტზე. დანარჩენი უკვე სწორად იყო.`);
}
main().finally(() => prisma.$disconnect());
