import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/dish-votes — upsert this child's like/dislike vote for a dish. Pinned to the
// dish it was cast for, independent of whatever gets swapped into that meal slot later.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId, dishId, liked } = await req.json();
  if (!childId || !dishId || typeof liked !== 'boolean') {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const vote = await prisma.dishVote.upsert({
    where: { dishId_childId: { dishId, childId } },
    update: { liked },
    create: { dishId, childId, liked },
  });

  return NextResponse.json(vote);
}

// DELETE /api/dish-votes?childId=X&dishId=Y — retract a vote (e.g. un-toggling "ჭამა").
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  const dishId = req.nextUrl.searchParams.get('dishId');
  if (!childId || !dishId) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.dishVote.deleteMany({ where: { childId, dishId } });
  return NextResponse.json({ success: true });
}
