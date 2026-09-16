import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { narrowToStage } from '@/lib/pickDish';

// GET /api/day-status/simple-suggestions?childId=X — feeds the "NOT_EATING" day-mode
// banner (feature 1) with a few genuinely simple ideas for a day the child isn't eating
// much. "Simple" here is real, not invented: dishes with the fewest recorded ingredients
// for this child's age group — no new "simplicity" tagging, no separate recipe pool.
// This is explicitly NOT medical guidance and never claims to be.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  if (!childId) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const dislikeVotes = await prisma.dishVote.findMany({ where: { childId, liked: false }, select: { dishId: true } });
  const dislikedIds = dislikeVotes.map((v) => v.dishId);

  const where: any = { ageGroups: { has: child.ageGroup }, id: { notIn: dislikedIds } };
  if (child.allergies.length) where.NOT = { allergens: { hasSome: child.allergies } };

  let candidates = await prisma.dish.findMany({ where });
  candidates = narrowToStage(candidates, child.ageGroup);

  const withIngredientCount = candidates
    .map((d) => ({ d, count: (d.ingredientsKa?.length || d.ingredientsEn?.length || 99) }))
    .filter((c) => c.count > 0)
    .sort((a, b) => a.count - b.count)
    .slice(0, 3)
    .map((c) => c.d);

  return NextResponse.json(withIngredientCount);
}
