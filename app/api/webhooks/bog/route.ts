import { prisma } from '@/lib/prisma';
import {
  verifyWebhookSignature,
  decodeOrderId,
  decodeRenewalOrderId,
  cancelPreauthorization,
  approvePreauthorization,
  computeCommission,
  PLAN_AMOUNTS_BY_INTERVAL,
  BillingInterval,
} from '@/lib/bog';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';
import { applyReferralAdjustments, REFERRED_TRIAL_DAYS, STANDARD_TRIAL_DAYS } from '@/lib/referral';
import { NextResponse } from 'next/server';

const PLAN_LABELS: Record<BillingInterval, string> = {
  1: '1 თვის გეგმა',
  3: '3 თვის გეგმა',
  6: '6 თვის გეგმა',
};

const DAY_MS = 24 * 60 * 60 * 1000;
// Flat day-multiples per interval (consistent with the existing 30-day-month convention —
// not calendar-month arithmetic), used to compute the next subscriptionRenewsAt.
const INTERVAL_MS: Record<BillingInterval, number> = {
  1: 30 * DAY_MS,
  3: 90 * DAY_MS,
  6: 180 * DAY_MS,
};

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

    const grossAmount = Number(PLAN_AMOUNTS_BY_INTERVAL[decoded.interval] ?? 0);
    const wasAlreadyOnThisTier = user.subscriptionStatus === 'FULL_PLAN' && user.billingIntervalMonths === decoded.interval;
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
          plan: 'FULL_PLAN',
          billingIntervalMonths: decoded.interval,
          status: 'REFUNDED',
          bogOrderId: orderId,
          cardType: cardType ?? null,
          grossAmount,
          commissionAmount: null,
          netAmount: null,
        },
      });

      // Referred users (redeemed a friend's code before this checkout started) get a
      // shorter 3-day trial instead of the standard 7 — their first real charge lands on
      // day 4, still with the 10% discount applied (see applyReferralAdjustments below,
      // called once that real charge actually succeeds — never during this trial hold).
      const trialDays = user.referredByUserId ? REFERRED_TRIAL_DAYS : STANDARD_TRIAL_DAYS;
      const trialEndsAt = new Date(now.getTime() + trialDays * DAY_MS);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'FULL_PLAN',
          billingIntervalMonths: decoded.interval,
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

      if (!wasAlreadyOnThisTier) {
        const price = grossAmount;
        sendSubscriptionConfirmationEmail(user.email, user.name, PLAN_LABELS[decoded.interval], price, now, trialEndsAt).catch(() => {});
      }
      return NextResponse.json({ received: true });
    }

    // isPaid — direct order (account already used its free trial): real, immediate charge.
    const { commissionAmount, netAmount } = computeCommission(grossAmount, cardType);
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        plan: 'FULL_PLAN',
        billingIntervalMonths: decoded.interval,
        status: 'SUCCESS',
        bogOrderId: orderId,
        cardType: cardType ?? null,
        grossAmount,
        commissionAmount,
        netAmount,
      },
    });

    try {
      await applyReferralAdjustments({ paymentId: payment.id, orderId, userId: user.id, grossAmount });
    } catch (err: any) {
      console.error('Referral adjustment failed (first-purchase direct charge)', { userId: user.id, orderId, error: err.message });
    }

    const renewsAt = new Date(now.getTime() + INTERVAL_MS[decoded.interval]);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'FULL_PLAN',
        billingIntervalMonths: decoded.interval,
        subscriptionCanceledAt: null,
        bogParentOrderId: orderId,
        trialEndsAt: null,
        bogTrialUsed: true,
        isGifted: false,
        subscriptionRenewsAt: renewsAt,
        subscriptionStartedAt: user.subscriptionStartedAt ?? now,
      },
    });

    if (!wasAlreadyOnThisTier) {
      // No trial here (direct charge) — endDate is the first renewal date, not a trial end.
      sendSubscriptionConfirmationEmail(user.email, user.name, PLAN_LABELS[decoded.interval], grossAmount, now, renewsAt).catch(() => {});
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
        // Push renewsAt forward so bog-renew's daily cron doesn't see this account as
        // still "due" and fire a SECOND /subscribe (a second hold on the same card)
        // while this one is still waiting for BOG's "completed" confirmation to land.
        // If approve failed (catch below), leave renewsAt untouched — that's what makes
        // tomorrow's cron retry this same renewal instead of silently giving up on it.
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionRenewsAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        });
      } catch (err: any) {
        console.error('BOG webhook: renewal capture failed to initiate, needs manual follow-up', { orderId, userId: user.id, error: err.message });
      }
      return NextResponse.json({ received: true });
    }

    // isPaid — renewal actually captured.
    const existing = await prisma.payment.findUnique({ where: { bogOrderId: orderId } });
    if (existing) return NextResponse.json({ received: true }); // already processed (retried callback)

    // Renewal orders don't carry the interval in external_order_id (unlike the
    // first-purchase order), since the user is already subscribed by this point —
    // use their stored billing interval. Falls back to 1 month only in the
    // unexpected case of a pre-migration account with no interval recorded.
    const interval = (user.billingIntervalMonths ?? 1) as BillingInterval;
    const grossAmount = Number(PLAN_AMOUNTS_BY_INTERVAL[interval] ?? 0);
    const { commissionAmount, netAmount } = computeCommission(grossAmount, cardType);

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        plan: 'FULL_PLAN',
        billingIntervalMonths: interval,
        status: 'SUCCESS',
        bogOrderId: orderId,
        cardType: cardType ?? null,
        grossAmount,
        commissionAmount,
        netAmount,
      },
    });

    // Covers BOTH cases with the same call: a trial converting to its first real charge
    // (first-ever SUCCESS payment — earns the referrer, discounts this user) and an
    // ordinary later renewal (already past their first payment — this is then just where
    // the user's own accumulated referral credit, if any, gets consumed/refunded).
    try {
      await applyReferralAdjustments({ paymentId: payment.id, orderId, userId: user.id, grossAmount });
    } catch (err: any) {
      console.error('Referral adjustment failed (renewal)', { userId: user.id, orderId, error: err.message });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionRenewsAt: new Date(Date.now() + INTERVAL_MS[interval]) },
    });
    return NextResponse.json({ received: true });
  }

  console.error('BOG webhook: relevant event but external_order_id did not decode as first-purchase or renewal', { orderId, externalOrderId });
  return NextResponse.json({ received: true });
}
