import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/favorite-dishes?childId=X — "ჩემი ბავშვის საყვარელი კერძები ❤️". Built
// entirely from data the app already collects — how often a dish was actually marked
// eaten (DailyLog.wasEaten, plus ExtraFoodLog entries) and this child's explicit
// "ჭამა"/"არ მოეწონა" votes (DishVote) — not a second, separate popularity system.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [eatenCounts, extraCounts, likedVotes, dislikedVotes] = await Promise.all([
    prisma.dailyLog.groupBy({
      by: ['dishId'],
      where: { childId, wasEaten: true, dishId: { not: null } },
      _count: { dishId: true },
    }),
    prisma.extraFoodLog.groupBy({
      by: ['dishId'],
      where: { childId, dishId: { not: null } },
      _count: { dishId: true },
    }),
    prisma.dishVote.findMany({ where: { childId, liked: true }, select: { dishId: true } }),
    prisma.dishVote.findMany({ where: { childId, liked: false }, select: { dishId: true } }),
  ]);

  const dislikedIds = new Set(dislikedVotes.map((v) => v.dishId));
  const likedIds = new Set(likedVotes.map((v) => v.dishId));

  const countMap = new Map<string, number>();
  for (const row of eatenCounts) {
    if (!row.dishId) continue;
    countMap.set(row.dishId, (countMap.get(row.dishId) ?? 0) + row._count.dishId);
  }
  for (const row of extraCounts) {
    if (!row.dishId) continue;
    countMap.set(row.dishId, (countMap.get(row.dishId) ?? 0) + row._count.dishId);
  }

  // A dish an explicit vote marked disliked never counts as a favorite, even if an
  // earlier "ჭამა" toggle logged it before the dislike was recorded.
  const ranked = Array.from(countMap.entries())
    .filter(([dishId]) => !dislikedIds.has(dishId))
    .map(([dishId, count]) => ({ dishId, count: count + (likedIds.has(dishId) ? 1 : 0) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  if (ranked.length === 0) return NextResponse.json([]);

  const dishes = await prisma.dish.findMany({ where: { id: { in: ranked.map((r) => r.dishId) } } });
  const dishMap = Object.fromEntries(dishes.map((d) => [d.id, d]));

  const result = ranked
    .filter((r) => dishMap[r.dishId])
    .map((r) => ({ ...dishMap[r.dishId], eatenCount: r.count }));

  return NextResponse.json(result);
}
