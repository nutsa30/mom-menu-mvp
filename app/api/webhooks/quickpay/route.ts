import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature, decodeOrderId } from '@/lib/quickpay';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

const PLAN_LABELS: Record<string, string> = {
  RECIPE_PLAN: 'რეცეპტების წვდომა',
  FULL_PLAN: 'სრული პაკეტი',
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, req.headers)) {
    console.error('Quickpay webhook: signature check failed', {
      headers: Object.fromEntries(req.headers.entries()),
      body: rawBody.slice(0, 500),
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  // TODO(confirm): exact envelope shape — logging it below until we see a real delivery.
  console.log('Quickpay webhook received:', JSON.stringify(payload).slice(0, 1000));

  const eventName: string = payload?.event ?? payload?.type ?? payload?.event_type ?? '';
  const data = payload?.data ?? payload?.payment ?? payload;

  const status: string = data?.status ?? '';
  const isPaid = eventName.toLowerCase().includes('paid') || status === 'paid';
  const isFailed = eventName.toLowerCase().includes('fail') || status === 'failed';
  if (!isPaid && !isFailed) return NextResponse.json({ received: true });

  const subscriptionToken: string | undefined = data?.subscription_token;
  const decoded = decodeOrderId(data?.merchant_order_id);

  // First payment on the tokenizing checkout carries merchant_order_id (user+plan we
  // encoded). Later recurring charges only carry subscription_token — look up by that.
  let user = decoded
    ? await prisma.user.findUnique({ where: { id: decoded.userId } })
    : subscriptionToken
    ? await prisma.user.findUnique({ where: { qpSubscriptionToken: subscriptionToken } })
    : null;

  if (!user) {
    console.error('Quickpay webhook: could not resolve user', { eventName, merchantOrderId: data?.merchant_order_id, subscriptionToken });
    return NextResponse.json({ received: true });
  }

  if (isFailed) {
    // Single failed renewal — don't cut access on one transient failure. Revisit with
    // proper dunning/retry once we've seen how Quickpay reports repeated failures.
    console.error('Quickpay charge failed', { userId: user.id, data });
    return NextResponse.json({ received: true });
  }

  const paidAt = data?.paid_at ? new Date(data.paid_at) : new Date();
  const renewsAt = new Date(paidAt.getTime() + THIRTY_DAYS_MS);

  if (decoded) {
    // First payment — activates the plan and stores the token for future renewals.
    const wasAlreadyOnPlan = user.subscriptionStatus === decoded.plan;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: decoded.plan,
        subscriptionCanceledAt: null,
        subscriptionRenewsAt: renewsAt,
        subscriptionStartedAt: user.subscriptionStartedAt ?? paidAt,
        qpSubscriptionToken: subscriptionToken ?? user.qpSubscriptionToken,
      },
    });
    if (!wasAlreadyOnPlan) {
      const price = Number(data?.amount ?? 0);
      sendSubscriptionConfirmationEmail(user.email, user.name, PLAN_LABELS[decoded.plan], price, paidAt, renewsAt).catch(() => {});
    }
  } else {
    // Recurring renewal — just push the next renewal date out.
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionRenewsAt: renewsAt },
    });
  }

  return NextResponse.json({ received: true });
}
