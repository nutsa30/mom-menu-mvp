import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chargeSavedCard, applyDiscount, PLAN_AMOUNTS_BY_INTERVAL, BillingInterval } from '@/lib/bog';

const SECRET = process.env.CRON_SECRET || 'mm2026';

// Charges every BOG-billed subscription (trial or interval renewal) whose
// renewal date has arrived. The actual result (paid/failed) comes back
// asynchronously via the webhook — this endpoint only triggers the charge.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!SECRET || secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const due = await prisma.user.findMany({
    where: {
      bogParentOrderId: { not: null },
      subscriptionCanceledAt: null,
      subscriptionStatus: { in: ['RECIPE_PLAN', 'FULL_PLAN'] },
      subscriptionRenewsAt: { lte: new Date() },
    },
    include: { promoCode: true },
  });

  const results = { charged: 0, failed: 0 };
  for (const user of due) {
    if (!user.bogParentOrderId) continue;
    try {
      await chargeSavedCard({
        parentOrderId: user.bogParentOrderId,
        interval: (user.billingIntervalMonths ?? 1) as BillingInterval,
        userId: user.id,
      });
      results.charged++;
    } catch (err: any) {
      console.error('BOG renewal charge failed to initiate:', user.id, err.message);
      results.failed++;
      // The API call to CREATE the charge itself failed here (as opposed to BOG later
      // reporting "rejected" on a charge it did create — see the webhook's isFailed
      // branch), so there's no real bogOrderId to key a Payment off of. Use a synthetic,
      // guaranteed-unique one instead of skipping the record entirely — otherwise this
      // failure (and, critically, WHY it failed — rate limiting, a stale parent order,
      // etc.) would be invisible anywhere admin or these diagnostic scripts can see, only
      // in Vercel's function logs.
      const interval = (user.billingIntervalMonths ?? 1) as BillingInterval;
      const grossAmount = applyDiscount(Number(PLAN_AMOUNTS_BY_INTERVAL[interval] ?? 0), user.promoCode?.discountPercent);
      await prisma.payment.create({
        data: {
          userId: user.id,
          plan: 'FULL_PLAN',
          billingIntervalMonths: interval,
          status: 'FAILED',
          bogOrderId: `cron-init-fail-${user.id}-${Date.now()}`,
          grossAmount,
          commissionAmount: null,
          netAmount: null,
          failureReason: `[ვერ დაიწყო] ${String(err.message ?? err).slice(0, 280)}`,
        },
      }).catch(() => {});
      // Access still needs to be cut, the same as a normal declined-card "rejected"
      // callback. subscriptionRenewsAt is left untouched so this user stays "due" and
      // gets retried on the next cron run.
      await prisma.user.update({ where: { id: user.id }, data: { paymentFailedAt: new Date() } }).catch(() => {});
    }
    // A short pause between attempts — charging everyone due back-to-back with zero delay
    // risks tripping a per-second rate limit on BOG's side, which would fail a charge for
    // a reason that has nothing to do with the customer's card. Cheap insurance.
    await new Promise((r) => setTimeout(r, 400));
  }

  // Users who canceled (subscriptionCanceledAt set) keep access through the period they
  // already paid for — subscriptionStatus deliberately stays FULL_PLAN/RECIPE_PLAN until
  // now, rather than cutting them off the moment they clicked cancel. Once that paid
  // period's renewal date actually arrives, downgrade instead of charging.
  const expiredCanceled = await prisma.user.findMany({
    where: {
      subscriptionCanceledAt: { not: null },
      subscriptionStatus: { in: ['RECIPE_PLAN', 'FULL_PLAN'] },
      subscriptionRenewsAt: { lte: new Date() },
    },
  });
  for (const user of expiredCanceled) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'CANCELED',
        billingIntervalMonths: null,
        subscriptionRenewsAt: null,
        bogParentOrderId: null,
      },
    });
  }

  // Time-limited gifts (admin-granted 1/3/6-month access, isGifted with a
  // billingIntervalMonths set) never go through BOG at all, so nothing else ever
  // downgrades them once their granted period ends — do that here too.
  const expiredGifts = await prisma.user.findMany({
    where: {
      isGifted: true,
      billingIntervalMonths: { not: null },
      subscriptionStatus: { in: ['RECIPE_PLAN', 'FULL_PLAN'] },
      subscriptionRenewsAt: { lte: new Date() },
    },
  });
  for (const user of expiredGifts) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'CANCELED',
        isGifted: false,
        billingIntervalMonths: null,
        subscriptionRenewsAt: null,
      },
    });
  }

  return NextResponse.json({ due: due.length, ...results, downgraded: expiredCanceled.length, giftsExpired: expiredGifts.length });
}
