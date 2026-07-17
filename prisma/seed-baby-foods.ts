import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const VEGETABLES = [
  { nameKa: 'კარტოფილი',           nameEn: 'Potato',           minAgeMonths: 6 },
  { nameKa: 'სტაფილო',             nameEn: 'Carrot',           minAgeMonths: 6 },
  { nameKa: 'გოგრა',               nameEn: 'Pumpkin',          minAgeMonths: 6 },
  { nameKa: 'ყაბაყი',              nameEn: 'Zucchini',         minAgeMonths: 6 },
  { nameKa: 'ბროკოლი',             nameEn: 'Broccoli',         minAgeMonths: 7 },
  { nameKa: 'ყვავილოვანი კომბოსტო', nameEn: 'Cauliflower',      minAgeMonths: 7 },
  { nameKa: 'ბარდა',               nameEn: 'Peas',             minAgeMonths: 6 },
  { nameKa: 'ბოლოქი',              nameEn: 'Turnip',           minAgeMonths: 7 },
  { nameKa: 'ისპანახი',            nameEn: 'Spinach',          minAgeMonths: 8 },
  { nameKa: 'წიწიბურა',            nameEn: 'Sweet Potato',     minAgeMonths: 6 },
];

const FRUITS = [
  { nameKa: 'ვაშლი',      nameEn: 'Apple',        minAgeMonths: 6 },
  { nameKa: 'ბანანი',     nameEn: 'Banana',        minAgeMonths: 6 },
  { nameKa: 'მსხალი',     nameEn: 'Pear',          minAgeMonths: 6 },
  { nameKa: 'ატამი',      nameEn: 'Peach',         minAgeMonths: 6 },
  { nameKa: 'ქლიავი',     nameEn: 'Plum',          minAgeMonths: 6 },
  { nameKa: 'ავოკადო',    nameEn: 'Avocado',       minAgeMonths: 6 },
  { nameKa: 'ნესვი',      nameEn: 'Melon',         minAgeMonths: 8 },
  { nameKa: 'ჟოლო',      nameEn: 'Raspberry',      minAgeMonths: 8 },
  { nameKa: 'მარწყვი',   nameEn: 'Strawberry',     minAgeMonths: 8 },
  { nameKa: 'მანგო',     nameEn: 'Mango',           minAgeMonths: 6 },
  { nameKa: 'კივი',      nameEn: 'Kiwi',            minAgeMonths: 8 },
  { nameKa: 'ბლუბერი',   nameEn: 'Blueberry',      minAgeMonths: 8 },
  { nameKa: 'ალუბალი',   nameEn: 'Cherry',          minAgeMonths: 8 },
  { nameKa: 'მანდარინი', nameEn: 'Mandarin',        minAgeMonths: 8 },
  { nameKa: 'ყურძენი',   nameEn: 'Grape',           minAgeMonths: 10 },
  { nameKa: 'ანანასი',   nameEn: 'Pineapple',       minAgeMonths: 8 },
  { nameKa: 'საზამთრო',  nameEn: 'Watermelon',      minAgeMonths: 8 },
  { nameKa: 'ლეღვი',     nameEn: 'Fig',             minAgeMonths: 8 },
  { nameKa: 'კომში',     nameEn: 'Quince',          minAgeMonths: 8 },
  { nameKa: 'ბროწეული',  nameEn: 'Pomegranate',     minAgeMonths: 10 },
];

// Each suggestion: { titleKa, titleEn, texture, minAge, ingredientNames[] }
const SUGGESTIONS = [
  // Single-ingredient purees (6mo+)
  { titleKa: 'კარტოფილის პიურე',           titleEn: 'Potato Puree',           texture: 'puree',     min: 6,  ing: ['კარტოფილი'] },
  { titleKa: 'სტაფილოს პიურე',             titleEn: 'Carrot Puree',            texture: 'puree',     min: 6,  ing: ['სტაფილო'] },
  { titleKa: 'გოგრის პიურე',               titleEn: 'Pumpkin Puree',           texture: 'puree',     min: 6,  ing: ['გოგრა'] },
  { titleKa: 'ყაბაყის პიურე',              titleEn: 'Zucchini Puree',          texture: 'puree',     min: 6,  ing: ['ყაბაყი'] },
  { titleKa: 'ბარდის პიურე',               titleEn: 'Pea Puree',               texture: 'puree',     min: 6,  ing: ['ბარდა'] },
  { titleKa: 'ბროკოლის პიურე',             titleEn: 'Broccoli Puree',          texture: 'puree',     min: 7,  ing: ['ბროკოლი'] },
  { titleKa: 'ყვავილოვანი კომბოსტოს პიურე', titleEn: 'Cauliflower Puree',       texture: 'puree',     min: 7,  ing: ['ყვავილოვანი კომბოსტო'] },
  { titleKa: 'ვაშლის პიურე',               titleEn: 'Apple Puree',             texture: 'puree',     min: 6,  ing: ['ვაშლი'] },
  { titleKa: 'ბანანის პიურე',              titleEn: 'Banana Puree',            texture: 'puree',     min: 6,  ing: ['ბანანი'] },
  { titleKa: 'მსხლის პიურე',              titleEn: 'Pear Puree',              texture: 'puree',     min: 6,  ing: ['მსხალი'] },
  { titleKa: 'ატმის პიურე',               titleEn: 'Peach Puree',             texture: 'puree',     min: 6,  ing: ['ატამი'] },
  { titleKa: 'ქლიავის პიურე',             titleEn: 'Plum Puree',              texture: 'puree',     min: 6,  ing: ['ქლიავი'] },
  { titleKa: 'ავოკადოს პიურე',            titleEn: 'Avocado Puree',           texture: 'puree',     min: 6,  ing: ['ავოკადო'] },
  // Combos (7mo+)
  { titleKa: 'კარტოფილი + სტაფილო',       titleEn: 'Potato & Carrot Puree',   texture: 'puree',     min: 7,  ing: ['კარტოფილი', 'სტაფილო'] },
  { titleKa: 'კარტოფილი + გოგრა',         titleEn: 'Potato & Pumpkin Puree',  texture: 'puree',     min: 7,  ing: ['კარტოფილი', 'გოგრა'] },
  { titleKa: 'გოგრა + სტაფილო',           titleEn: 'Pumpkin & Carrot Puree',  texture: 'puree',     min: 7,  ing: ['გოგრა', 'სტაფილო'] },
  { titleKa: 'ბროკოლი + კარტოფილი',       titleEn: 'Broccoli & Potato Puree', texture: 'puree',     min: 7,  ing: ['ბროკოლი', 'კარტოფილი'] },
  { titleKa: 'ყვ.კომბოსტო + კარტოფილი',   titleEn: 'Cauliflower & Potato',    texture: 'puree',     min: 7,  ing: ['ყვავილოვანი კომბოსტო', 'კარტოფილი'] },
  { titleKa: 'ვაშლი + ბანანი',            titleEn: 'Apple & Banana Puree',    texture: 'puree',     min: 7,  ing: ['ვაშლი', 'ბანანი'] },
  { titleKa: 'ვაშლი + მსხალი',            titleEn: 'Apple & Pear Puree',      texture: 'puree',     min: 7,  ing: ['ვაშლი', 'მსხალი'] },
  { titleKa: 'ბანანი + ავოკადო',          titleEn: 'Banana & Avocado Puree',  texture: 'puree',     min: 7,  ing: ['ბანანი', 'ავოკადო'] },
  { titleKa: 'ატამი + ბანანი',            titleEn: 'Peach & Banana Puree',    texture: 'puree',     min: 7,  ing: ['ატამი', 'ბანანი'] },
  { titleKa: 'ქლიავი + ვაშლი',           titleEn: 'Plum & Apple Puree',      texture: 'puree',     min: 7,  ing: ['ქლიავი', 'ვაშლი'] },
  // Mashed / soft pieces (8mo+)
  { titleKa: 'კარტოფ. + ბარდა (დაწნეხილი)', titleEn: 'Potato & Pea Mash',   texture: 'mashed',    min: 8,  ing: ['კარტოფილი', 'ბარდა'] },
  { titleKa: 'ავოკადო + ბანანი (დაწნეხილი)', titleEn: 'Avocado & Banana Mash', texture: 'mashed',  min: 8,  ing: ['ავოკადო', 'ბანანი'] },
  { titleKa: 'ბროკოლი (ლმობიერი ნაჭრები)',  titleEn: 'Soft Broccoli Pieces',  texture: 'softPieces', min: 8, ing: ['ბროკოლი'] },
  { titleKa: 'ბანანი (ნახევარი)',           titleEn: 'Banana Halves',          texture: 'softPieces', min: 8, ing: ['ბანანი'] },
];

async function run() {
  console.log('Seeding baby ingredients...');

  async function upsertIngredient(data: { nameKa: string; nameEn: string; minAgeMonths: number }, category: string) {
    const existing = await p.babyIngredient.findFirst({ where: { nameEn: data.nameEn } });
    if (existing) return existing;
    return p.babyIngredient.create({ data: { ...data, category } });
  }

  const vegs = await Promise.all(VEGETABLES.map(v => upsertIngredient(v, 'vegetable')));
  const fruits = await Promise.all(FRUITS.map(f => upsertIngredient(f, 'fruit')));

  const allIngredients = [...vegs, ...fruits];
  const byKa = Object.fromEntries(allIngredients.map(i => [i.nameKa, i]));

  console.log(`Seeded ${allIngredients.length} ingredients`);
  console.log('Seeding baby meal suggestions...');

  let created = 0;
  for (const s of SUGGESTIONS) {
    // Check all ingredients exist
    const ingObjs = s.ing.map(name => byKa[name]).filter(Boolean);
    if (ingObjs.length !== s.ing.length) {
      console.warn(`Skipping "${s.titleKa}" — missing ingredient`);
      continue;
    }

    // Check if suggestion already exists
    const existing = await p.babyMealSuggestion.findFirst({ where: { titleEn: s.titleEn } });
    if (existing) continue;

    const suggestion = await p.babyMealSuggestion.create({
      data: {
        titleKa: s.titleKa,
        titleEn: s.titleEn,
        texture: s.texture,
        minAgeMonths: s.min,
        ingredientLinks: {
          create: ingObjs.map(ing => ({ ingredientId: ing.id })),
        },
      },
    });
    created++;
  }

  console.log(`Seeded ${created} meal suggestions`);
}

run().catch(console.error).finally(() => p.$disconnect());
