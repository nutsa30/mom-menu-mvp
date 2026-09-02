import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Read-only diagnostic — changes nothing. Reports on every currently-active FULL_PLAN/
// RECIPE_PLAN subscriber (not gifted, not canceled) so we can see exactly where each
// renewal attempt actually is: still trialing, waiting on the BOG capture-confirmation
// webhook, successfully charged, or stuck (never got a Payment row at all despite being
// past its renewal date).
async function main() {
  const users = await p.user.findMany({
    where: {
      subscriptionStatus: { in: ['FULL_PLAN', 'RECIPE_PLAN'] },
      isGifted: false,
    },
    select: {
      name: true, email: true, subscriptionStatus: true, billingIntervalMonths: true,
      subscriptionStartedAt: true, subscriptionCanceledAt: true, subscriptionRenewsAt: true,
      trialEndsAt: true, bogTrialUsed: true, bogParentOrderId: true,
      payments: { orderBy: { createdAt: 'desc' }, take: 3, select: { status: true, grossAmount: true, createdAt: true, bogOrderId: true } },
    },
    orderBy: { subscriptionStartedAt: 'asc' },
  });

  const now = new Date();
  console.log(`სულ აქტიური გამომწერი: ${users.length}\n`);

  for (const u of users) {
    const started = u.subscriptionStartedAt ? new Date(u.subscriptionStartedAt).toLocaleDateString('ka-GE') : '—';
    const renewsAt = u.subscriptionRenewsAt ? new Date(u.subscriptionRenewsAt) : null;
    const isDue = renewsAt ? renewsAt <= now : false;
    const trialing = u.trialEndsAt && new Date(u.trialEndsAt) > now;

    console.log(`${u.name} <${u.email}>`);
    console.log(`  დაიწყო: ${started} | ინტერვალი: ${u.billingIntervalMonths ?? '—'} თვე | სტატუსი: ${u.subscriptionStatus}${trialing ? ' (ტესტ-პერიოდში)' : ''}`);
    console.log(`  renewsAt: ${renewsAt ? renewsAt.toLocaleString('ka-GE') : '—'}${isDue ? '  ⚠️ ვადა გასულია, ჯერ არ განახლებულა' : ''}`);
    console.log(`  bogParentOrderId: ${u.bogParentOrderId ?? '— (არასდროს გადახდილა)'}`);
    if (u.payments.length === 0) {
      console.log(`  გადახდები: არცერთი`);
    } else {
      for (const pay of u.payments) {
        console.log(`  გადახდა: ${pay.status} — ${pay.grossAmount}₾ — ${new Date(pay.createdAt).toLocaleString('ka-GE')} (${pay.bogOrderId})`);
      }
    }
    console.log('');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
