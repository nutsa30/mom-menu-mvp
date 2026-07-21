import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type Nutrients = {
  calories?: number; proteinGrams?: number; fatGrams?: number;
  carbsGrams?: number; fiberGrams?: number;
  vitaminAmcg?: number; vitaminCmg?: number; vitaminDmcg?: number;
  vitaminEmg?: number; vitaminKmcg?: number; vitaminB6mg?: number;
  vitaminB12mcg?: number; folateMcg?: number; ironMg?: number;
  calciumMg?: number; zincMg?: number; potassiumMg?: number;
  magnesiumMg?: number; phosphorusMg?: number; omega3Mg?: number;
};

// Order matters — longer/more specific keywords first
const NUTRITION: { kw: string[]; n: Nutrients }[] = [
  // GRAINS
  { kw: ['შვრი'], n: { calories: 389, proteinGrams: 17, fatGrams: 7, carbsGrams: 66, fiberGrams: 10, ironMg: 4.3, magnesiumMg: 177, phosphorusMg: 523, zincMg: 4, vitaminB6mg: 0.1, potassiumMg: 429 } },
  { kw: ['ფეტვ'], n: { calories: 378, proteinGrams: 11, fatGrams: 4.2, carbsGrams: 73, fiberGrams: 8.5, ironMg: 3, magnesiumMg: 114, phosphorusMg: 285, zincMg: 1.7, vitaminB6mg: 0.2, potassiumMg: 195 } },
  { kw: ['წიწიბურ'], n: { calories: 343, proteinGrams: 13, fatGrams: 3.4, carbsGrams: 72, fiberGrams: 10, ironMg: 2.2, magnesiumMg: 231, phosphorusMg: 347, zincMg: 2.4, potassiumMg: 460 } },
  { kw: ['სიმინდ'], n: { calories: 86, proteinGrams: 3.2, fatGrams: 1.2, carbsGrams: 19, fiberGrams: 2.4, ironMg: 0.5, magnesiumMg: 37, phosphorusMg: 89, vitaminB6mg: 0.1, potassiumMg: 270 } },
  { kw: ['ბრინჯ'], n: { calories: 130, proteinGrams: 2.7, fatGrams: 0.3, carbsGrams: 28, fiberGrams: 0.4, ironMg: 0.8, magnesiumMg: 25, phosphorusMg: 115, vitaminB6mg: 0.1, potassiumMg: 35 } },
  { kw: ['პასტ', 'მაკარონ', 'ვერმიშ'], n: { calories: 131, proteinGrams: 5, fatGrams: 1, carbsGrams: 25, fiberGrams: 1.8, ironMg: 1, phosphorusMg: 76 } },

  // VEGETABLES — specific before generic
  { kw: ['ტკბილი კარტოფ', 'ბათ'], n: { calories: 86, proteinGrams: 1.6, fatGrams: 0.1, carbsGrams: 20, fiberGrams: 3, vitaminAmcg: 961, vitaminCmg: 3, vitaminB6mg: 0.3, potassiumMg: 337, calciumMg: 30, ironMg: 0.6 } },
  { kw: ['ყვავილოვანი კომბოსტ', 'ყვავ. კომბ'], n: { calories: 25, proteinGrams: 1.9, fatGrams: 0.3, carbsGrams: 5, fiberGrams: 2, vitaminCmg: 48, vitaminKmcg: 16, vitaminB6mg: 0.2, folateMcg: 57, potassiumMg: 299, calciumMg: 22, ironMg: 0.4 } },
  { kw: ['ბრიუსელის კომბოსტ'], n: { calories: 43, proteinGrams: 3.4, fatGrams: 0.3, carbsGrams: 9, fiberGrams: 3.8, vitaminCmg: 85, vitaminKmcg: 177, vitaminAmcg: 38, folateMcg: 61, ironMg: 1.4, calciumMg: 42, potassiumMg: 389 } },
  { kw: ['კომბოსტ'], n: { calories: 25, proteinGrams: 1.3, fatGrams: 0.1, carbsGrams: 6, fiberGrams: 2.5, vitaminCmg: 37, vitaminKmcg: 76, folateMcg: 43, calciumMg: 40, potassiumMg: 170 } },
  { kw: ['მწვანე ლობი'], n: { calories: 31, proteinGrams: 1.8, fatGrams: 0.2, carbsGrams: 7, fiberGrams: 3.4, vitaminCmg: 12, vitaminKmcg: 43, vitaminAmcg: 35, folateMcg: 33, calciumMg: 37, ironMg: 1, potassiumMg: 209 } },
  { kw: ['კარტოფ'], n: { calories: 77, proteinGrams: 2, fatGrams: 0.1, carbsGrams: 17, fiberGrams: 2.2, vitaminCmg: 20, vitaminB6mg: 0.3, potassiumMg: 425, ironMg: 0.8, magnesiumMg: 23, phosphorusMg: 57 } },
  { kw: ['სტაფილ'], n: { calories: 41, proteinGrams: 0.9, fatGrams: 0.2, carbsGrams: 10, fiberGrams: 2.8, vitaminAmcg: 835, vitaminCmg: 6, vitaminKmcg: 13, ironMg: 0.3, calciumMg: 33, potassiumMg: 320, phosphorusMg: 35 } },
  { kw: ['ბროკოლ'], n: { calories: 34, proteinGrams: 2.8, fatGrams: 0.4, carbsGrams: 7, fiberGrams: 2.6, vitaminCmg: 89, vitaminAmcg: 31, vitaminKmcg: 102, vitaminB6mg: 0.2, folateMcg: 63, ironMg: 0.7, calciumMg: 47, potassiumMg: 316, magnesiumMg: 21 } },
  { kw: ['გოგრ'], n: { calories: 26, proteinGrams: 1, fatGrams: 0.1, carbsGrams: 7, fiberGrams: 0.5, vitaminAmcg: 426, vitaminCmg: 9, vitaminEmg: 1.1, potassiumMg: 340, calciumMg: 21, ironMg: 0.8, magnesiumMg: 12 } },
  { kw: ['ისპანახ'], n: { calories: 23, proteinGrams: 2.9, fatGrams: 0.4, carbsGrams: 3.6, fiberGrams: 2.2, vitaminAmcg: 469, vitaminCmg: 28, vitaminKmcg: 483, vitaminB6mg: 0.2, folateMcg: 194, ironMg: 2.7, calciumMg: 99, magnesiumMg: 79, potassiumMg: 558 } },
  { kw: ['ჭარხალ'], n: { calories: 43, proteinGrams: 1.6, fatGrams: 0.2, carbsGrams: 10, fiberGrams: 2.8, vitaminCmg: 5, folateMcg: 109, potassiumMg: 325, ironMg: 0.8, magnesiumMg: 23, calciumMg: 16 } },
  { kw: ['ბადრიჯ'], n: { calories: 25, proteinGrams: 1, fatGrams: 0.2, carbsGrams: 6, fiberGrams: 3, vitaminCmg: 2.2, potassiumMg: 229, magnesiumMg: 14, folateMcg: 22 } },
  { kw: ['ბოლოკ'], n: { calories: 18, proteinGrams: 0.7, fatGrams: 0.1, carbsGrams: 4, fiberGrams: 1.6, vitaminCmg: 15, folateMcg: 25, potassiumMg: 233, calciumMg: 25 } },
  { kw: ['კიტრ'], n: { calories: 15, proteinGrams: 0.7, fatGrams: 0.1, carbsGrams: 3.6, fiberGrams: 0.5, vitaminCmg: 2.8, vitaminKmcg: 16, potassiumMg: 147, magnesiumMg: 13 } },
  { kw: ['პომიდ', 'ტომატ'], n: { calories: 18, proteinGrams: 0.9, fatGrams: 0.2, carbsGrams: 4, fiberGrams: 1.2, vitaminCmg: 14, vitaminAmcg: 42, vitaminKmcg: 8, potassiumMg: 237, ironMg: 0.3 } },
  { kw: ['პრასი'], n: { calories: 61, proteinGrams: 1.5, fatGrams: 0.3, carbsGrams: 14, fiberGrams: 1.8, vitaminKmcg: 47, vitaminAmcg: 83, vitaminCmg: 12, folateMcg: 64, calciumMg: 59, ironMg: 2.1 } },
  { kw: ['ასპარაგ'], n: { calories: 20, proteinGrams: 2.2, fatGrams: 0.1, carbsGrams: 3.9, fiberGrams: 2.1, vitaminCmg: 5.6, vitaminKmcg: 41, folateMcg: 52, vitaminB6mg: 0.1, potassiumMg: 202, calciumMg: 24 } },
  { kw: ['სელდერ'], n: { calories: 16, proteinGrams: 0.7, fatGrams: 0.2, carbsGrams: 3, fiberGrams: 1.6, vitaminKmcg: 29, vitaminCmg: 3, folateMcg: 36, potassiumMg: 260, calciumMg: 40 } },
  { kw: ['ტკბილი წიწაკ', 'ბულგარ. წიწ'], n: { calories: 31, proteinGrams: 1, fatGrams: 0.3, carbsGrams: 6, fiberGrams: 2.1, vitaminCmg: 128, vitaminAmcg: 157, vitaminB6mg: 0.3, vitaminKmcg: 7, folateMcg: 46, potassiumMg: 211 } },
  { kw: ['ნიახურ'], n: { calories: 36, proteinGrams: 3, fatGrams: 0.8, carbsGrams: 6.3, fiberGrams: 3.3, vitaminCmg: 133, vitaminKmcg: 1640, vitaminAmcg: 421, ironMg: 6.2, calciumMg: 138, folateMcg: 152 } },
  { kw: ['ხახვ', 'ბოლოქ'], n: { calories: 40, proteinGrams: 1.1, fatGrams: 0.1, carbsGrams: 9.3, fiberGrams: 1.7, vitaminCmg: 7.4, vitaminB6mg: 0.1, folateMcg: 19, potassiumMg: 146, calciumMg: 23 } },
  { kw: ['ნიორ'], n: { calories: 149, proteinGrams: 6.4, fatGrams: 0.5, carbsGrams: 33, fiberGrams: 2.1, vitaminCmg: 31, vitaminB6mg: 1.2, calciumMg: 181, ironMg: 1.7, potassiumMg: 401 } },
  { kw: ['ლობი'], n: { calories: 127, proteinGrams: 9, fatGrams: 0.5, carbsGrams: 23, fiberGrams: 11, ironMg: 5, folateMcg: 130, magnesiumMg: 45, phosphorusMg: 140, potassiumMg: 405, zincMg: 1.4 } },
  { kw: ['ოსპ'], n: { calories: 116, proteinGrams: 9, fatGrams: 0.4, carbsGrams: 20, fiberGrams: 8, ironMg: 3.3, folateMcg: 181, magnesiumMg: 36, phosphorusMg: 180, potassiumMg: 369, zincMg: 1.3 } },
  { kw: ['ნუტ', 'ჩიქლ'], n: { calories: 164, proteinGrams: 9, fatGrams: 2.6, carbsGrams: 27, fiberGrams: 8, ironMg: 2.9, folateMcg: 172, magnesiumMg: 48, phosphorusMg: 168, potassiumMg: 291, zincMg: 1.5 } },

  // FRUITS
  { kw: ['ბანან'], n: { calories: 89, proteinGrams: 1.1, fatGrams: 0.3, carbsGrams: 23, fiberGrams: 2.6, vitaminB6mg: 0.4, vitaminCmg: 9, vitaminAmcg: 3, potassiumMg: 358, magnesiumMg: 27, folateMcg: 20 } },
  { kw: ['ვაშლ'], n: { calories: 52, proteinGrams: 0.3, fatGrams: 0.2, carbsGrams: 14, fiberGrams: 2.4, vitaminCmg: 5, vitaminKmcg: 2, potassiumMg: 107, calciumMg: 6, folateMcg: 3 } },
  { kw: ['მსხალ'], n: { calories: 57, proteinGrams: 0.4, fatGrams: 0.1, carbsGrams: 15, fiberGrams: 3.1, vitaminCmg: 4, vitaminKmcg: 4, potassiumMg: 116, calciumMg: 9, folateMcg: 7 } },
  { kw: ['ატამ'], n: { calories: 39, proteinGrams: 0.9, fatGrams: 0.3, carbsGrams: 10, fiberGrams: 1.5, vitaminCmg: 7, vitaminAmcg: 16, vitaminKmcg: 3.5, potassiumMg: 190, folateMcg: 4 } },
  { kw: ['გარგარ'], n: { calories: 48, proteinGrams: 1.4, fatGrams: 0.4, carbsGrams: 11, fiberGrams: 2, vitaminAmcg: 96, vitaminCmg: 10, vitaminEmg: 0.9, vitaminKmcg: 3, potassiumMg: 259, ironMg: 0.4 } },
  { kw: ['მანგო'], n: { calories: 60, proteinGrams: 0.8, fatGrams: 0.4, carbsGrams: 15, fiberGrams: 1.6, vitaminAmcg: 54, vitaminCmg: 36, vitaminEmg: 0.9, vitaminKmcg: 4, potassiumMg: 168, folateMcg: 43 } },
  { kw: ['ავოკად'], n: { calories: 160, proteinGrams: 2, fatGrams: 15, carbsGrams: 9, fiberGrams: 6.7, vitaminEmg: 2.1, vitaminKmcg: 21, vitaminCmg: 10, vitaminB6mg: 0.3, folateMcg: 81, potassiumMg: 485, omega3Mg: 110, magnesiumMg: 29 } },
  { kw: ['ყურძენ'], n: { calories: 69, proteinGrams: 0.7, fatGrams: 0.2, carbsGrams: 18, fiberGrams: 0.9, vitaminCmg: 3, vitaminKmcg: 14, vitaminB6mg: 0.1, potassiumMg: 191, calciumMg: 10 } },
  { kw: ['ლურჯი მოც', 'ბლუბ'], n: { calories: 57, proteinGrams: 0.7, fatGrams: 0.3, carbsGrams: 14, fiberGrams: 2.4, vitaminCmg: 10, vitaminKmcg: 19, vitaminAmcg: 3, potassiumMg: 77, calciumMg: 6 } },
  { kw: ['ჟოლო'], n: { calories: 52, proteinGrams: 1.2, fatGrams: 0.7, carbsGrams: 12, fiberGrams: 6.5, vitaminCmg: 27, vitaminKmcg: 8, vitaminEmg: 0.9, folateMcg: 21, potassiumMg: 151, calciumMg: 25 } },
  { kw: ['მარწყვ'], n: { calories: 32, proteinGrams: 0.7, fatGrams: 0.3, carbsGrams: 8, fiberGrams: 2, vitaminCmg: 59, vitaminKmcg: 2, folateMcg: 24, potassiumMg: 153, calciumMg: 16 } },
  { kw: ['ნარინჯ', 'ფორთოხ'], n: { calories: 47, proteinGrams: 0.9, fatGrams: 0.1, carbsGrams: 12, fiberGrams: 2.4, vitaminCmg: 53, vitaminAmcg: 11, folateMcg: 30, calciumMg: 40, potassiumMg: 181 } },
  { kw: ['ლიმონ'], n: { calories: 29, proteinGrams: 1.1, fatGrams: 0.3, carbsGrams: 9.3, fiberGrams: 2.8, vitaminCmg: 53, potassiumMg: 138, calciumMg: 26 } },
  { kw: ['კივი'], n: { calories: 61, proteinGrams: 1.1, fatGrams: 0.5, carbsGrams: 15, fiberGrams: 3, vitaminCmg: 93, vitaminKmcg: 40, vitaminEmg: 1.5, folateMcg: 25, potassiumMg: 312, calciumMg: 34 } },
  { kw: ['ბალი', 'ალუბ'], n: { calories: 63, proteinGrams: 1.1, fatGrams: 0.2, carbsGrams: 16, fiberGrams: 2.1, vitaminCmg: 7, vitaminAmcg: 3, potassiumMg: 222, calciumMg: 13, ironMg: 0.4 } },
  { kw: ['ქიშმიშ'], n: { calories: 299, carbsGrams: 79, ironMg: 1.9, potassiumMg: 749, calciumMg: 50, fiberGrams: 3.7 } },

  // PROTEIN
  { kw: ['ქათამ', 'ქათ.'], n: { calories: 165, proteinGrams: 27, fatGrams: 3.6, ironMg: 1, zincMg: 2, vitaminB6mg: 0.9, vitaminB12mcg: 0.3, phosphorusMg: 220 } },
  { kw: ['ინდაურ'], n: { calories: 135, proteinGrams: 29, fatGrams: 1, ironMg: 1.4, zincMg: 2.4, vitaminB6mg: 0.9, vitaminB12mcg: 0.4, phosphorusMg: 245 } },
  { kw: ['საქონლ', 'ძროხ'], n: { calories: 250, proteinGrams: 26, fatGrams: 15, ironMg: 2.7, zincMg: 5, vitaminB12mcg: 2.1, vitaminB6mg: 0.4, phosphorusMg: 198 } },
  { kw: ['კვერცხ'], n: { calories: 155, proteinGrams: 13, fatGrams: 11, carbsGrams: 1.1, vitaminAmcg: 140, vitaminDmcg: 2, vitaminB12mcg: 0.9, vitaminEmg: 1, vitaminB6mg: 0.1, ironMg: 1.8, zincMg: 1.3, calciumMg: 56, phosphorusMg: 199 } },
  { kw: ['ორაგულ', 'სალმონ'], n: { calories: 208, proteinGrams: 25, fatGrams: 13, omega3Mg: 2260, vitaminDmcg: 14.4, vitaminB12mcg: 3.2, vitaminEmg: 3.6, phosphorusMg: 310, potassiumMg: 490 } },
  { kw: ['ტუნ'], n: { calories: 144, proteinGrams: 30, fatGrams: 1, omega3Mg: 270, vitaminDmcg: 4, vitaminB12mcg: 2.2, phosphorusMg: 326, potassiumMg: 441 } },
  { kw: ['თევზ'], n: { calories: 130, proteinGrams: 20, fatGrams: 5, omega3Mg: 400, vitaminDmcg: 4, vitaminB12mcg: 1, phosphorusMg: 200, potassiumMg: 350 } },

  // DAIRY
  { kw: ['კარაქ'], n: { calories: 717, proteinGrams: 0.9, fatGrams: 81, vitaminAmcg: 684, vitaminDmcg: 1.5, vitaminEmg: 2.3, vitaminKmcg: 7 } },
  { kw: ['ყველ'], n: { calories: 402, proteinGrams: 25, fatGrams: 33, carbsGrams: 1.3, calciumMg: 720, vitaminAmcg: 330, vitaminB12mcg: 1.1, phosphorusMg: 455, zincMg: 3.5 } },
  { kw: ['იოგ', 'კეფირ'], n: { calories: 61, proteinGrams: 3.5, fatGrams: 3.3, carbsGrams: 4.7, calciumMg: 110, vitaminDmcg: 0.1, vitaminB12mcg: 0.4, phosphorusMg: 95, potassiumMg: 141 } },
  { kw: ['რძ', 'ფორმულ'], n: { calories: 65, proteinGrams: 3.3, fatGrams: 3.9, carbsGrams: 5, calciumMg: 125, vitaminDmcg: 1.3, vitaminB12mcg: 0.5, vitaminAmcg: 46, phosphorusMg: 100, potassiumMg: 150 } },

  // NUTS & SEEDS
  { kw: ['ნუშ'], n: { calories: 579, proteinGrams: 21, fatGrams: 50, carbsGrams: 22, fiberGrams: 12.5, vitaminEmg: 25.6, calciumMg: 264, magnesiumMg: 270, phosphorusMg: 481, zincMg: 3.1, ironMg: 3.7 } },
  { kw: ['თხილ'], n: { calories: 628, proteinGrams: 15, fatGrams: 61, carbsGrams: 17, fiberGrams: 9.7, vitaminEmg: 15, calciumMg: 114, magnesiumMg: 163, phosphorusMg: 290, potassiumMg: 680 } },
  { kw: ['კაკალ'], n: { calories: 654, proteinGrams: 15, fatGrams: 65, carbsGrams: 14, fiberGrams: 6.7, vitaminEmg: 0.7, omega3Mg: 9080, magnesiumMg: 158, phosphorusMg: 346, potassiumMg: 441, calciumMg: 98 } },
  { kw: ['სეზამ', 'კუნჯ'], n: { calories: 573, proteinGrams: 17, fatGrams: 50, carbsGrams: 23, fiberGrams: 11.8, calciumMg: 975, ironMg: 14.6, magnesiumMg: 351, phosphorusMg: 629, zincMg: 7.8 } },

  // OILS & OTHER
  { kw: ['ზეთ'], n: { calories: 884, fatGrams: 100, vitaminEmg: 14, vitaminKmcg: 163 } },
];

const FIELDS: (keyof Nutrients)[] = [
  'calories', 'proteinGrams', 'fatGrams', 'carbsGrams', 'fiberGrams',
  'vitaminAmcg', 'vitaminCmg', 'vitaminDmcg', 'vitaminEmg', 'vitaminKmcg',
  'vitaminB6mg', 'vitaminB12mcg', 'folateMcg', 'ironMg', 'calciumMg',
  'zincMg', 'potassiumMg', 'magnesiumMg', 'phosphorusMg', 'omega3Mg',
];

function extractGrams(s: string): number {
  // Range like "20-25 გ" or "18-20 გ"
  const range = s.match(/(\d+(?:[,.]\d+)?)\s*[-–]\s*(\d+(?:[,.]\d+)?)\s*გ\b/);
  if (range) return (parseFloat(range[1]) + parseFloat(range[2])) / 2;
  // Single like "70 გ"
  const single = s.match(/(\d+(?:[,.]\d+)?)\s*გ\b/);
  if (single) return parseFloat(single[1]);
  // ml — treat ~80% as grams
  const ml = s.match(/(\d+(?:[,.]\d+)?)\s*[-–]?\s*(\d+(?:[,.]\d+)?)?\s*მლ\b/);
  if (ml) {
    const v = ml[2] ? (parseFloat(ml[1]) + parseFloat(ml[2])) / 2 : parseFloat(ml[1]);
    return v * 0.8;
  }
  // spoon measures
  if (s.includes('ს/კ') || s.includes('ს. კ')) return 15;
  if (s.includes('ჩ/კ') || s.includes('ჩ. კ')) return 5;
  // egg — ~55g each, but we just default
  if (s.match(/კვერცხ.*(1|2|3)/)) return parseInt(s.match(/კვერცხ.*(1|2|3)/)![1]) * 55;
  return 50; // default
}

function calcDishNutrients(ingredients: string[]): Nutrients {
  const totals: Nutrients = {};
  for (const ing of ingredients) {
    const lower = ing.toLowerCase();
    const entry = NUTRITION.find(e => e.kw.some(k => lower.includes(k)));
    if (!entry) continue;
    const grams = extractGrams(ing);
    const factor = grams / 100;
    for (const f of FIELDS) {
      if (entry.n[f] !== undefined) {
        (totals[f] as number) = ((totals[f] as number) || 0) + entry.n[f]! * factor;
      }
    }
  }
  // Round
  for (const f of FIELDS) {
    if ((totals[f] as number) > 0) {
      (totals[f] as number) = f === 'calories'
        ? Math.round(totals[f] as number)
        : Math.round((totals[f] as number) * 10) / 10;
    }
  }
  return totals;
}

async function main() {
  const dishes = await prisma.dish.findMany({
    select: { id: true, titleKa: true, ingredientsKa: true, vitaminCmg: true, ironMg: true },
  });

  let updated = 0;
  for (const dish of dishes) {
    // Skip dishes that already have manually entered data
    if (dish.vitaminCmg !== null && dish.ironMg !== null) {
      console.log(`⏭  skip (has data): ${dish.titleKa}`);
      continue;
    }
    const nutrients = calcDishNutrients(dish.ingredientsKa);
    if (Object.keys(nutrients).length === 0) {
      console.log(`⚠  no match: ${dish.titleKa}`);
      continue;
    }
    await prisma.dish.update({ where: { id: dish.id }, data: nutrients });
    updated++;
    console.log(`✓ ${dish.titleKa} — cal:${nutrients.calories}, C:${nutrients.vitaminCmg}mg, Fe:${nutrients.ironMg}mg`);
  }

  console.log(`\nDone. Updated ${updated} dishes.`);
}

main().finally(() => prisma.$disconnect());
