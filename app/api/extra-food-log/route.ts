import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// GET /api/extra-food-log?childId=X&date=YYYY-MM-DD — food logged outside the plan
// ("+ დაამატე რაც ჭამა"), for the "დღეს რა ჭამა?" digest.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  const date = req.nextUrl.searchParams.get('date') ?? todayStr();
  if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const logs = await prisma.extraFoodLog.findMany({
    where: { childId, date },
    include: { dish: true, ingredient: true },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(logs);
}

// POST /api/extra-food-log — "+ დაამატე რაც ჭამა". dishId/ingredientId point at the same
// catalog DailyLog uses (so /api/nutrition can credit real nutrition data); note is a
// free-text fallback for anything not in the catalog (no nutrition impact then, but still
// kept in the child's real eating history for the parent's own record).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId, date, dishId, ingredientId, note } = await req.json();
  if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 });
  const trimmedNote = typeof note === 'string' ? note.trim().slice(0, 200) : '';
  if (!dishId && !ingredientId && !trimmedNote) {
    return NextResponse.json({ error: 'nothing_to_log' }, { status: 400 });
  }

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const log = await prisma.extraFoodLog.create({
    data: {
      childId,
      date: date ?? todayStr(),
      dishId: dishId ?? null,
      ingredientId: ingredientId ?? null,
      note: trimmedNote || null,
    },
    include: { dish: true, ingredient: true },
  });

  return NextResponse.json(log);
}

// DELETE /api/extra-food-log?id=X — undo a mistaken add
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const existing = await prisma.extraFoodLog.findFirst({ where: { id, child: { userId: session.id } } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.extraFoodLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
