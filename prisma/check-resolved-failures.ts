import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Diagnostic: everyone who shows up in check-failed-payments.ts as "not currently
// blocked" (paymentFailedAt is null now, even though they had a FAILED payment at some
// point) — the user suspects many of these actually just canceled, and wants to confirm
// none of them still have paid-plan access without a legitimate reason (an unexpired
// trial, a real SUCCESS payment, or a still-valid gift).
async function main() {
  const emails = [
    'nanikogogilashvili@gmail.com',   // nani gogilashvili
    'razmadzenatia2015@gmail.com',    // ნათია
    'tamarabuashvili2@gmail.com',     // თაკო
    'likaalazviia@gmail.com',         // Lika
    'teona.janelidze.1999@gmail.com', // თეონა ჯანელიძე
    'm_zarkua@cu.edu.ge',             // Mancho Zarkua
    'smushkudiani@yahoo.com',         // Ana
    'natiagvindadze@gmail.com',       // natia gvindadze
  ];

  const now = new Date();

  for (const email of emails) {
    const user = await p.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`⚠️  ვერ მოიძებნა: ${email}`);
      continue;
    }

    const success = await p.payment.findFirst({
      where: { userId: user.id, status: 'SUCCESS' },
      orderBy: { createdAt: 'desc' },
    });

    const hasFullAccess = (user.subscriptionStatus === 'FULL_PLAN' || user.subscriptionStatus === 'RECIPE_PLAN') && !user.paymentFailedAt;
    const inTrial = !!user.trialEndsAt && user.trialEndsAt > now;
    const legit = user.isGifted || inTrial || (!!success && !!user.subscriptionRenewsAt && user.subscriptionRenewsAt > now);

    console.log('──────────────────────────────');
    console.log('მომხმარებელი:', user.name, `<${email}>`);
    console.log('სტატუსი:', user.subscriptionStatus, '| გაუქმებულია:', user.subscriptionCanceledAt ? user.subscriptionCanceledAt.toISOString() : 'არა');
    console.log('paymentFailedAt:', user.paymentFailedAt ? user.paymentFailedAt.toISOString() : 'ცარიელია (არ არის დაბლოკილი)');
    console.log('renewsAt:', user.subscriptionRenewsAt ? user.subscriptionRenewsAt.toISOString() : 'ცარიელია');
    console.log('ბოლო წარმატებული გადახდა:', success ? `${success.grossAmount}₾ — ${success.createdAt.toISOString()}` : 'არასდროს ჰქონია');
    console.log('გაჩუქებული (isGifted):', user.isGifted);

    if (hasFullAccess && !legit) {
      console.log('❌ სრული წვდომა აქვს, მაგრამ არც გადახდილი აქვს მოქმედი პერიოდით, არც ტრიალშია, არც გაჩუქებულია — ეს გასასწორებელია!');
    } else if (hasFullAccess) {
      console.log('✅ სრული წვდომა აქვს — და საფუძველი კანონიერია (გადახდილი/ტრიალი/გაჩუქებული).');
    } else {
      console.log('— სრული წვდომა არ აქვს (FREE/CANCELED ან დაბლოკილია) — წესრიგშია.');
    }
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
