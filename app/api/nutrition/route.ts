import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Daily recommended intake by age group (WHO / NIH / USDA DRI)
const REC: Record<string, Record<string, number>> = {
  FROM_6: {
    calories: 700, proteinGrams: 11,
    carbsGrams: 95, fatGrams: 30, fiberGrams: 0,
    calciumMg: 270, ironMg: 11, zincMg: 3, potassiumMg: 700, magnesiumMg: 75, phosphorusMg: 275, sodiumMg: 370,
    vitaminAmcg: 500, vitaminCmg: 50, vitaminDmcg: 10, vitaminEmg: 5, vitaminKmcg: 2.5,
    vitaminB1mg: 0.3, vitaminB2mg: 0.4, vitaminB6mg: 0.3, vitaminB12mcg: 0.5, folateMcg: 80,
  },
  FROM_9: {
    calories: 850, proteinGrams: 12,
    carbsGrams: 110, fatGrams: 32, fiberGrams: 7,
    calciumMg: 270, ironMg: 11, zincMg: 3, potassiumMg: 700, magnesiumMg: 75, phosphorusMg: 275, sodiumMg: 370,
    vitaminAmcg: 500, vitaminCmg: 50, vitaminDmcg: 10, vitaminEmg: 5, vitaminKmcg: 2.5,
    vitaminB1mg: 0.3, vitaminB2mg: 0.4, vitaminB6mg: 0.3, vitaminB12mcg: 0.5, folateMcg: 80,
  },
  FROM_12: {
    calories: 1000, proteinGrams: 13,
    carbsGrams: 130, fatGrams: 35, fiberGrams: 14,
    calciumMg: 700, ironMg: 7, zincMg: 3, potassiumMg: 3000, magnesiumMg: 80, phosphorusMg: 460, sodiumMg: 800,
    vitaminAmcg: 300, vitaminCmg: 15, vitaminDmcg: 15, vitaminEmg: 6, vitaminKmcg: 30,
    vitaminB1mg: 0.5, vitaminB2mg: 0.5, vitaminB6mg: 0.5, vitaminB12mcg: 0.9, folateMcg: 150,
  },
  FROM_24: {
    calories: 1200, proteinGrams: 19,
    carbsGrams: 130, fatGrams: 39, fiberGrams: 22,
    calciumMg: 1000, ironMg: 10, zincMg: 5, potassiumMg: 3800, magnesiumMg: 130, phosphorusMg: 500, sodiumMg: 1200,
    vitaminAmcg: 400, vitaminCmg: 25, vitaminDmcg: 15, vitaminEmg: 7, vitaminKmcg: 55,
    vitaminB1mg: 0.6, vitaminB2mg: 0.6, vitaminB6mg: 0.6, vitaminB12mcg: 1.2, folateMcg: 200,
  },
};

const KEYS = [
  'calories', 'proteinGrams',
  'carbsGrams', 'fatGrams', 'fiberGrams',
  'calciumMg', 'ironMg', 'zincMg', 'potassiumMg', 'magnesiumMg', 'phosphorusMg', 'sodiumMg',
  'vitaminAmcg', 'vitaminCmg', 'vitaminDmcg', 'vitaminEmg', 'vitaminKmcg',
  'vitaminB1mg', 'vitaminB2mg', 'vitaminB6mg', 'vitaminB12mcg', 'folateMcg',
] as const;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10);
  if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  // "+ დაამატე რაც ჭამა" entries (ExtraFoodLog) are food outside the plan but still
  // really eaten — they feed the SAME totals below through the SAME per-key reduce, just
  // as a second source alongside planned-and-eaten DailyLog rows. One calculation.
  const [logs, extraLogs] = await Promise.all([
    prisma.dailyLog.findMany({
      where: { childId, wasEaten: true, date: { gte: cutoffStr } },
      include: { dish: true },
    }),
    prisma.extraFoodLog.findMany({
      where: { childId, date: { gte: cutoffStr } },
      include: { dish: true, ingredient: true },
    }),
  ]);

  // Aggregate per day
  const byDate: Record<string, Record<string, number>> = {};
  for (const log of logs) {
    if (!log.dish) continue;
    if (!byDate[log.date]) byDate[log.date] = {};
    for (const k of KEYS) {
      const val = (log.dish as any)[k] ?? 0;
      byDate[log.date][k] = (byDate[log.date][k] ?? 0) + val;
    }
  }
  for (const log of extraLogs) {
    const source = log.dish ?? log.ingredient;
    if (!source) continue; // free-text-only entry (no catalog match) — no nutrition data to add
    if (!byDate[log.date]) byDate[log.date] = {};
    for (const k of KEYS) {
      const val = (source as any)[k] ?? 0;
      byDate[log.date][k] = (byDate[log.date][k] ?? 0) + val;
    }
  }

  const uniqueDays = Object.keys(byDate).length;
  const totals: Record<string, number> = {};
  for (const k of KEYS) {
    totals[k] = Object.values(byDate).reduce((sum, d) => sum + (d[k] ?? 0), 0);
  }

  const rec = REC[child.ageGroup] ?? REC.FROM_24;

  // consumed = period total; recommended = daily target × requested days
  const analysis = KEYS.map((k) => ({
    key: k,
    consumed: Math.round(totals[k] * 10) / 10,
    recommended: Math.round(rec[k] * days * 10) / 10,
    pct: rec[k] > 0 ? Math.min(100, Math.round((totals[k] / (rec[k] * days)) * 100)) : 100,
  }));

  return NextResponse.json({ analysis, uniqueDays, ageGroup: child.ageGroup });
}
