import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Single-user version of reset-broken-card-users.ts (which reset a specific one-time batch
// by a hardcoded email list) — for the next time this same bug shows up on one account, one
// at a time, without editing that file's array. Same fix, same reasoning:
//
// This bug (see app/api/cron/bog-renew/route.ts's "cardNotSaved" branch) means BOG never
// actually persisted a tokenized card for this subscription when the trial started — every
// renewal attempt 404s with "Error during getting saved card info with cardId ..." forever,
// no matter how many times the cron retries. It is NOT an ordinary decline (insufficient
// funds, expired card) — those are real, legitimate blocks and must NOT be reset this way.
//
// Safety check before touching anything: refuses to reset unless this user's most recent
// FAILED payment actually carries that exact fingerprint — so running this against a normal
// declined-card case (wrong email, or misdiagnosed) does nothing instead of silently
// unblocking someone who should stay blocked.
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('გამოყენება: npx tsx prisma/reset-broken-card-user.ts <email>');
    process.exit(1);
  }

  const user = await p.user.findUnique({ where: { email } });
  if (!user) {
    console.error('ვერ მოიძებნა:', email);
    process.exit(1);
  }

  if (user.subscriptionStatus === 'FREE') {
    console.log(`— ${user.name} <${email}> უკვე FREE სტატუსზეა, გასაკეთებელი აღარაფერია.`);
    await p.$disconnect();
    return;
  }

  const lastFailed = await p.payment.findFirst({
    where: { userId: user.id, status: 'FAILED' },
    orderBy: { createdAt: 'desc' },
  });

  const fingerprint = /getting saved card info/i;
  const matches = lastFailed?.failureReason && fingerprint.test(lastFailed.failureReason);

  if (!matches) {
    console.error(
      `⚠️  ${user.name} <${email}>-ის ბოლო ჩავარდნილი გადახდა არ ემთხვევა "ბარათი ვერ მოიძებნა" ნიშანს — ` +
      `შეიძლება ეს ჩვეულებრივი უარყოფილი ბარათია (თანხის უკმარისობა, ვადაგასული ბარათი და ა.შ.), არა ეს კონკრეტული ბაგი. ` +
      `არაფერი შეიცვალა უსაფრთხოებისთვის.\n` +
      `ბოლო FAILED ჩანაწერის მიზეზი: ${lastFailed?.failureReason ?? '(FAILED ჩანაწერი საერთოდ არ მოიძებნა)'}`
    );
    await p.$disconnect();
    process.exit(1);
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
      // bogTrialUsed intentionally left unchanged (stays true) — bog-checkout/route.ts
      // already charges immediately (no second free trial) once this is true, so a fresh
      // checkout just works correctly with no other code change needed.
    },
  });

  console.log(`✓ ${user.name} <${email}>: დაუბრუნდა FREE სტატუსს. თუ ხელახლა შეიყვანენ ბარათს, დაუყოვნებლივ ჩამოეჭრებათ თანხა, ახალი 7-დღიანი ტესტის გარეშე.`);

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
