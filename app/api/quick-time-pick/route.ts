import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { narrowToStage } from '@/lib/pickDish';

// GET /api/quick-time-pick?childId=X&maxMinutes=Y (maxMinutes optional)
// Powers the dashboard "რამდენი დრო მაქვს?" picker — real dishes only, filtered by the
// same real Dish.prepTimeMinutes field feature 10's recipe-list time filters use. No
// maxMinutes → just returns which time buttons are worth showing at all (only times that
// at least one real, age-appropriate dish actually has — never a dead button). With
// maxMinutes → the matching dishes themselves, cheapest-time-first.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  if (!childId) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const where: any = {
    ageGroups: { has: child.ageGroup },
    prepTimeMinutes: { not: null },
  };
  if (child.allergies.length) where.NOT = { allergens: { hasSome: child.allergies } };

  let candidates = await prisma.dish.findMany({ where });
  candidates = narrowToStage(candidates, child.ageGroup);

  const BUCKETS = [10, 15, 20, 30, 45, 60];
  const availableTimes = BUCKETS.filter((b) => candidates.some((d) => (d.prepTimeMinutes ?? 999) <= b));

  const maxMinutesParam = req.nextUrl.searchParams.get('maxMinutes');
  let dishes: any[] = [];
  if (maxMinutesParam) {
    const maxMinutes = Number(maxMinutesParam);
    dishes = candidates
      .filter((d) => (d.prepTimeMinutes ?? 999) <= maxMinutes)
      .sort((a, b) => (a.prepTimeMinutes ?? 999) - (b.prepTimeMinutes ?? 999))
      .slice(0, 12);
  }

  return NextResponse.json({ availableTimes, dishes });
}
