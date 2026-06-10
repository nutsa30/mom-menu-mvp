import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/baby-meal-log
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId, suggestionId, ate, liked, refused, comment } = await req.json();
  if (!childId || !suggestionId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const log = await prisma.babyMealLog.create({
    data: {
      childId,
      suggestionId,
      ate: ate ?? false,
      liked: liked ?? null,
      refused: refused ?? null,
      comment: comment ?? null,
      eatenAt: new Date(),
    },
  });

  return NextResponse.json(log);
}

// GET /api/baby-meal-log?childId=X
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 });

  const child = await prisma.child.findFirst({ where: { id: childId, userId: session.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const logs = await prisma.babyMealLog.findMany({
    where: { childId },
    include: { suggestion: true },
    orderBy: { eatenAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(logs);
}
