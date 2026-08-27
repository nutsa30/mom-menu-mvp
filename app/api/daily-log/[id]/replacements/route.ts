import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { scoreCandidates, narrowToStage } from '@/lib/pickDish';

// GET /api/daily-log/[id]/replacements — ranked "შემიცვალე" suggestions for one slot.
// Reuses the exact same candidate scoring the daily auto-fill (pickDish, in
// app/api/daily-log/route.ts) runs — age group, allergies, recent-7-day exclusion,
// same-day dedup, likes/dislikes text signal — via the shared lib/pickDish.ts, so a
// replacement is never weaker reasoning than what put the original dish there. On top of
// that it hard-excludes any dish this child has an explicit "არ მოეწონა" vote on, since a
// replacement is very often triggered by exactly that vote.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const log = await prisma.dailyLog.findFirst({
    where: { id: params.id, child: { userId: session.id } },
    include: { child: true },
  });
  if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const child = log.child;

  const where: any = { mealType: log.mealType, ageGroups: { has: child.ageGroup } };
  if (child.allergies.length) where.NOT = { allergens: { hasSome: child.allergies } };
  let candidates = await prisma.dish.findMany({ where });
  candidates = candidates.filter((d) => d.id !== log.dishId);
  // Consistently favor the child's current stage here (no randomized fallback like the
  // auto-fill uses) — a parent asking for an alternative wants their child's real stage.
  candidates = narrowToStage(candidates, child.ageGroup);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const [recentLogs, todayLogs, dislikeVotes] = await Promise.all([
    prisma.dailyLog.findMany({
      where: { childId: child.id, date: { gte: weekAgo.toISOString().split('T')[0] }, dishId: { not: null } },
      select: { dishId: true },
    }),
    prisma.dailyLog.findMany({
      where: { childId: child.id, date: log.date, dishId: { not: null } },
      select: { dishId: true },
    }),
    prisma.dishVote.findMany({ where: { childId: child.id, liked: false }, select: { dishId: true } }),
  ]);
  const recentIds = new Set<string>(recentLogs.map((l) => l.dishId).filter(Boolean) as string[]);
  const todayIds = new Set<string>(todayLogs.map((l) => l.dishId).filter(Boolean) as string[]);
  const votedDislikedIds = new Set<string>(dislikeVotes.map((v) => v.dishId));

  const scored = scoreCandidates(candidates, child.likes, child.dislikes, recentIds, todayIds, votedDislikedIds);

  return NextResponse.json(scored.slice(0, 12).map((s) => s.d));
}
