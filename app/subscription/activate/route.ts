import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.user.update({
    where: { id: session.id },
    data: { subscriptionStatus: 'FULL_PLAN', subscriptionStartedAt: new Date(), subscriptionCanceledAt: null },
  });

  return NextResponse.json({ success: true });
}
