import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Quick full dump for one user by email — their live subscription fields plus every
// Payment row on record, newest first, so admin can see the whole picture for a single
// reported case without cross-referencing multiple diagnostic scripts.
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('გამოყენება: npx tsx prisma/check-one-user.ts <email>');
    process.exit(1);
  }

  const user = await p.user.findUnique({ where: { email } });
  if (!user) {
    console.error('ვერ მოიძებნა:', email);
    process.exit(1);
  }

  console.log('სახელი:', user.name, `<${email}>`);
  console.log('subscriptionStatus:', user.subscriptionStatus);
  console.log('billingIntervalMonths:', user.billingIntervalMonths);
  console.log('bogParentOrderId:', user.bogParentOrderId ?? 'null');
  console.log('subscriptionRenewsAt:', user.subscriptionRenewsAt?.toISOString() ?? 'null');
  console.log('subscriptionCanceledAt:', user.subscriptionCanceledAt?.toISOString() ?? 'null');
  console.log('paymentFailedAt:', user.paymentFailedAt?.toISOString() ?? 'null');
  console.log('bogTrialUsed:', user.bogTrialUsed);
  console.log('trialEndsAt:', user.trialEndsAt?.toISOString() ?? 'null');

  const payments = await p.payment.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  console.log(`\nგადახდები (${payments.length}):`);
  for (const pay of payments) {
    console.log('──────────');
    console.log('თარიღი:', pay.createdAt.toISOString());
    console.log('სტატუსი:', pay.status, '| bogOrderId:', pay.bogOrderId);
    console.log('თანხა:', pay.grossAmount, '| ბარათი:', pay.cardType ?? '—');
    if (pay.failureReason) console.log('მიზეზი:', pay.failureReason);
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
