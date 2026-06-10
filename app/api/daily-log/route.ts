import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSuitableAgeGroups } from '@/lib/meal';

const MEAL_TYPES = ['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER'] as const;

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function pickDish(dishes: any[], likes: string[], dislikes: string[]) {
  if (!dishes.length) return null;
  const scored = dishes.map((d) => {
    const text = `${d.titleKa} ${d.titleEn} ${d.ingredientsKa.join(' ')} ${d.ingredientsEn.join(' ')}`.toLowerCase();
    const likeScore = likes.filter((l) => text.includes(l.toLowerCase())).length;
    const dislikeScore = dislikes.filter((dl) => text.includes(dl.toLowerCase())).length;
    return { d, score: likeScore - dislikeScore };
  });
  scored.sort((a, b) => b.score - a.score);
  // pick randomly from top-scored group
  const topScore = scored[0].score;
  const top = scored.filter((s) => s.score === topScore);
  return top[Math.floor(Math.random() * top.length)].d;
}

// GET /api/daily-log?childId=X&date=YYYY-MM-DD — also auto-generates if missing
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  const date = req.nextUrl.searchParams.get('date') ?? todayStr();
  if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 });

  // Verify child belongs to user
  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let logs = await prisma.dailyLog.findMany({
    where: { childId, date },
    include: { dish: true, ingredient: true },
    orderBy: { mealType: 'asc' },
  });

  // Auto-generate missing meal slots
  const existing = new Set(
    logs.filter((l) => l.dishId !== null || l.ingredientId !== null).map((l) => l.mealType)
  );
  const missing = MEAL_TYPES.filter((m) => !existing.has(m));

  if (missing.length) {
    for (const mealType of missing) {
      let logData: any = { childId, date, mealType, wasEaten: false };

      const where: any = { mealType, ageGroups: { hasSome: getSuitableAgeGroups(child.ageGroup) } };
      if (child.allergies.length) where.NOT = { allergens: { hasSome: child.allergies } };
      const candidates = await prisma.dish.findMany({ where });

      const picked = pickDish(candidates, child.likes, child.dislikes);
      await prisma.dailyLog.upsert({
        where: { childId_date_mealType: { childId, date, mealType } },
        update: { dishId: picked?.id ?? null, ingredientId: null },
        create: { ...logData, dishId: picked?.id ?? null },
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

// POST /api/daily-log — update dishId or wasEaten inline (also used for substitute)
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
