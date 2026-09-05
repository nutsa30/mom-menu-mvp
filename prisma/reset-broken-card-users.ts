import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// One-time cleanup for the specific batch of users whose renewal charge can never
// succeed — BOG has no saved card on file for their subscription at all (confirmed via
// a direct 404 "Error during getting saved card info" from BOG's own API for at least
// two of them; the rest show the identical fingerprint: paymentFailedAt is set, and their
// payment history has ONLY a REFUNDED trial-hold-release row, never a single SUCCESS).
// Retrying them automatically is pointless — it'll 404 forever — and just keeps them
// blocked with no way out.
//
// This resets each one back to the FREE plan, exactly as if they'd never subscribed:
//   - subscriptionStatus -> FREE (loses full-plan access immediately)
//   - bogParentOrderId, billingIntervalMonths, subscriptionRenewsAt, trialEndsAt,
//     subscriptionStartedAt, subscriptionCanceledAt, paymentFailedAt -> all cleared
//   - bogTrialUsed is DELIBERATELY LEFT AS-IS (true) — this is what makes it work
//     correctly if they check out again: app/api/subscription/bog-checkout/route.ts
//     already picks createDirectOrder (immediate real charge, no trial) whenever
//     bogTrialUsed is true, so re-entering a card charges them right away with no
//     second free trial. No code change needed for that part — it's already correct.
//
// Excludes mariami.macharashvili.2@iliauni.edu.ge on purpose — her failures are real bank
// declines ("insufficient funds"), a completely different, legitimate case; leave her
// blocked and let the normal automatic retries keep trying her card.
const EMAILS_TO_RESET = [
  'chorgolianitsira@gmail.com',       // Tsira Chorgoliani
  'nelikobv@bk.ru',                    // neliko
  'verikotitirashvili1@gmail.com',     // Veronika
  'sophosurmava4@gmail.com',           // sopho
  'tatia.matskepladze@mail.ru',        // თათია
  'niaburjaliani@yahoo.com',           // ნია
  'khatukamaisuradze1989@gmail.com',   // khatuna maisuradze
  'ekagachechiladze20@gmail.com',      // eka gachechiladze
  'mariam.niniashvili@gmail.com',      // მარიამი (niniashvili)
  'g_gogichashvili2@cu.edu.ge',        // Gvantsa Gogichashvili
  'keti.khutsishvili.1@iliauni.edu.ge',// ქეთი
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

    console.log(`✓ ${user.name} <${email}>: დაუბრუნდა FREE სტატუსს (ტრიალის გამოყენების ნიშანი დარჩა უცვლელი — თუ ხელახლა შეიყვანენ ბარათს, დაუყოვნებლივ ჩამოეჭრებათ, ახალი ტრიალის გარეშე)`);
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
