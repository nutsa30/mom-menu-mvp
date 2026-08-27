import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getMealTypesForAge } from '@/lib/meal';
import { pickDish, narrowToStage } from '@/lib/pickDish';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// GET /api/daily-log?childId=X&date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  const date = req.nextUrl.searchParams.get('date') ?? todayStr();
  if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { subscriptionStatus: true } });
  if (user?.subscriptionStatus !== 'FULL_PLAN') {
    return NextResponse.json({ error: 'full_plan_required' }, { status: 403 });
  }

  let logs = await prisma.dailyLog.findMany({
    where: { childId, date },
    include: { dish: true, ingredient: true, originalDish: true },
    orderBy: { mealType: 'asc' },
  });

  const ageMealTypes = getMealTypesForAge(child.birthDate);
  const existing = new Set(
    logs.filter((l) => l.dishId !== null || l.ingredientId !== null).map((l) => l.mealType)
  );
  const missing = ageMealTypes.filter((m) => !existing.has(m));

  if (missing.length) {
    // Dishes used in last 7 days (for variety penalty)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentLogs = await prisma.dailyLog.findMany({
      where: { childId, date: { gte: weekAgo.toISOString().split('T')[0] }, dishId: { not: null } },
      select: { dishId: true },
    });
    const recentIds = new Set<string>(recentLogs.map((l) => l.dishId).filter(Boolean) as string[]);

    // Dishes already picked today (no same-day repeats)
    const todayIds = new Set<string>(logs.map((l) => l.dishId).filter(Boolean) as string[]);

    for (const mealType of missing) {
      // Strict allergy filter
      const where: any = { mealType, ageGroups: { has: child.ageGroup } };
      if (child.allergies.length) where.NOT = { allergens: { hasSome: child.allergies } };
      let candidates = await prisma.dish.findMany({ where });

      // A dish also tagged for a group younger than this child's is a "simpler"
      // dish suited to an earlier stage — it should appear rarely once the child
      // has moved past that stage, not as routinely as dishes matched to their
      // current stage. Exclude such dishes from the pool most of the time rather
      // than relying on a score penalty, since a soft penalty already proved
      // insufficient to suppress a dish elsewhere in this function (see the hard
      // recency-exclusion above).
      candidates = narrowToStage(candidates, child.ageGroup, { randomize: true });

      const picked = pickDish(candidates, child.likes, child.dislikes, recentIds, todayIds);
      if (picked) todayIds.add(picked.id);

      // Only set dishId on create; never overwrite an already-assigned dish
      await prisma.dailyLog.upsert({
        where: { childId_date_mealType: { childId, date, mealType } },
        update: {},
        create: { childId, date, mealType, wasEaten: false, dishId: picked?.id ?? null },
      });
    }

    logs = await prisma.dailyLog.findMany({
      where: { childId, date },
      include: { dish: true, ingredient: true, originalDish: true },
      orderBy: { mealType: 'asc' },
    });
  }

  // Attach this child's vote (if any) for whatever dish is currently in each slot, so the
  // UI can show the "არ მოეწონა" button as already toggled without a separate request.
  const dishIds = logs.map((l) => l.dishId).filter(Boolean) as string[];
  const votes = dishIds.length
    ? await prisma.dishVote.findMany({ where: { childId, dishId: { in: dishIds } } })
    : [];
  const voteMap = Object.fromEntries(votes.map((v) => [v.dishId, v.liked]));
  const logsWithVotes = logs.map((l) => ({
    ...l,
    voteLiked: l.dishId && l.dishId in voteMap ? voteMap[l.dishId] : null,
  }));

  return NextResponse.json(logsWithVotes);
}

// POST /api/daily-log
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId, date, mealType, dishId } = await req.json();
  const d = date ?? todayStr();

  const log = await prisma.dailyLog.upsert({
    where: { childId_date_mealType: { childId, date: d, mealType } },
    update: { dishId: dishId ?? null },
    create: { childId, date: d, mealType, dishId: dishId ?? null, wasEaten: false },
    include: { dish: true },
  });

  return NextResponse.json(log);
}
