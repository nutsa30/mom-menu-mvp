import { PrismaClient } from '@prisma/client';
import { chargeSavedCard, BillingInterval } from '../lib/bog';

const p = new PrismaClient();

// Manually triggers ONE renewal charge attempt for ONE specific user — completely
// outside the batch cron loop, with nothing else running alongside it. Use this to see,
// in isolation, whether a lone charge attempt for one of the "silent" users behaves any
// differently than when all 12 are charged together in the same cron run (which is the
// mystery we're chasing: their attempts never produce ANY payment record, success or
// failure — as if the request vanishes after we send it to BOG).
//
// This does NOT touch paymentFailedAt or write a Payment row itself — it only calls the
// same BOG function the cron uses to start a charge, then leaves the real outcome to
// arrive the normal way, via BOG's webhook (app/api/webhooks/bog/route.ts). Check
// check-failed-payments.ts and check-why-not-due.ts a little afterward to see what, if
// anything, came back.
//
// Usage: npx tsx prisma/charge-one-user.ts <email>
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('გამოყენება: npx tsx prisma/charge-one-user.ts <email>');
    process.exit(1);
  }

  const user = await p.user.findUnique({ where: { email } });
  if (!user) {
    console.error('ასეთი მომხმარებელი ვერ მოიძებნა:', email);
    process.exit(1);
  }
  if (!user.bogParentOrderId) {
    console.error('ამ მომხმარებელს bogParentOrderId არ აქვს — ჩამოჭრის დაწყება შეუძლებელია.');
    process.exit(1);
  }

  console.log('მომხმარებელი:', user.name, `(${user.email})`);
  console.log('bogParentOrderId:', user.bogParentOrderId);
  console.log('ინტერვალი:', user.billingIntervalMonths ?? 1, 'თვე');
  console.log('ვცდი ჩამოჭრის დაწყებას ბოგში (მარტო, სხვების გარეშე)...\n');

  try {
    const result = await chargeSavedCard({
      parentOrderId: user.bogParentOrderId,
      interval: (user.billingIntervalMonths ?? 1) as BillingInterval,
      userId: user.id,
    });
    console.log('✅ მოთხოვნა წარმატებით მივიდა ბოგამდე.');
    console.log('ახალი შვილობილი შეკვეთის ID:', result.orderId);
    console.log('ბოგის სრული პასუხი:', JSON.stringify(result.raw));
    console.log('\nრეალური შედეგი (გადაიხადა თუ არა) ცალკე მოვა webhook-ით — 30 წამში-1 წუთში გადაამოწმე:');
    console.log('  npx tsx prisma/check-failed-payments.ts');
    console.log('  npx tsx prisma/check-why-not-due.ts');
  } catch (err: any) {
    console.error('❌ მოთხოვნამ ვერ მოასწრო ბოგამდე მისვლაც კი:', err.message);
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
