import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/food-introduction?childId=X
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const items = await prisma.foodIntroduction.findMany({
    where: { childId },
    orderBy: { startedAt: 'desc' },
  });

  return NextResponse.json(items);
}

// POST /api/food-introduction — start introducing a new food
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId, foodName, startedAt } = await req.json();
  if (!childId || !foodName) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Only one INTRODUCING at a time
  await prisma.foodIntroduction.updateMany({
    where: { childId, status: 'INTRODUCING' },
    data: { status: 'SAFE' },
  });

  const item = await prisma.foodIntroduction.create({
    data: {
      childId,
      foodName,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      status: 'INTRODUCING',
    },
  });

  return NextResponse.json(item);
}

// PATCH /api/food-introduction?id=X — update status
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { status, notes } = await req.json();

  const item = await prisma.foodIntroduction.update({
    where: { id },
    data: { ...(status && { status }), ...(notes !== undefined && { notes }) },
  });

  return NextResponse.json(item);
}

// DELETE /api/food-introduction?id=X
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.foodIntroduction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
