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

  // Marking a dish eaten doubles as an implicit "liked" vote; un-marking it retracts
  // that vote (but never touches an explicit "არ მოეწონა" — that's set to false above,
  // never re-flipped to true from here).
  if (body.wasEaten !== undefined && log.dishId) {
    if (body.wasEaten) {
      await prisma.dishVote.upsert({
        where: { dishId_childId: { dishId: log.dishId, childId: existing.childId } },
        update: { liked: true },
        create: { dishId: log.dishId, childId: existing.childId, liked: true },
      });
    } else {
      await prisma.dishVote.deleteMany({ where: { dishId: log.dishId, childId: existing.childId, liked: true } });
    }
  }

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
