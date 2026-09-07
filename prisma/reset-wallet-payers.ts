import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// The Apple Pay / Google Pay buyers identified from BOG's Business Manager, cross-checked
// against the live database (prisma/check-wallet-payers.ts) on 2026-09-07. Most of that
// list turned out to already be handled — mostly the SAME people as the earlier
// reset-broken-card-users.ts batch (now we know why their card was never saved: it was
// never a card at all, it was Apple/Google Pay), plus a few who'd already canceled
// themselves. These four are the only ones still actively on FULL_PLAN with no way for
// their renewal charge to ever succeed (see lib/bog.ts's payment_method fix for the
// permanent, forward-looking fix).
//
// Same reset pattern as prisma/reset-broken-card-users.ts:
//   - subscriptionStatus -> FREE (loses full-plan access immediately)
//   - bogParentOrderId, billingIntervalMonths, subscriptionRenewsAt, trialEndsAt,
//     subscriptionStartedAt, subscriptionCanceledAt, paymentFailedAt -> all cleared
//   - bogTrialUsed is DELIBERATELY LEFT AS-IS (true) — if they check out again with a
//     real card, app/api/subscription/bog-checkout/route.ts already picks
//     createDirectOrder (immediate real charge, no trial), so no second free trial.
const EMAILS_TO_RESET = [
  'kobakhidzem18@gmail.com',     // mariam kobakhidze
  'kvaratskheliaani1@gmail.com', // ანი
  'chogovadze1994@gmail.com',    // სალომე
  'makusha13.mari@gmail.com',    // mariam
];

async function main() {
  for (const email of EMAILS_TO_RESET) {
    const user = await p.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`⚠️  ვერ მოიძებნა: ${email}`);
      continue;
    }
    if (user.subscriptionStatus === 'FREE') {
      console.log(`— უკვე FREE-ზეა, გამოტოვებულია: ${email}`);
      continue;
    }

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
        // bogTrialUsed intentionally left unchanged — stays true.
      },
    });

    console.log(`✓ ${user.name} <${email}>: დაუბრუნდა FREE სტატუსს`);
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
