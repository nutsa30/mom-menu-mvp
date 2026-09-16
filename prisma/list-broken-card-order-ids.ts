import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Pulls the historical BOG order ID (from the REFUNDED trial-hold-release Payment row —
// User.bogParentOrderId was already cleared by reset-broken-card-users.ts) for each of the
// 11 "card never saved by BOG" users, so we can hand BOG's support team the full list of
// affected order IDs instead of just the 2 we tested live.
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
    const refunded = await p.payment.findFirst({
      where: { userId: user.id, status: 'REFUNDED' },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`${user.name} <${email}>: ${refunded ? refunded.bogOrderId : '⚠️ REFUNDED ჩანაწერი ვერ მოიძებნა'}`);
  }
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
