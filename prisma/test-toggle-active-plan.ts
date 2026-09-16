import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Lets an admin-gifted account (isGifted, no real bank order — like Nutsa's own permanent
// free access) temporarily LOOK like a real, active paid subscription, for one purpose
// only: manually testing the new interval-switch-block flow end to end (the blocked-switch
// modal in app/subscription/SubscriptionClient.tsx, and the real cancel button it links to).
// That flow only triggers for accounts with a real bogParentOrderId (see
// app/api/subscription/bog-checkout/route.ts's onActivePaidPeriod check) — a gift never has
// one, so without this there's no way to see it on an admin's own account.
//
// The fake bogParentOrderId is intentionally garbage, never a real BOG order — nothing can
// ever actually charge it. If the daily renewal cron ever somehow reached it before
// "restore" is run (it won't — subscriptionRenewsAt is set 30 days out), BOG would just
// 404 on the fake id and it would fail harmlessly, exactly like the real "card not saved"
// cases in reset-broken-card-users.ts.
//
// Usage:
//   npx tsx prisma/test-toggle-active-plan.ts <email> simulate   — turn ON the fake active plan
//   npx tsx prisma/test-toggle-active-plan.ts <email> restore    — turn back OFF (permanent gift)
const FAKE_ORDER_PREFIX = 'TEST-FAKE-DO-NOT-CHARGE-';

// Nutsa's real permanent-gift renewsAt, as it stood before this test (from
// prisma/check-one-user.ts on 2026-09-07) — "restore" puts it back exactly as it was.
const ORIGINAL_RENEWS_AT = new Date('2026-10-07T09:18:28.000Z');

async function main() {
  const email = process.argv[2];
  const mode = process.argv[3];
  if (!email || (mode !== 'simulate' && mode !== 'restore')) {
    console.error('გამოყენება: npx tsx prisma/test-toggle-active-plan.ts <email> simulate|restore');
    process.exit(1);
  }

  const user = await p.user.findUnique({ where: { email } });
  if (!user) {
    console.error('ვერ მოიძებნა:', email);
    process.exit(1);
  }

  if (mode === 'simulate') {
    await p.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'FULL_PLAN',
        billingIntervalMonths: 3,
        bogParentOrderId: `${FAKE_ORDER_PREFIX}${user.id}`,
        subscriptionCanceledAt: null,
        // 30 days out — safely past any test session, so the renewal cron never touches
        // this fake order before "restore" runs.
        subscriptionRenewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`✓ ${user.name}: ახლა გამოიყურება როგორც რეალური 3-თვიანი, გადახდილი გამოწერა (მხოლოდ ტესტისთვის).`);
    console.log('  ახლა საიტზე "1 თვე" ან "6 თვე" დაჭერისას უნდა გამოჩნდეს ახალი "ვერ გადავრთავთ პაკეტს ჯერ" ფანჯარა.');
    console.log('  როცა ტესტი დამთავრდება, აუცილებლად გაუშვი "restore" რომ დაუბრუნდე ჩვეულებრივ სამუდამო წვდომას.');
  } else {
    await p.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'FULL_PLAN',
        billingIntervalMonths: null,
        bogParentOrderId: null,
        subscriptionCanceledAt: null,
        subscriptionRenewsAt: ORIGINAL_RENEWS_AT,
      },
    });
    console.log(`✓ ${user.name}: დაუბრუნდა ჩვეულებრივ სამუდამო საჩუქარს, ზუსტად ისე როგორც ტესტამდე იყო.`);
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
