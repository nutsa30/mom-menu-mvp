import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { plan } = body;

  if (!plan || !['FREE', 'RECIPE_PLAN', 'FULL_PLAN'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.id },
    data: {
      subscriptionStatus: plan,
      subscriptionStartedAt: plan !== 'FREE' ? new Date() : null,
      subscriptionCanceledAt: null,
    },
  });

  return NextResponse.json({ success: true });
}
