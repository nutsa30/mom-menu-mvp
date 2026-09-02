import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// One-off fix: these two accounts show as "canceled" (subscriptionCanceledAt is set),
// which would downgrade them to CANCELED once their current period runs out. Clearing
// just that field keeps whatever subscriptionStatus/billingIntervalMonths/isGifted they
// already have untouched — it only removes the "canceled" flag so the subscription
// keeps renewing as normal, and they stop being counted among canceled users in admin.
const EMAILS = ['nutsarogava30@gmail.com', 'ggulordava4@gmail.com'];

async function main() {
  for (const email of EMAILS) {
    const user = await p.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`✗ ვერ მოიძებნა: ${email}`);
      continue;
    }
    if (!user.subscriptionCanceledAt) {
      console.log(`- ${email}: უკვე არ არის გაუქმებული, არაფერი შეიცვალა (სტატუსი: ${user.subscriptionStatus})`);
      continue;
    }
    await p.user.update({
      where: { email },
      data: { subscriptionCanceledAt: null },
    });
    console.log(`✓ ${email}: გაუქმება მოიხსნა (სტატუსი დარჩა: ${user.subscriptionStatus}${user.billingIntervalMonths ? `, ${user.billingIntervalMonths} თვე` : ''})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
