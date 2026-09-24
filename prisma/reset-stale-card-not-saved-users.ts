import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// One-time catch-up for the current backlog of "card not saved" accounts (see the
// 2026-09-24 fix in app/api/cron/bog-renew/route.ts, which now does this automatically
// going forward — this script just clears out everyone who was ALREADY stuck before that
// fix shipped, so the admin payments table stops being flooded with daily repeat FAILED
// rows for accounts that can never succeed).
//
// Same safety rule as prisma/reset-broken-card-user.ts: only resets an account that has
// at least one "[ბარათი ვერ მოიძებნა]" FAILED payment, and only if it has never had a
// single SUCCESS payment since then (an ordinary decline — insufficient funds, expired
// card — is left completely alone and keeps retrying normally). No waiting period: if the
// bank has no card on file once, it never will on its own, so there's nothing to gain by
// waiting before resetting.
//
// Run once: npx tsx prisma/reset-stale-card-not-saved-users.ts
// (add --dry to just print who WOULD be reset, without changing anything)

const CARD_NOT_SAVED_TAG = '[ბარათი ვერ მოიძებნა]';

async function main() {
  const dryRun = process.argv.includes('--dry');

  const candidates = await p.user.findMany({
    where: { subscriptionStatus: { in: ['RECIPE_PLAN', 'FULL_PLAN'] } },
  });

  let resetCount = 0;
  for (const user of candidates) {
    const oldestCardNotSaved = await p.payment.findFirst({
      where: { userId: user.id, status: 'FAILED', failureReason: { contains: CARD_NOT_SAVED_TAG } },
      orderBy: { createdAt: 'asc' },
    });
    if (!oldestCardNotSaved) continue;

    // Never reset an account that has a real SUCCESS payment after the first
    // "card not saved" failure — that would mean the card issue got fixed since.
    const successSince = await p.payment.findFirst({
      where: { userId: user.id, status: 'SUCCESS', createdAt: { gt: oldestCardNotSaved.createdAt } },
    });
    if (successSince) continue;

    resetCount++;
    console.log(`${dryRun ? '[dry] ' : ''}✓ ${user.name} <${user.email}>: სტუკ არის "ბარათი ვერ მოიძებნა"-ზე ${oldestCardNotSaved.createdAt.toISOString()}-დან — ${dryRun ? 'დარეზეტდებოდა' : 'დარეზეტდა'} FREE-ზე`);

    if (!dryRun) {
      await p.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'FREE',
          subscriptionCanceledAt: null,
          subscriptionRenewsAt: null,
          bogParentOrderId: null,
          billingIntervalMonths: null,
          trialEndsAt: null,
          paymentFailedAt: null,
          subscriptionStartedAt: null,
          // bogTrialUsed intentionally left unchanged — a fresh checkout charges
          // immediately, no second free trial.
        },
      });
    }
  }

  console.log(`\n${dryRun ? 'დაფიქსირდებოდა' : 'დარეზეტდა'} ${resetCount} ანგარიში.`);
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
