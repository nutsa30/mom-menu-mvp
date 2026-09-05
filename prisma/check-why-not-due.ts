import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Diagnostic: the bog-renew cron only attempts a charge for a user when ALL of these are
// true at once: bogParentOrderId is set, subscriptionCanceledAt is empty, subscriptionStatus
// is FULL_PLAN/RECIPE_PLAN, and subscriptionRenewsAt is in the past. If a currently-blocked
// (paymentFailedAt set) user fails even ONE of these, the cron never picks them up at all —
// no attempt is even started, which is why nothing ever gets recorded for them anywhere.
// This lists every blocked user and shows exactly which condition(s) they fail.
async function main() {
  const now = new Date();

  const blocked = await p.user.findMany({
    where: { paymentFailedAt: { not: null } },
    select: {
      id: true, name: true, email: true, paymentFailedAt: true,
      bogParentOrderId: true, subscriptionCanceledAt: true, subscriptionStatus: true,
      subscriptionRenewsAt: true, bogTrialUsed: true, trialEndsAt: true,
    },
    orderBy: { paymentFailedAt: 'desc' },
  });

  console.log(`სულ დაბლოკილი (paymentFailedAt დაყენებული): ${blocked.length}\n`);

  for (const u of blocked) {
    const reasons: string[] = [];
    if (!u.bogParentOrderId) reasons.push('❌ bogParentOrderId არ აქვს (cron ვერ ხედავს)');
    if (u.subscriptionCanceledAt) reasons.push('❌ subscriptionCanceledAt დაყენებულია (გაუქმებულია)');
    if (!(u.subscriptionStatus === 'FULL_PLAN' || u.subscriptionStatus === 'RECIPE_PLAN')) {
      reasons.push(`❌ სტატუსი არაა FULL_PLAN/RECIPE_PLAN (არის: ${u.subscriptionStatus})`);
    }
    if (!u.subscriptionRenewsAt) {
      reasons.push('❌ subscriptionRenewsAt საერთოდ არ აქვს დაყენებული');
    } else if (u.subscriptionRenewsAt > now) {
      reasons.push(`❌ subscriptionRenewsAt ჯერ არ დამდგარა (${u.subscriptionRenewsAt.toISOString()})`);
    }

    console.log('──────────────────────────────');
    console.log('მომხმარებელი:', u.name, `(${u.email})`);
    console.log('დაბლოკვის დრო:', u.paymentFailedAt?.toISOString());
    console.log('bogParentOrderId:', u.bogParentOrderId ?? 'ცარიელია');
    console.log('subscriptionCanceledAt:', u.subscriptionCanceledAt ? u.subscriptionCanceledAt.toISOString() : 'ცარიელია');
    console.log('subscriptionStatus:', u.subscriptionStatus);
    console.log('subscriptionRenewsAt:', u.subscriptionRenewsAt ? u.subscriptionRenewsAt.toISOString() : 'ცარიელია');
    console.log('bogTrialUsed:', u.bogTrialUsed, '| trialEndsAt:', u.trialEndsAt ? u.trialEndsAt.toISOString() : 'არასდროს ჰქონია');
    if (reasons.length === 0) {
      console.log('✅ ეს იუზერი cron-ისთვის "due"-ა — უნდა ცდილობდეს ჩამოჭრას ყოველ გაშვებაზე.');
    } else {
      console.log('რატომ არ ცდილობს cron ამ იუზერს:');
      for (const r of reasons) console.log('  ', r);
    }
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
