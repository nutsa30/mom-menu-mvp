import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { scoreCandidates, narrowToStage } from '@/lib/pickDish';

// GET /api/weekly-summary?childId=X — feature 9, "კვირის შეჯამება". Rolling last 7 days
// (not calendar Mon–Sun), built entirely from data that already exists — DailyLog.wasEaten,
// ExtraFoodLog, DishVote — no new tables, no calorie counting, no nutrition dashboard.
// Deliberately framed positively throughout: "new" and "repeated" are both just facts, never
// scored as good/bad, per the owner's explicit "not a bad week" requirement.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  if (!childId) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [thisWeekLogs, thisWeekExtra, priorDailyLogs, priorExtra, likedVotes] = await Promise.all([
    prisma.dailyLog.findMany({
      where: { childId, wasEaten: true, date: { gte: weekAgoStr, lte: todayStr } },
      include: { dish: { select: { id: true, titleKa: true, titleEn: true, imageUrl: true } } },
    }),
    prisma.extraFoodLog.findMany({
      where: { childId, date: { gte: weekAgoStr, lte: todayStr } },
      include: {
        dish: { select: { id: true, titleKa: true, titleEn: true, imageUrl: true } },
        ingredient: { select: { id: true, titleKa: true, titleEn: true, imageUrl: true } },
      },
    }),
    // All-time, BEFORE this week's window — just distinct dish/ingredient ids, to tell
    // "tried for the very first time this week" apart from "eaten again this week".
    prisma.dailyLog.findMany({
      where: { childId, wasEaten: true, date: { lt: weekAgoStr } },
      select: { dishId: true, ingredientId: true },
    }),
    prisma.extraFoodLog.findMany({
      where: { childId, date: { lt: weekAgoStr } },
      select: { dishId: true, ingredientId: true },
    }),
    prisma.dishVote.findMany({ where: { childId, liked: true }, select: { dishId: true } }),
  ]);

  const priorIds = new Set<string>();
  for (const l of [...priorDailyLogs, ...priorExtra]) {
    if (l.dishId) priorIds.add(`dish:${l.dishId}`);
    if (l.ingredientId) priorIds.add(`ing:${l.ingredientId}`);
  }

  type Item = { key: string; id: string; kind: 'dish' | 'ingredient'; titleKa: string; titleEn: string; imageUrl: string | null };
  const thisWeekItems: Item[] = [];
  for (const l of thisWeekLogs) {
    if (l.dish) thisWeekItems.push({ key: `dish:${l.dish.id}`, id: l.dish.id, kind: 'dish', titleKa: l.dish.titleKa, titleEn: l.dish.titleEn, imageUrl: l.dish.imageUrl });
  }
  for (const l of thisWeekExtra) {
    if (l.dish) thisWeekItems.push({ key: `dish:${l.dish.id}`, id: l.dish.id, kind: 'dish', titleKa: l.dish.titleKa, titleEn: l.dish.titleEn, imageUrl: l.dish.imageUrl });
    else if (l.ingredient) thisWeekItems.push({ key: `ing:${l.ingredient.id}`, id: l.ingredient.id, kind: 'ingredient', titleKa: l.ingredient.titleKa, titleEn: l.ingredient.titleEn, imageUrl: l.ingredient.imageUrl });
  }

  const byKey = new Map<string, Item & { count: number }>();
  for (const it of thisWeekItems) {
    const existing = byKey.get(it.key);
    if (existing) existing.count += 1;
    else byKey.set(it.key, { ...it, count: 1 });
  }
  const distinctThisWeek = Array.from(byKey.values());

  const newThisWeek = distinctThisWeek.filter((it) => !priorIds.has(it.key));
  const repeated = distinctThisWeek.filter((it) => it.count >= 2);

  const likedDishIds = new Set(likedVotes.map((v) => v.dishId));
  const likedThisWeek = distinctThisWeek.filter((it) => it.kind === 'dish' && likedDishIds.has(it.id));

  // "რა შეიძლება დაემატოს შემდეგ კვირას" — a couple of positively-framed real suggestions,
  // reusing the exact same candidate scoring the daily auto-fill and "სხვა" substitute use
  // (lib/pickDish), so this is never a weaker recommendation than the rest of the app makes.
  const eatenThisWeekDishIds = new Set(distinctThisWeek.filter((it) => it.kind === 'dish').map((it) => it.id));
  const dislikeVotes = await prisma.dishVote.findMany({ where: { childId, liked: false }, select: { dishId: true } });
  const dislikedDishIds = new Set(dislikeVotes.map((v) => v.dishId));

  const where: any = { ageGroups: { has: child.ageGroup }, id: { notIn: Array.from(dislikedDishIds) } };
  if (child.allergies.length) where.NOT = { allergens: { hasSome: child.allergies } };
  let candidates = await prisma.dish.findMany({ where });
  candidates = narrowToStage(candidates, child.ageGroup);
  const scored = scoreCandidates(candidates, child.likes, child.dislikes, eatenThisWeekDishIds, new Set(), dislikedDishIds);
  const suggestions = scored.slice(0, 3).map((s) => s.d);

  return NextResponse.json({
    days: 7,
    distinctCount: distinctThisWeek.length,
    newCount: newThisWeek.length,
    newItems: newThisWeek.slice(0, 12),
    likedItems: likedThisWeek.slice(0, 12),
    repeatedItems: repeated.slice(0, 12),
    suggestions,
  });
}
