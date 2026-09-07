import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Answers "სად წავიდა?" for a user who no longer shows up as trial, paying, canceled,
// OR unable-to-charge on the admin dashboard: our reset scripts
// (reset-broken-card-users.ts, and now reset-wallet-payers.ts) intentionally clear
// subscriptionCanceledAt AND paymentFailedAt back to null when they put someone back on
// FREE — that's what makes it "exactly as if they'd never subscribed" (so re-subscribing
// works cleanly). The side effect: a reset user becomes invisible to every one of those
// admin views at once, not just one — they're not "canceled", not "failed to charge",
// they're just a plain free account again.
//
// This lists everyone who's currently FREE but has bogTrialUsed=true (meaning: they DID
// subscribe to something at some point), newest change first — so you can see exactly
// who recently disappeared from the active lists and roughly when.
async function main() {
  const resetUsers = await p.user.findMany({
    where: { subscriptionStatus: 'FREE', bogTrialUsed: true },
    orderBy: { updatedAt: 'desc' },
    take: 30,
  });

  for (const u of resetUsers) {
    console.log('──────────────────────────────');
    console.log(u.name, `<${u.email}>`);
    console.log('ბოლო ცვლილება:', u.updatedAt.toISOString());
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
