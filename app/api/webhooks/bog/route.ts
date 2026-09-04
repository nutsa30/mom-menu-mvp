import { prisma } from '@/lib/prisma';
import {
  verifyWebhookSignature,
  decodeOrderId,
  decodeRenewalOrderId,
  cancelPreauthorization,
  approvePreauthorization,
  computeCommission,
  applyDiscount,
  PLAN_AMOUNTS_BY_INTERVAL,
  BillingInterval,
} from '@/lib/bog';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';
import { applyReferralAdjustments, REFERRED_TRIAL_DAYS, STANDARD_TRIAL_DAYS } from '@/lib/referral';
import { NextResponse } from 'next/server';

// Best-effort human-readable reason for a failed/rejected order. BOG's exact field name
// for this isn't consistently documented across their API surface, so this checks the
// most likely spots first and falls back to a compact dump of the whole callback body —
// better to capture whatever BOG actually sent than to silently discard it, since this is
// the only way admin can see WHY a charge was declined (insufficient funds vs expired
// card vs a bank-side block) without digging through server logs.
function describeFailure(body: any): string {
  const candidate =
    body?.reject_reason?.value ?? body?.reject_reason ??
    body?.response_code?.value ?? body?.response_code ??
    body?.order_status?.value ?? body?.order_status?.key;
  if (candidate) return String(candidate).slice(0, 300);
  try {
    return JSON.stringify(body).slice(0, 300);
  } catch {
    return 'უცნობი მიზეზი';
  }
}

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
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, include: { promoCode: true } });
    if (!user) {
      console.error('BOG webhook: could not resolve user for first-purchase order', { orderId, externalOrderId });
      return NextResponse.json({ received: true });
    }

    const existing = await prisma.payment.findUnique({ where: { bogOrderId: orderId } });
    if (existing) return NextResponse.json({ received: true }); // already processed (retried callback)

    // Reflects what BOG actually charges — the order itself was created at this same
    // discounted amount (see /api/subscription/bog-checkout), so this must match exactly
    // or our own Payment/MRR records would overstate what a promo-code user really pays.
    const grossAmount = applyDiscount(Number(PLAN_AMOUNTS_BY_INTERVAL[decoded.interval] ?? 0), user.promoCode?.discountPercent);

    if (isFailed) {
      // Recorded (not just logged) so a declined card is visible in admin's payments
      // table instead of silently vanishing — previously this branch only console.error'd,
      // which meant a repeatedly-declining renewal looked identical to "never attempted".
      await prisma.payment.create({
        data: {
          userId: user.id,
          plan: 'FULL_PLAN',
          billingIntervalMonths: decoded.interval,
          status: 'FAILED',
          bogOrderId: orderId,
          cardType: cardType ?? null,
          grossAmount,
          commissionAmount: null,
          netAmount: null,
          failureReason: describeFailure(body),
        },
      });
      console.error('BOG first-purchase charge failed', { userId: user.id, orderId, body });
      return NextResponse.json({ received: true });
    }

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

      // Anyone who came in on a code — a friend's referral OR an admin-issued promo code
      // (promoCodeId, linked in /api/subscription/bog-checkout right before this order was
      // created) — gets a shorter 3-day trial instead of the standard 7; only a fully
      // organic signup (no code at all) gets the full 7. Referred users additionally keep
      // their 10% discount, applied once the real charge succeeds (see
      // applyReferralAdjustments below) — never during this trial hold.
      const trialDays = (user.referredByUserId || user.promoCodeId) ? REFERRED_TRIAL_DAYS : STANDARD_TRIAL_DAYS;
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
    const user = await prisma.user.findUnique({ where: { id: renewal.userId }, include: { promoCode: true } });
    if (!user) {
      console.error('BOG webhook: could not resolve user for renewal order', { orderId, externalOrderId });
      return NextResponse.json({ received: true });
    }

    if (isFailed) {
      // A declined renewal now cuts dashboard access immediately (paymentFailedAt — see
      // DashboardClient's isFullPlan) rather than quietly leaving it active. Retries
      // continue automatically: subscriptionStatus/subscriptionRenewsAt/bogParentOrderId
      // are deliberately left untouched, so bog-renew's daily cron keeps seeing this
      // account as "due" and keeps attempting the same saved card. Access is restored
      // the instant a retry actually captures (see isPaid below, which clears this).
      const existingFailed = await prisma.payment.findUnique({ where: { bogOrderId: orderId } });
      if (existingFailed) return NextResponse.json({ received: true });
      const failedInterval = (user.billingIntervalMonths ?? 1) as BillingInterval;
      const failedGrossAmount = applyDiscount(Number(PLAN_AMOUNTS_BY_INTERVAL[failedInterval] ?? 0), user.promoCode?.discountPercent);
      await prisma.payment.create({
        data: {
          userId: user.id,
          plan: 'FULL_PLAN',
          billingIntervalMonths: failedInterval,
          status: 'FAILED',
          bogOrderId: orderId,
          cardType: cardType ?? null,
          grossAmount: failedGrossAmount,
          commissionAmount: null,
          netAmount: null,
          failureReason: describeFailure(body),
        },
      });
      await prisma.user.update({ where: { id: user.id }, data: { paymentFailedAt: new Date() } });
      console.error('BOG renewal charge failed', { userId: user.id, orderId, body });
      return NextResponse.json({ received: true });
    }

    if (isBlocked) {
      // Renewal orders inherit "manual" capture from the trial parent order, so the
      // charge lands as a hold first — approve it now to actually collect the money.
      // Access/Payment recording happens on the follow-up "completed" callback that
      // this triggers, not here.
      try {
        // One retry after a short pause before giving up — a single transient network
        // blip (BOG's side or ours) shouldn't be enough to block a customer whose card is
        // otherwise perfectly fine and cost a real renewal.
        try {
          await approvePreauthorization(orderId);
        } catch (firstErr: any) {
          console.error('BOG webhook: first approve attempt failed, retrying once', { orderId, userId: user.id, error: firstErr.message });
          await new Promise((r) => setTimeout(r, 1500));
          await approvePreauthorization(orderId);
        }
        // Push renewsAt forward so bog-renew's cron doesn't see this account as still
        // "due" and fire a SECOND /subscribe (a second hold on the same card) while this
        // one is still waiting for BOG's "completed" confirmation to land. If approve
        // failed (catch below), leave renewsAt untouched — that's what makes the next
        // cron run retry this same renewal instead of silently giving up on it.
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionRenewsAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        });
      } catch (err: any) {
        console.error('BOG webhook: renewal capture failed to initiate, needs manual follow-up', { orderId, userId: user.id, error: err.message });
        // The hold landed but approving/capturing it threw — that charge will never complete
        // on its own. Treat it exactly like a declined card (isFailed above): cut access
        // immediately, record a FAILED payment so it's visible in admin right away, and
        // leave subscriptionRenewsAt untouched so tomorrow's cron retries the same saved
        // card again automatically.
        const existingApproveFailed = await prisma.payment.findUnique({ where: { bogOrderId: orderId } });
        if (!existingApproveFailed) {
          const failInterval = (user.billingIntervalMonths ?? 1) as BillingInterval;
          const failGrossAmount = applyDiscount(Number(PLAN_AMOUNTS_BY_INTERVAL[failInterval] ?? 0), user.promoCode?.discountPercent);
          await prisma.payment.create({
            data: {
              userId: user.id,
              plan: 'FULL_PLAN',
              billingIntervalMonths: failInterval,
              status: 'FAILED',
              bogOrderId: orderId,
              cardType: cardType ?? null,
              grossAmount: failGrossAmount,
              commissionAmount: null,
              netAmount: null,
              failureReason: (err?.message ? String(err.message) : 'დამტკიცების მცდელობა ვერ შესრულდა').slice(0, 300),
            },
          }).catch(() => {});
        }
        await prisma.user.update({ where: { id: user.id }, data: { paymentFailedAt: new Date() } }).catch(() => {});
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
    // Same discounted amount as the original order — BOG's renewal API always inherits the
    // parent order's amount, so a promo-linked account is actually charged this reduced
    // figure again here, not the full price.
    const grossAmount = applyDiscount(Number(PLAN_AMOUNTS_BY_INTERVAL[interval] ?? 0), user.promoCode?.discountPercent);
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
      // Clears paymentFailedAt (a no-op if it was never set) — the moment a retry actually
      // captures, access restores automatically, whether this was the first attempt or the
      // fifth after several declines.
      data: { subscriptionRenewsAt: new Date(Date.now() + INTERVAL_MS[interval]), paymentFailedAt: null },
    });
    return NextResponse.json({ received: true });
  }

  console.error('BOG webhook: relevant event but external_order_id did not decode as first-purchase or renewal', { orderId, externalOrderId });
  return NextResponse.json({ received: true });
}
