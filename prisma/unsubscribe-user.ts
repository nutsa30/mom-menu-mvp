import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// One-off fix: this account shows an active 1-month (17₾) plan that was never actually
// purchased (test/manual artifact, no real BOG charge behind it) — reset it back to a
// clean "never subscribed" state so it stops showing as an active subscriber anywhere in
// admin. Payment history (if any real rows exist) is left untouched; this only resets the
// User row's own subscription/billing fields.
const EMAIL = 'ggulordava4@gmail.com';

async function main() {
  const user = await p.user.findUnique({ where: { email: EMAIL } });
  if (!user) {
    console.log(`✗ ვერ მოიძებნა: ${EMAIL}`);
    return;
  }

  console.log('ამჟამინდელი მდგომარეობა:', {
    subscriptionStatus: user.subscriptionStatus,
    billingIntervalMonths: user.billingIntervalMonths,
    subscriptionStartedAt: user.subscriptionStartedAt,
    subscriptionCanceledAt: user.subscriptionCanceledAt,
    subscriptionRenewsAt: user.subscriptionRenewsAt,
    trialEndsAt: user.trialEndsAt,
    bogParentOrderId: user.bogParentOrderId,
    bogTrialUsed: user.bogTrialUsed,
  });

  await p.user.update({
    where: { email: EMAIL },
    data: {
      subscriptionStatus: 'FREE',
      billingIntervalMonths: null,
      subscriptionStartedAt: null,
      subscriptionCanceledAt: null,
      subscriptionRenewsAt: null,
      trialEndsAt: null,
      bogParentOrderId: null,
      bogTrialUsed: false,
    },
  });

  console.log(`✓ ${EMAIL}: გამოწერა სრულად მოიხსნა, დაუბრუნდა უფასო (FREE) სტატუსს`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
