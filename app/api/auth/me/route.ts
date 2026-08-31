import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    subscriptionStatus: user.subscriptionStatus,
    billingIntervalMonths: user.billingIntervalMonths,
    subscriptionStartedAt: user.subscriptionStartedAt,
    subscriptionCanceledAt: user.subscriptionCanceledAt,
    createdAt: user.createdAt,
    // Already redeemed a friend's referral code — the subscription page uses this to show
    // the shorter 3-day trial up front, before any purchase, matching what the BOG webhook
    // will actually grant at checkout.
    hasReferral: !!user.referredByUserId,
  });
}