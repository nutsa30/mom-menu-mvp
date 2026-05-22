import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

async function adminGuard() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return null;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const guard = await adminGuard();
  if (guard) return guard;

  const body = await req.json();
  const maxOrder = await prisma.mealPlanItem.findFirst({
    where: { mealPlanId: params.id },
    orderBy: { sortOrder: 'desc' },
  });

  const item = await prisma.mealPlanItem.create({
    data: {
      mealPlanId: params.id,
      dishId: body.dishId,
      mealType: body.mealType,
      sortOrder: (maxOrder?.sortOrder ?? 0) + 1,
    },
    include: { dish: true },
  });
  return NextResponse.json(item);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get('itemId');
  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 });

  await prisma.mealPlanItem.delete({ where: { id: itemId } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { itemId, direction } = await req.json() as { itemId: string; direction: 'up' | 'down' };

  const items = await prisma.mealPlanItem.findMany({
    where: { mealPlanId: params.id },
    orderBy: { sortOrder: 'asc' },
  });

  const idx = items.findIndex((i) => i.id === itemId);
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return NextResponse.json({ ok: true });

  const a = items[idx];
  const b = items[swapIdx];
  await prisma.$transaction([
    prisma.mealPlanItem.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.mealPlanItem.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);
  return NextResponse.json({ success: true });
}
