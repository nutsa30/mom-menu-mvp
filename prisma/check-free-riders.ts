import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Diagnostic: looks for anyone getting full-site access (FULL_PLAN/RECIPE_PLAN, not
// blocked by paymentFailedAt) who has NEVER actually paid and is NOT currently inside
// their free trial window either — i.e. a genuine access-control leak, not a normal
// trial or a normal paying subscriber. The two most likely mechanical causes:
//  1. bogParentOrderId is missing — the daily/4-hourly cron only picks up users who HAVE
//     a bogParentOrderId (see bog-renew/route.ts's `where` clause), so anyone whose
//     parent order reference is somehow null never gets charged AND never gets blocked —
//     they just keep full access forever.
//  2. subscriptionRenewsAt is somehow null or far in the future despite no real payment
//     ever landing (a data inconsistency from an admin action, a bug, or manual DB edit).
async function main() {
  const now = new Date();

  const candidates = await p.user.findMany({
    where: {
      subscriptionStatus: { in: ['FULL_PLAN', 'RECIPE_PLAN'] },
      isGifted: false,
      paymentFailedAt: null,
      subscriptionCanceledAt: null,
    },
    select: {
      id: true, name: true, email: true, subscriptionStatus: true, billingIntervalMonths: true,
      trialEndsAt: true, subscriptionRenewsAt: true, bogParentOrderId: true, bogTrialUsed: true,
      subscriptionStartedAt: true, createdAt: true,
    },
  });

  const paid = await p.payment.findMany({ where: { status: 'SUCCESS' }, select: { userId: true }, distinct: ['userId'] });
  const paidIds = new Set(paid.map((x) => x.userId));

  const leaks = candidates.filter((u) => {
    const neverPaid = !paidIds.has(u.id);
    const trialOver = !u.trialEndsAt || u.trialEndsAt < now; // not currently inside a trial window
    return neverPaid && trialOver;
  });

  console.log(`სულ შემოწმებული (FULL_PLAN/RECIPE_PLAN, არაგაჩუქებული, არადაბლოკილი, არაგაუქმებული): ${candidates.length}`);
  console.log(`ეჭვმიტანილი (არც გადაუხდია, არც ტრიალშია ახლა): ${leaks.length}\n`);

  for (const u of leaks) {
    console.log('──────────────────────────────');
    console.log('მომხმარებელი:', u.name, `(${u.email})`);
    console.log('გეგმა:', u.subscriptionStatus, u.billingIntervalMonths, 'თვე');
    console.log('ტრიალი დასრულდა:', u.trialEndsAt ? u.trialEndsAt.toISOString() : 'ტრიალი საერთოდ არ ჰქონია');
    console.log('შემდეგი განახლების თარიღი (renewsAt):', u.subscriptionRenewsAt ? u.subscriptionRenewsAt.toISOString() : 'არ არის დაყენებული ⚠️');
    console.log('bogParentOrderId:', u.bogParentOrderId ?? 'არ არის ⚠️ (ამიტომ cron ვერასდროს დაინახავს)');
    console.log('ტრიალი გამოყენებული (bogTrialUsed):', u.bogTrialUsed);
    console.log('რეგისტრირდა:', u.createdAt.toISOString().slice(0, 10));
  }

  if (leaks.length === 0) {
    console.log('ასეთი არავინაა — ყველა ვისაც სრული წვდომა აქვს, ან იხდის, ან ტრიალშია, ან სამართლიანად აქვს დაბლოკილი/გაუქმებული.');
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
