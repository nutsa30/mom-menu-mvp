import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

function getAgeGroup(birthDate: Date) {
  const now = new Date();
  const ageInMonths =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth());

  if (ageInMonths < 9) return 'FROM_6';
  if (ageInMonths < 12) return 'FROM_9';
  if (ageInMonths < 24) return 'FROM_12';
  return 'FROM_24';
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  if (userId !== session.id && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const children = await prisma.child.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(children);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const birthDate = new Date(body.birthDate);

  const child = await prisma.child.create({
    data: {
      name: body.name,
      birthDate,
      ageGroup: getAgeGroup(birthDate),
      allergies: body.allergies || [],
      dislikes: body.dislikes || [],
      likes: body.likes || [],
      userId: session.id,
    },
  });

  return NextResponse.json(child);
}
