import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSuitableAgeGroups } from '@/lib/meal';

/**
 * GET /api/baby-meal-suggestions/allowed-dishes?childId=X
 *
 * Same "only show once every ingredient has been tried" rule as
 * /api/baby-meal-suggestions/allowed, but against the real, photographed Dish
 * catalog instead of the separate BabyMealSuggestion combo list.
 *
 * Dish.ingredientsKa is free text (e.g. "ბროკოლი - 60 გ", "გაფცქვნილი ვაშლი - 60 გ"),
 * not a foreign key to BabyIngredient — so each ingredient line is matched against the
 * canonical BabyIngredient name list by substring (longest name first, so e.g. "ტკბილი
 * კარტოფილი" matches before the shorter "კარტოფილი"). Lines that don't match any tracked
 * fruit/vegetable (chicken, oats, water, etc.) aren't gated — this list only tracks
 * fruits/vegetables, not every ingredient a recipe could use.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [statuses, babyIngredients, dishes] = await Promise.all([
    prisma.babyIngredientStatus.findMany({ where: { childId } }),
    prisma.babyIngredient.findMany(),
    prisma.dish.findMany({
      where: { ageGroups: { hasSome: getSuitableAgeGroups(child.ageGroup) } },
      select: { id: true, titleKa: true, titleEn: true, imageUrl: true, ingredientsKa: true, mealType: true },
      orderBy: { titleKa: 'asc' },
    }),
  ]);

  const safeIds = new Set(statuses.filter(s => s.tried && !s.allergic).map(s => s.ingredientId));
  const allergicIds = new Set(statuses.filter(s => s.allergic).map(s => s.ingredientId));

  // Longest name first so "ტკბილი კარტოფილი" is checked (and wins) before "კარტოფილი".
  const sortedIngredients = [...babyIngredients].sort((a, b) => b.nameKa.length - a.nameKa.length);

  const matchIngredientLines = (lines: string[]) => {
    const matched = new Set<string>();
    for (const line of lines) {
      for (const ing of sortedIngredients) {
        if (line.includes(ing.nameKa)) {
          matched.add(ing.id);
          break;
        }
      }
    }
    return matched;
  };

  const allowed = dishes
    .map(d => ({ dish: d, matched: matchIngredientLines(d.ingredientsKa) }))
    .filter(({ matched }) => {
      if (matched.size === 0) return false; // no trackable ingredient — not a matchable recipe here
      for (const id of matched) {
        if (allergicIds.has(id)) return false;
        if (!safeIds.has(id)) return false;
      }
      return true;
    })
    .map(({ dish }) => dish);

  return NextResponse.json({
    dishes: allowed,
    safeCount: safeIds.size,
  });
}
