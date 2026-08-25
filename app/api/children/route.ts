import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getAgeGroup, ageInMonths } from '@/lib/meal';
import { NextResponse } from 'next/server';

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

  if (ageInMonths(birthDate) < 6) {
    return NextResponse.json({ error: 'too_young', message: 'საიტის კონტენტი დაწყებულია 6 თვის ასაკიდან.' }, { status: 400 });
  }

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
