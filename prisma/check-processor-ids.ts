import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// check-one-user.ts doesn't print lsSubscriptionId/qpSubscriptionToken — this fills that
// gap for one specific question: does this account still carry a legacy Lemon Squeezy (or
// Quickpay) subscription id, which is exactly what makes SettingsTab show the OLD
// ManageSubscriptionButton (Lemon Squeezy customer portal) instead of the current BOG
// cancel button (see components/DashboardClient.tsx's `user.lsSubscriptionId ? ... : ...`
// branch).
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('გამოყენება: npx tsx prisma/check-processor-ids.ts <email>');
    process.exit(1);
  }

  const user = await p.user.findUnique({ where: { email } });
  if (!user) {
    console.error('ვერ მოიძებნა:', email);
    process.exit(1);
  }

  console.log('სახელი:', user.name, `<${email}>`);
  console.log('lsSubscriptionId (Lemon Squeezy):', (user as any).lsSubscriptionId ?? 'null');
  console.log('qpSubscriptionToken (Quickpay):', (user as any).qpSubscriptionToken ?? 'null');
  console.log('bogParentOrderId (BOG):', user.bogParentOrderId ?? 'null');
  console.log('isGifted:', (user as any).isGifted);

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
