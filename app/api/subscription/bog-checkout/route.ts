import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createTrialOrder, createDirectOrder, isBillingInterval } from '@/lib/bog';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { interval } = await req.json();
    if (!isBillingInterval(interval)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (
      user.subscriptionStatus === 'FULL_PLAN' &&
      user.billingIntervalMonths === interval &&
      user.subscriptionCanceledAt === null &&
      (user.lsSubscriptionId || user.qpSubscriptionToken || user.bogParentOrderId)
    ) {
      // Already has this exact tier active on some processor — buying it again would
      // just start a fresh checkout without cancelling the running one.
      return NextResponse.json({ error: 'already_subscribed' }, { status: 400 });
    }

    // First-ever purchase on this account gets a 7-day free trial (preauthorized hold,
    // released once the card-save is confirmed — never actually charged). Any purchase
    // after that (re-subscribing post-cancellation, switching tiers, etc.) charges
    // immediately, no trial.
    const createOrder = user.bogTrialUsed ? createDirectOrder : createTrialOrder;
    const { url } = await createOrder({
      interval,
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('BOG checkout error:', err.message);
    // Status 400 (not 502/503/504) — Cloudflare intercepts those from the origin and
    // replaces the body with its own HTML error page, which broke error reporting
    // during the Quickpay integration, so this mirrors that fix.
    return NextResponse.json({ error: 'checkout_failed', detail: err.message }, { status: 400 });
  }
}
