import { prisma } from '@/lib/prisma';
import {
  verifyWebhookSignature,
  decodeOrderId,
  decodeRenewalOrderId,
  cancelPreauthorization,
  approvePreauthorization,
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
  const isBlocked = statusKey === 'blocked'; // preauthorization hold placed — not charged yet
  const isPaid = statusKey === 'completed'; // real capture confirmed
  const isFailed = statusKey === 'rejected';
  if (!isBlocked && !isPaid && !isFailed) {
    // created/processing/refunded/etc. — not a state we act on.
    return NextResponse.json({ received: true });
  }

  const externalOrderId: string | undefined = body?.external_order_id;
  const cardType: string | undefined = body?.payment_detail?.card_type;

  const decoded = decodeOrderId(externalOrderId);
  const renewal = decoded ? null : decodeRenewalOrderId(externalOrderId);

  if (decoded) {
    // ── First purchase: either a preauthorized trial ("blocked") or, for accounts
    // that already used their free trial, a direct real charge ("completed"). ──
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      console.error('BOG webhook: could not resolve user for first-purchase order', { orderId, externalOrderId });
      return NextResponse.json({ received: true });
    }

    if (isFailed) {
      console.error('BOG first-purchase charge failed', { userId: user.id, orderId, body });
      return NextResponse.json({ received: true });
    }

    const existing = await prisma.payment.findUnique({ where: { bogOrderId: orderId } });
    if (existing) return NextResponse.json({ received: true }); // already processed (retried callback)

    const grossAmount = Number(PLAN_AMOUNTS[decoded.plan] ?? 0);
    const wasAlreadyOnPlan = user.subscriptionStatus === decoded.plan;
    const now = new Date();

    if (isBlocked) {
      // Trial verification hold confirmed — release it (never actually charge the
      // customer for the trial) and start the 7-day free trial.
      try {
        await cancelPreauthorization(orderId);
      } catch (err: any) {
        console.error('BOG webhook: preauth release failed, needs manual follow-up', { orderId, userId: user.id, error: err.message });
      }

      await prisma.payment.create({
        data: {
          userId: user.id,
          plan: decoded.plan,
          status: 'REFUNDED',
          bogOrderId: orderId,
          cardType: cardType ?? null,
          grossAmount,
          commissionAmount: null,
          netAmount: null,
        },
      });

      const trialEndsAt = new Date(now.getTime() + SEVEN_DAYS_MS);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: decoded.plan,
          subscriptionCanceledAt: null,
          bogParentOrderId: orderId,
          trialEndsAt,
          bogTrialUsed: true,
          isGifted: false,
          // Real charge fires 7 days from now via the cron.
          subscriptionRenewsAt: trialEndsAt,
          subscriptionStartedAt: user.subscriptionStartedAt ?? now,
        },
      });

      if (!wasAlreadyOnPlan) {
        const price = grossAmount;
        sendSubscriptionConfirmationEmail(user.email, user.name, PLAN_LABELS[decoded.plan], price, now, trialEndsAt).catch(() => {});
      }
      return NextResponse.json({ received: true });
    }

    // isPaid — direct order (account already used its free trial): real, immediate charge.
    const { commissionAmount, netAmount } = computeCommission(grossAmount, cardType);
    await prisma.payment.create({
      data: {
        userId: user.id,
        plan: decoded.plan,
        status: 'SUCCESS',
        bogOrderId: orderId,
        cardType: cardType ?? null,
        grossAmount,
        commissionAmount,
        netAmount,
      },
    });

    const renewsAt = new Date(now.getTime() + THIRTY_DAYS_MS);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: decoded.plan,
        subscriptionCanceledAt: null,
        bogParentOrderId: orderId,
        trialEndsAt: null,
        bogTrialUsed: true,
        isGifted: false,
        subscriptionRenewsAt: renewsAt,
        subscriptionStartedAt: user.subscriptionStartedAt ?? now,
      },
    });

    if (!wasAlreadyOnPlan) {
      // No trial here (direct charge) — endDate is the first renewal date, not a trial end.
      sendSubscriptionConfirmationEmail(user.email, user.name, PLAN_LABELS[decoded.plan], grossAmount, now, renewsAt).catch(() => {});
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

    if (isBlocked) {
      // Renewal orders inherit "manual" capture from the trial parent order, so the
      // charge lands as a hold first — approve it now to actually collect the money.
      // Access/Payment recording happens on the follow-up "completed" callback that
      // this triggers, not here.
      try {
        await approvePreauthorization(orderId);
      } catch (err: any) {
        console.error('BOG webhook: renewal capture failed to initiate, needs manual follow-up', { orderId, userId: user.id, error: err.message });
      }
      return NextResponse.json({ received: true });
    }

    // isPaid — renewal actually captured.
    const existing = await prisma.payment.findUnique({ where: { bogOrderId: orderId } });
    if (existing) return NextResponse.json({ received: true }); // already processed (retried callback)

    // Renewal orders don't carry the plan in external_order_id (unlike the first-purchase
    // order), since the user is already subscribed by this point — use their current plan.
    const plan = user.subscriptionStatus as 'RECIPE_PLAN' | 'FULL_PLAN';
    const grossAmount = Number(PLAN_AMOUNTS[plan] ?? 0);
    const { commissionAmount, netAmount } = computeCommission(grossAmount, cardType);

    await prisma.payment.create({
      data: {
        userId: user.id,
        plan,
        status: 'SUCCESS',
        bogOrderId: orderId,
        cardType: cardType ?? null,
        grossAmount,
        commissionAmount,
        netAmount,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionRenewsAt: new Date(Date.now() + THIRTY_DAYS_MS) },
    });
    return NextResponse.json({ received: true });
  }

  console.error('BOG webhook: relevant event but external_order_id did not decode as first-purchase or renewal', { orderId, externalOrderId });
  return NextResponse.json({ received: true });
}
