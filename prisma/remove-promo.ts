import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// One-off fix: unlink the LALIGIO promo code from this account (testing artifact) —
// only clears User.promoCodeId, doesn't touch subscriptionStatus/billingIntervalMonths
// or anything else. After this, the account's next charge (if any) is full price, since
// bog-checkout only re-links a promo code when the user doesn't already have one — and
// now they don't.
const EMAIL = 'nutsarogava30@gmail.com';

async function main() {
  const user = await p.user.findUnique({ where: { email: EMAIL }, include: { promoCode: true } });
  if (!user) {
    console.log(`✗ ვერ მოიძებნა: ${EMAIL}`);
    return;
  }
  if (!user.promoCodeId) {
    console.log(`- ${EMAIL}: არც ისე აქვს პრომოკოდი მიბმული, არაფერი შეიცვალა`);
    return;
  }
  const codeName = user.promoCode?.code ?? user.promoCodeId;
  await p.user.update({
    where: { email: EMAIL },
    data: { promoCodeId: null },
  });
  console.log(`✓ ${EMAIL}: მოიხსნა "${codeName}" პრომოკოდი`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
