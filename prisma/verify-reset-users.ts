import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Sanity check: reset-broken-card-users.ts was run and reported success for all 11 of
// these, but the live cron (bog-renew) is STILL showing 11 failures on every run since
// then — exactly matching the pre-reset pattern. This prints each user's CURRENT live
// field values so we can see whether the reset actually stuck (subscriptionStatus should
// read FREE, bogParentOrderId should read null) or whether something put them back
// (e.g. a fresh checkout creating a new bogParentOrderId).
const EMAILS = [
  'chorgolianitsira@gmail.com',
  'nelikobv@bk.ru',
  'verikotitirashvili1@gmail.com',
  'sophosurmava4@gmail.com',
  'tatia.matskepladze@mail.ru',
  'niaburjaliani@yahoo.com',
  'khatukamaisuradze1989@gmail.com',
  'ekagachechiladze20@gmail.com',
  'mariam.niniashvili@gmail.com',
  'g_gogichashvili2@cu.edu.ge',
  'keti.khutsishvili.1@iliauni.edu.ge',
];

async function main() {
  for (const email of EMAILS) {
    const user = await p.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`⚠️  ვერ მოიძებნა: ${email}`);
      continue;
    }
    console.log('──────────────────────────────');
    console.log(user.name, `<${email}>`);
    console.log('  subscriptionStatus:', user.subscriptionStatus);
    console.log('  bogParentOrderId:', user.bogParentOrderId ?? 'null (სუფთაა)');
    console.log('  subscriptionRenewsAt:', user.subscriptionRenewsAt ? user.subscriptionRenewsAt.toISOString() : 'null');
    console.log('  paymentFailedAt:', user.paymentFailedAt ? user.paymentFailedAt.toISOString() : 'null');
    console.log('  bogTrialUsed:', user.bogTrialUsed);
    console.log('  updatedAt:', (user as any).updatedAt ? (user as any).updatedAt.toISOString() : '—');
  }
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
