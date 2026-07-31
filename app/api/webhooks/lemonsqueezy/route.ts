import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature, variantIdToPlan, cancelSubscription } from '@/lib/lemonsqueezy';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

const PLAN_LABELS: Record<string, string> = {
  RECIPE_PLAN: 'რეცეპტების წვდომა',
  FULL_PLAN: 'სრული პაკეტი',
};

const PLAN_PRICES: Record<string, number> = {
  RECIPE_PLAN: 15,
  FULL_PLAN: 21,
};

const ACTIVE_STATUSES = new Set(['on_trial', 'active']);

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature');

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName: string = payload?.meta?.event_name ?? '';

  if (!eventName.startsWith('subscription_')) {
    return NextResponse.json({ received: true });
  }

  // subscription_payment_success/failed/recovered carry a subscription-invoice object
  // in `data` (its `id` is an invoice ID, not a subscription ID) — only events whose
  // `data` is an actual subscription object should ever write to lsSubscriptionId.
  if (payload?.data?.type !== 'subscriptions') {
    return NextResponse.json({ received: true });
  }

  const attrs = payload?.data?.attributes;
  const lsSubscriptionId: string | undefined = payload?.data?.id;
  if (!attrs || !lsSubscriptionId) return NextResponse.json({ received: true });

  const customUserId: string | undefined = payload?.meta?.custom_data?.user_id;
  const plan = variantIdToPlan(String(attrs.variant_id));

  let user = customUserId
    ? await prisma.user.findUnique({ where: { id: customUserId } })
    : null;
  if (!user && attrs.user_email) {
    user = await prisma.user.findUnique({ where: { email: attrs.user_email } });
  }
  if (!user) {
    console.error('Lemon Squeezy webhook: could not resolve user', { eventName, lsSubscriptionId, customUserId, email: attrs.user_email });
    return NextResponse.json({ received: true });
  }

  const status: string = attrs.status;
  const isActive = ACTIVE_STATUSES.has(status);
  const previousLsSubscriptionId = user.lsSubscriptionId;
  const previousPlan = user.subscriptionStatus;
  const isNewSubscriptionRecord = lsSubscriptionId !== previousLsSubscriptionId;
  const planChanged = isActive && !!plan && plan !== previousPlan;

  const data: Record<string, any> = {
    lsSubscriptionId,
    lsCustomerId: String(attrs.customer_id ?? user.lsCustomerId ?? ''),
    subscriptionRenewsAt: attrs.renews_at ? new Date(attrs.renews_at) : (attrs.trial_ends_at ? new Date(attrs.trial_ends_at) : null),
  };

  if (isActive && plan) {
    data.subscriptionStatus = plan;
    data.subscriptionCanceledAt = null;
    if (!user.subscriptionStartedAt) data.subscriptionStartedAt = new Date();
  } else if (status === 'expired') {
    data.subscriptionStatus = 'FREE';
  } else if (status === 'cancelled') {
    data.subscriptionCanceledAt = new Date();
    // access continues until `ends_at` — plan stays active until the expired event arrives
  }
  // past_due / unpaid / paused: leave subscriptionStatus untouched; Lemon Squeezy handles dunning emails

  await prisma.user.update({ where: { id: user.id }, data });

  // Switching plans via a fresh checkout buys a second, separate Lemon Squeezy
  // subscription — cancel the old one so the customer isn't billed for both.
  // (Plan swaps done through the Lemon Squeezy customer portal update the same
  // subscription in place, so previousLsSubscriptionId === lsSubscriptionId there
  // and this is a no-op.)
  if (isActive && plan && isNewSubscriptionRecord && previousLsSubscriptionId && previousLsSubscriptionId !== lsSubscriptionId) {
    try {
      await cancelSubscription(previousLsSubscriptionId);
    } catch (err: any) {
      console.error('Failed to cancel previous Lemon Squeezy subscription:', previousLsSubscriptionId, err.message);
    }
  }

  if (planChanged) {
    const price = PLAN_PRICES[plan!];
    const start = new Date();
    const end = data.subscriptionRenewsAt ?? new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
    sendSubscriptionConfirmationEmail(user.email, user.name, PLAN_LABELS[plan!], price, start, end).catch(() => {});
  }

  return NextResponse.json({ received: true });
}
