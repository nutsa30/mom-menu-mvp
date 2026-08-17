import { prisma } from '@/lib/prisma';
import {
  verifyWebhookSignature,
  decodeOrderId,
  decodeRenewalOrderId,
  refundOrder,
  computeCommission,
  PLAN_AMOUNTS,
} from '@/lib/bog';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

const PLAN_LABELS: Record<string, string> = {
  RECIPE_PLAN: 'რეცეპტების წვდომა',
  FULL_PLAN: 'სრული პაკეტი',
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, req.headers)) {
    console.error('BOG webhook: signature check failed', {
      headers: Object.fromEntries(req.headers.entries()),
      body: rawBody.slice(0, 500),
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  console.log('BOG webhook received:', JSON.stringify(payload).slice(0, 1000));

  // Confirmed shape (api.bog.ge/docs/en/payments/standard-process/callback):
  // { event: "order_payment", zoned_request_time, body: { order_id, external_order_id,
  //   order_status: { key, value }, payment_detail: { card_type, ... }, ... } }
  const body = payload?.body;
  const orderId: string | undefined = body?.order_id;
  if (!orderId) {
    console.error('BOG webhook: no order_id in payload', payload);
    return NextResponse.json({ received: true });
  }

  const statusKey: string = body?.order_status?.key ?? '';
  const isPaid = statusKey === 'completed';
  const isFailed = statusKey === 'rejected';
  if (!isPaid && !isFailed) {
    // created/processing/blocked/etc. — not a final state we act on (yet).
    return NextResponse.json({ received: true });
  }

  const externalOrderId: string | undefined = body?.external_order_id;
  const cardType: string | undefined = body?.payment_detail?.card_type;

  const decoded = decodeOrderId(externalOrderId);
  const renewal = decoded ? null : decodeRenewalOrderId(externalOrderId);

  if (decoded) {
    // ── First (trial) payment ────────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      console.error('BOG webhook: could not resolve user for trial order', { orderId, externalOrderId });
      return NextResponse.json({ received: true });
    }

    if (isFailed) {
      // Card verification failed — no access was granted yet, nothing to roll back.
      console.error('BOG trial charge failed', { userId: user.id, orderId, body });
      return NextResponse.json({ received: true });
    }

    // The trial order was created at the REAL plan price (see createTrialOrder's
    // comment — /subscribe always inherits the parent order's amount, so the parent
    // must already be the real price). Refund it in full now that the card is
    // confirmed saved, so the customer isn't actually charged during the free trial.
    const trialGrossAmount = Number(PLAN_AMOUNTS[decoded.plan] ?? 0);
    try {
      await refundOrder(orderId);
    } catch (err: any) {
      // Don't block activation on a refund failure — flag loudly for manual follow-up.
      console.error('BOG webhook: trial refund failed, needs manual refund', { orderId, userId: user.id, error: err.message });
    }

    await prisma.payment.upsert({
      where: { bogOrderId: orderId },
      create: {
        userId: user.id,
        plan: decoded.plan,
        status: 'REFUNDED',
        bogOrderId: orderId,
        cardType: cardType ?? null,
        grossAmount: trialGrossAmount,
        // Trial charge is refunded in full — no commission/net to track.
        commissionAmount: null,
        netAmount: null,
      },
      update: {},
    });

    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + SEVEN_DAYS_MS);
    const wasAlreadyOnPlan = user.subscriptionStatus === decoded.plan;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: decoded.plan,
        subscriptionCanceledAt: null,
        bogParentOrderId: orderId,
        trialEndsAt,
        // Access starts immediately; the real charge fires 7 days from now via the cron.
        subscriptionRenewsAt: trialEndsAt,
        subscriptionStartedAt: user.subscriptionStartedAt ?? now,
      },
    });

    if (!wasAlreadyOnPlan) {
      const price = Number(PLAN_AMOUNTS[decoded.plan] ?? 0);
      sendSubscriptionConfirmationEmail(user.email, user.name, PLAN_LABELS[decoded.plan], price, now, trialEndsAt).catch(() => {});
    }
    return NextResponse.json({ received: true });
  }

  if (renewal) {
    // ── Recurring renewal charge ────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { id: renewal.userId } });
    if (!user) {
      console.error('BOG webhook: could not resolve user for renewal order', { orderId, externalOrderId });
      return NextResponse.json({ received: true });
    }

    if (isFailed) {
      // Single failed renewal — don't cut access on one transient failure. Revisit with
      // proper dunning/retry once we've seen how BOG reports repeated failures.
      console.error('BOG renewal charge failed', { userId: user.id, orderId, body });
      return NextResponse.json({ received: true });
    }

    // Renewal orders don't carry the plan in external_order_id (unlike the trial
    // order), since the user is already subscribed by this point — use their
    // current plan on file. grossAmount reliably reflects the real charge now:
    // /subscribe inherits the parent order's amount (confirmed via docs), and the
    // parent order was created at the real plan price, not a nominal trial amount.
    const plan = user.subscriptionStatus as 'RECIPE_PLAN' | 'FULL_PLAN';
    const grossAmount = Number(PLAN_AMOUNTS[plan] ?? 0);
    const { commissionAmount, netAmount } = computeCommission(grossAmount, cardType);

    await prisma.payment.upsert({
      where: { bogOrderId: orderId },
      create: {
        userId: user.id,
        plan,
        status: 'SUCCESS',
        bogOrderId: orderId,
        cardType: cardType ?? null,
        grossAmount,
        commissionAmount,
        netAmount,
      },
      update: {},
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionRenewsAt: new Date(Date.now() + THIRTY_DAYS_MS) },
    });
    return NextResponse.json({ received: true });
  }

  console.error('BOG webhook: paid/failed event but external_order_id did not decode as trial or renewal', { orderId, externalOrderId });
  return NextResponse.json({ received: true });
}
