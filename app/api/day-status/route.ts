import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const VALID_MODES = new Set(['NOT_EATING', 'AWAY_FROM_HOME']);

// GET /api/day-status?childId=X&date=YYYY-MM-DD — feature 1 ("დღეს საერთოდ არ ჭამს") and
// feature 7 ("დღეს სახლში არ ვჭამთ") share this one shared "day mode" record. No row for a
// date means an ordinary day — this is an additive status, never a replacement for the
// existing daily-log/meal-plan flow.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  const date = req.nextUrl.searchParams.get('date');
  if (!childId || !date) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const status = await prisma.dayStatus.findUnique({ where: { childId_date: { childId, date } } });
  return NextResponse.json(status);
}

// POST /api/day-status — set (upsert) today's mode + reason for a child.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId, date, mode, reason } = await req.json();
  if (!childId || !date || !VALID_MODES.has(mode)) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const status = await prisma.dayStatus.upsert({
    where: { childId_date: { childId, date } },
    update: { mode, reason: reason ?? null },
    create: { childId, date, mode, reason: reason ?? null },
  });

  return NextResponse.json(status);
}

// DELETE /api/day-status?childId=X&date=YYYY-MM-DD — clear back to an ordinary day.
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  const date = req.nextUrl.searchParams.get('date');
  if (!childId || !date) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.dayStatus.deleteMany({ where: { childId, date } });
  return NextResponse.json({ success: true });
}
