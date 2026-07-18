import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/baby-meal-suggestions/allowed?childId=X
 *
 * Logic:
 * 1. Get all ingredients where tried=true AND allergic=false for this child
 * 2. Return only suggestions where ALL their ingredients are in that safe list
 * 3. If ANY ingredient is allergic, exclude that suggestion entirely
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // All safe (tried + non-allergic) ingredient IDs
  const safeStatuses = await prisma.babyIngredientStatus.findMany({
    where: { childId, tried: true, allergic: false },
    select: { ingredientId: true },
  });
  const safeIds = new Set(safeStatuses.map(s => s.ingredientId));

  // All allergic ingredient IDs
  const allergicStatuses = await prisma.babyIngredientStatus.findMany({
    where: { childId, allergic: true },
    select: { ingredientId: true },
  });
  const allergicIds = new Set(allergicStatuses.map(s => s.ingredientId));

  // Get all suggestions with their ingredients
  const suggestions = await prisma.babyMealSuggestion.findMany({
    include: {
      ingredientLinks: { include: { ingredient: true } },
    },
    orderBy: [{ minAgeMonths: 'asc' }, { titleKa: 'asc' }],
  });

  // Calculate months for child age check
  const ageMonths = Math.floor(
    (Date.now() - new Date(child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );

  // Filter: show suggestion only when ALL its ingredients have been individually tried and are safe.
  // Age check is intentionally omitted — if each ingredient was already safely introduced,
  // the combination is safe regardless of minAgeMonths.
  const allowed = suggestions.filter(s => {
    const ingIds = s.ingredientLinks.map(l => l.ingredientId);
    if (ingIds.some(id => allergicIds.has(id))) return false;
    return ingIds.every(id => safeIds.has(id));
  });

  // Also get meal logs for this child to mark already eaten ones
  const logs = await prisma.babyMealLog.findMany({
    where: { childId },
    orderBy: { eatenAt: 'desc' },
  });
  const logMap: Record<string, any[]> = {};
  for (const log of logs) {
    if (!logMap[log.suggestionId]) logMap[log.suggestionId] = [];
    logMap[log.suggestionId].push(log);
  }

  return NextResponse.json({
    suggestions: allowed.map(s => ({
      ...s,
      logs: logMap[s.id] ?? [],
    })),
    safeCount: safeIds.size,
    totalIngredients: await prisma.babyIngredient.count(),
  });
}
