import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { plan, promoCode } = body;

  if (!plan || !['FREE', 'RECIPE_PLAN', 'FULL_PLAN'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  let promoCodeId: string | undefined;

  if (promoCode) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: promoCode.trim().toUpperCase() },
      include: { _count: { select: { users: true } } },
    });
    if (
      promo &&
      promo.isActive &&
      promo.planType === plan &&
      (promo.maxUses === null || promo._count.users < promo.maxUses)
    ) {
      promoCodeId = promo.id;
    }
  }

  await prisma.user.update({
    where: { id: session.id },
    data: {
      subscriptionStatus: plan,
      subscriptionStartedAt: plan === 'FREE' ? null : new Date(),
      subscriptionCanceledAt: null,
      ...(promoCodeId && { promoCodeId }),
    },
  });

  return NextResponse.json({ success: true });
}
