import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getMealTypesForAge, AGE_GROUP_ORDER } from '@/lib/meal';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function dishMatchesText(dish: any, terms: string[]): boolean {
  const text = [
    dish.titleKa, dish.titleEn,
    ...(dish.ingredientsKa || []),
    ...(dish.ingredientsEn || []),
    ...(dish.allergens || []),
  ].join(' ').toLowerCase();
  return terms.some((t) => text.includes(t.toLowerCase()));
}

function nutritionScore(dish: any): number {
  return (
    (dish.ironMg || 0) * 4 +
    (dish.calciumMg || 0) / 30 +
    (dish.vitaminCmg || 0) / 5 +
    (dish.vitaminAmcg || 0) / 80 +
    (dish.proteinGrams || 0) / 3 +
    (dish.vitaminDmcg || 0) * 2 +
    (dish.fiberGrams || 0) / 2
  );
}

function pickDish(
  candidates: any[],
  likes: string[],
  dislikes: string[],
  recentIds: Set<string>,
  todayIds: Set<string>
): any | null {
  if (!candidates.length) return null;

  // Prefer dishes not used today; fall back to full pool only if nothing else
  const notToday = candidates.filter((d) => !todayIds.has(d.id));
  const pool1 = notToday.length > 0 ? notToday : candidates;

  // Hard-exclude dishes used in the last 7 days (not just a score penalty) —
  // a dish with a genuinely higher nutrition score than its neighbors (e.g.
  // an iron-rich breakfast) could outscore a -10 penalty every day, so it
  // kept winning day after day regardless of recency. Only fall back to the
  // recently-used pool if excluding them would leave nothing (thin catalog
  // for this age group / allergy combination).
  const notRecent = pool1.filter((d) => !recentIds.has(d.id));
  const pool = notRecent.length > 0 ? notRecent : pool1;

  const scored = pool.map((d) => {
    let score = nutritionScore(d);

    // Small like bonus
    if (likes.length && dishMatchesText(d, likes)) score += 2;

    // Dislike penalty (soft — dish still appears but rarely)
    if (dislikes.length && dishMatchesText(d, dislikes)) score -= 6;

    // Small random nudge so identical-score dishes vary
    score += Math.random() * 0.5;

    return { d, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Pick from top 3 for variety
  const top = scored.slice(0, Math.min(3, scored.length));
  return top[Math.floor(Math.random() * top.length)].d;
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
    include: { dish: true, ingredient: true },
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
      const childAgeIdx = AGE_GROUP_ORDER.indexOf(child.ageGroup);
      if (childAgeIdx > 0) {
        const stageMatched = candidates.filter(
          (d) => !d.ageGroups.some((ag: string) => AGE_GROUP_ORDER.indexOf(ag as any) < childAgeIdx)
        );
        if (stageMatched.length > 0 && Math.random() > 0.15) candidates = stageMatched;
      }

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
      include: { dish: true, ingredient: true },
      orderBy: { mealType: 'asc' },
    });
  }

  return NextResponse.json(logs);
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
