import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.dailyLog.findFirst({
    where: { id: params.id, child: { userId: session.id } },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();

  const log = await prisma.dailyLog.update({
    where: { id: params.id },
    data: {
      ...(body.wasEaten !== undefined ? { wasEaten: body.wasEaten } : {}),
      ...(body.dishId !== undefined ? { dishId: body.dishId } : {}),
    },
    include: { dish: true, ingredient: true },
  });

  return NextResponse.json(log);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.dailyLog.findFirst({
    where: { id: params.id, child: { userId: session.id } },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.dailyLog.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
