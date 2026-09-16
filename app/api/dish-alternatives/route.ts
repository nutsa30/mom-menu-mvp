import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/dish-alternatives?childId=X&dishId=Y — feature 5, "იგივე პროდუქტი — სხვანაირად".
// A dish getting an explicit "არ მოეწონა" vote doesn't mean the CHILD dislikes every
// ingredient in it forever — often it's that one preparation. This finds other real dishes
// that share at least one of this dish's actual ingredients (Dish.ingredientsKa/En — real
// catalog data, never invented), so a disliked broccoli soup can surface a broccoli
// something-else instead of just dropping broccoli from the rotation.
//
// Deliberately a separate, additive endpoint — NOT a change to
// /api/daily-log/[id]/replacements, which already does a different, working job (ranked
// general substitute via lib/pickDish's full scoring). This one is narrower and
// ingredient-anchored; the two are meant to be offered side by side, not merged.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  const dishId = req.nextUrl.searchParams.get('dishId');
  if (!childId || !dishId) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
    select: { id: true, ingredientsKa: true, ingredientsEn: true },
  });
  if (!dish || (dish.ingredientsKa.length === 0 && dish.ingredientsEn.length === 0)) {
    // No recorded ingredients to anchor on — nothing honest to suggest here.
    return NextResponse.json([]);
  }

  const dislikeVotes = await prisma.dishVote.findMany({
    where: { childId, liked: false },
    select: { dishId: true },
  });
  const dislikedIds = new Set(dislikeVotes.map((v) => v.dishId));
  dislikedIds.add(dishId); // never re-suggest the exact dish that was just disliked

  const where: any = {
    ageGroups: { has: child.ageGroup },
    id: { notIn: Array.from(dislikedIds) },
    OR: [
      ...(dish.ingredientsKa.length ? [{ ingredientsKa: { hasSome: dish.ingredientsKa } }] : []),
      ...(dish.ingredientsEn.length ? [{ ingredientsEn: { hasSome: dish.ingredientsEn } }] : []),
    ],
  };
  if (child.allergies.length) where.NOT = { allergens: { hasSome: child.allergies } };

  const candidates = await prisma.dish.findMany({ where, take: 20 });

  // Prefer dishes sharing MORE of the original's ingredients — a stronger "same product"
  // connection — over ones that just happen to share one.
  const overlapCount = (d: (typeof candidates)[number]) => {
    const kaOverlap = d.ingredientsKa.filter((i) => dish.ingredientsKa.includes(i)).length;
    const enOverlap = d.ingredientsEn.filter((i) => dish.ingredientsEn.includes(i)).length;
    return kaOverlap + enOverlap;
  };
  const ranked = candidates
    .map((d) => ({ d, score: overlapCount(d) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((s) => s.d);

  return NextResponse.json(ranked);
}
