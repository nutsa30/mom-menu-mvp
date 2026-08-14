import { prisma } from '@/lib/prisma';
import {
  verifyWebhookSignature,
  decodeOrderId,
  decodeRenewalOrderId,
  getPaymentDetails,
  refundOrder,
  computeCommission,
  PLAN_AMOUNTS,
  TRIAL_AMOUNT_GEL,
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
  // TODO(confirm): the task brief's callback shape is { event, zoned_request_time,
  // body: { order_id, ... } } — logging it below until we see a real delivery and can
  // confirm what else `body` carries (status? external_order_id? card info?).
  console.log('BOG webhook received:', JSON.stringify(payload).slice(0, 1000));

  const orderId: string | undefined = payload?.body?.order_id ?? payload?.order_id;
  if (!orderId) {
    console.error('BOG webhook: no order_id in payload', payload);
    return NextResponse.json({ received: true });
  }

  // AMBIGUITY FLAG: the task brief doesn't document which fields besides
  // order_id live in the callback body, so we don't trust it for status/
  // external_order_id/card_type — we re-fetch authoritative details from the
  // receipt endpoint instead, per the brief's own suggestion to do so "if the
  // callback body doesn't carry enough detail".
  let details: any;
  try {
    details = await getPaymentDetails(orderId);
  } catch (err: any) {
    console.error('BOG webhook: payment details lookup failed', { orderId, error: err.message });
    return NextResponse.json({ received: true });
  }

  // Status field name is unconfirmed against a real payload — check the
  // plausible spots defensively rather than guessing a single field name.
  const statusRaw: string = (
    details?.status ??
    details?.order_status ??
    details?.payment_detail?.transaction_status ??
    payload?.body?.status ??
    ''
  ).toString().toLowerCase();
  const isPaid = ['completed', 'success', 'succeeded', 'paid', 'approved'].some((s) => statusRaw.includes(s));
  const isFailed = ['failed', 'declined', 'rejected', 'error'].some((s) => statusRaw.includes(s));
  if (!isPaid && !isFailed) return NextResponse.json({ received: true });

  const externalOrderId: string | undefined = details?.external_order_id ?? payload?.body?.external_order_id;
  const cardType: string | undefined = details?.payment_detail?.card_type ?? details?.card_type;

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
      console.error('BOG trial charge failed', { userId: user.id, orderId, details });
      return NextResponse.json({ received: true });
    }

    // Refund the nominal trial-verification charge now that the card is confirmed saved.
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
        grossAmount: Number(TRIAL_AMOUNT_GEL),
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
      console.error('BOG renewal charge failed', { userId: user.id, orderId, details });
      return NextResponse.json({ received: true });
    }

    // Renewal orders don't carry the plan in external_order_id (unlike the trial
    // order), since the user is already subscribed by this point — use their
    // current plan on file.
    const plan = user.subscriptionStatus as 'RECIPE_PLAN' | 'FULL_PLAN';
    // grossAmount reflects the plan price we intended to charge (from our own config),
    // since the actual charged amount is not reliably confirmed by the docs — see the
    // AMBIGUITY FLAG in lib/bog.ts's chargeSavedCard about whether the /subscribe
    // amount override is even honored by BOG. If it silently charged the trial amount
    // instead, this record will be WRONG until that's verified against a real account.
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
