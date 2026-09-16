import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { dishMatchesText } from '@/lib/pickDish';

// Feature 3, "დღეს რა გამომივიდა?" — a gentle, simple check of which food GROUPS showed
// up today, not a calorie count and not a nutrition dashboard (the existing /api/nutrition
// already covers that, separately). No new per-dish tagging: for a standalone Ingredient,
// its existing `type` (FRUIT | VEGETABLE) is used directly; for a Dish, presence is a
// simple keyword match against its real ingredientsKa/ingredientsEn/title text (the same
// substring-match approach lib/pickDish already uses for likes/dislikes), with the dish's
// real macro fields as a light supporting signal. Always approximate by nature — the
// framing stays "looks like a good mix" / "maybe add", never a precise measurement.
const GROUP_KEYWORDS: Record<string, string[]> = {
  ENERGY: ['კარტოფილ', 'ბრინჯ', 'მაკარონ', 'პურ', 'ფაფ', 'შვრია', 'სიმინდ', 'ბულგურ', 'ხორბალ', 'გოგრ'],
  PROTEIN: ['ხორც', 'ქათმ', 'თევზ', 'კვერცხ', 'ლობიო', 'ოსპ', 'ხაჭო', 'იოგურტ', 'ყველ', 'პარკოსან', 'ინდაურ'],
  VEGETABLE: ['ბროკოლ', 'სტაფილ', 'ყაბაყ', 'ჭარხალ', 'ისპანახ', 'პომიდორ', 'კიტრ', 'ბადრიჯან', 'წიწაკ', 'კომბოსტ', 'ხახვ'],
  FRUIT: ['ვაშლ', 'ბანან', 'მსხალ', 'ატამ', 'ქლიავ', 'საზამთრ', 'ნესვ', 'ყურძენ', 'მარწყვ', 'ჟოლო', 'მანდარინ', 'ფორთოხალ', 'კივი'],
  GRAIN: ['ბრინჯ', 'მაკარონ', 'პურ', 'ფაფ', 'შვრია', 'ხორბალ', 'ბულგურ', 'სიმინდ'],
  FAT: ['ზეთ', 'კარაქ', 'ავოკადო', 'ნაღებ', 'თხილ', 'კუნჟუტ'],
};
const GROUP_ORDER = ['ENERGY', 'PROTEIN', 'VEGETABLE', 'FRUIT', 'GRAIN', 'FAT'];

function dishGroups(dish: any): Set<string> {
  const present = new Set<string>();
  for (const g of GROUP_ORDER) {
    if (dishMatchesText(dish, GROUP_KEYWORDS[g])) present.add(g);
  }
  // Macro fields as a light supporting signal only — never the sole source, since a
  // missing macro value (many dishes don't have every field filled in) shouldn't read as
  // "this dish has none of that", only the keyword match speaks to absence.
  if ((dish.proteinGrams || 0) >= 3) present.add('PROTEIN');
  if ((dish.fatGrams || 0) >= 2) present.add('FAT');
  if ((dish.carbsGrams || 0) >= 5) { present.add('ENERGY'); present.add('GRAIN'); }
  return present;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  const date = req.nextUrl.searchParams.get('date') || new Date().toISOString().split('T')[0];
  if (!childId) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [dailyLogs, extraLogs] = await Promise.all([
    prisma.dailyLog.findMany({
      where: { childId, date, wasEaten: true },
      include: { dish: true, ingredient: true },
    }),
    prisma.extraFoodLog.findMany({
      where: { childId, date },
      include: { dish: true, ingredient: true },
    }),
  ]);

  const eatenCount = dailyLogs.length + extraLogs.length;
  const present = new Set<string>();

  for (const l of [...dailyLogs, ...extraLogs]) {
    if (l.dish) {
      for (const g of dishGroups(l.dish)) present.add(g);
    } else if (l.ingredient) {
      if (l.ingredient.type === 'FRUIT') present.add('FRUIT');
      if (l.ingredient.type === 'VEGETABLE') present.add('VEGETABLE');
    }
  }

  const groups: Record<string, boolean> = {};
  for (const g of GROUP_ORDER) groups[g] = present.has(g);

  // A couple of gentle, real suggestions for groups that are missing — never more than 2,
  // and never shown at all when nothing has been logged yet today (there's nothing to
  // react to, so nothing to suggest).
  let suggestions: { group: string; dish: any }[] = [];
  if (eatenCount > 0) {
    const missing = GROUP_ORDER.filter((g) => !groups[g]).slice(0, 2);
    if (missing.length > 0) {
      const dislikeVotes = await prisma.dishVote.findMany({ where: { childId, liked: false }, select: { dishId: true } });
      const dislikedIds = new Set(dislikeVotes.map((v) => v.dishId));
      const where: any = { ageGroups: { has: child.ageGroup }, id: { notIn: Array.from(dislikedIds) } };
      if (child.allergies.length) where.NOT = { allergens: { hasSome: child.allergies } };
      const pool = await prisma.dish.findMany({ where });

      for (const g of missing) {
        const match = pool.find((d) => dishMatchesText(d, GROUP_KEYWORDS[g]));
        if (match) suggestions.push({ group: g, dish: match });
      }
    }
  }

  return NextResponse.json({ date, eatenCount, groups, suggestions });
}
