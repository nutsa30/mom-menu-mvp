import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature, variantIdToPlan } from '@/lib/lemonsqueezy';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

const PLAN_LABELS: Record<string, string> = {
  RECIPE_PLAN: 'რეცეპტების წვდომა',
  FULL_PLAN: 'სრული პაკეტი',
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
  const wasFirstActivation = !user.lsSubscriptionId;

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

  if (isActive && plan && wasFirstActivation) {
    const price = plan === 'RECIPE_PLAN' ? 15 : 30;
    const start = new Date();
    const end = data.subscriptionRenewsAt ?? new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
    sendSubscriptionConfirmationEmail(user.email, user.name, PLAN_LABELS[plan], price, start, end).catch(() => {});
  }

  return NextResponse.json({ received: true });
}
