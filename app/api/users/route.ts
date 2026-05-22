import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, role: true,
      isBlocked: true, subscriptionStatus: true,
      subscriptionStartedAt: true, subscriptionCanceledAt: true,
      createdAt: true,
      _count: { select: { children: true } },
    },
  });
  return NextResponse.json(users);
}
