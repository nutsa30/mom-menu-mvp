import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Diagnostic: figures out where a subscriber who dropped out of the admin's paid-subscriber
// counts actually went. Three distinct places someone can disappear from the "1/3/6 თვე"
// cards to, only one of which is a bug:
//  1. Moved to "⚠️ გადახდა ვერ ჩამოეჭრა" (paymentFailedAt set) — expected, see the BOG webhook.
//  2. Fully expired out of an EARLIER cancellation (subscriptionStatus flipped FULL_PLAN →
//     CANCELED by bog-renew's cron once their already-canceled paid period ran out) — also
//     expected, just not shown on any single stat card right now (a real gap, separate from
//     a bug).
//  3. Something else entirely (never went through either path) — would need investigating.
async function main() {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  const paymentFailed = await p.user.findMany({
    where: { paymentFailedAt: { not: null } },
    select: { name: true, email: true, paymentFailedAt: true, billingIntervalMonths: true },
  });
  console.log(`=== ამჟამად "გადახდა ვერ ჩამოეჭრა"-ში (${paymentFailed.length}) ===`);
  for (const u of paymentFailed) {
    console.log(`- ${u.name} (${u.email}) — ${u.billingIntervalMonths}თვე, დაბლოკილია: ${u.paymentFailedAt?.toISOString()}`);
  }

  // Fully-expired-after-an-earlier-cancellation users — CANCELED status, no active renewal
  // date anymore (that's what the cron clears on downgrade). Cross-referenced against their
  // last real Payment to guess WHEN they actually dropped off (Payment stores its own
  // billingIntervalMonths, so this works even though the user record itself no longer does).
  const fullyCanceled = await p.user.findMany({
    where: { subscriptionStatus: 'CANCELED', subscriptionCanceledAt: { not: null } },
    select: { id: true, name: true, email: true, subscriptionCanceledAt: true },
  });

  console.log(`\n=== სულ დასრულებული (CANCELED) გამოწერები, ვისაც ადრე გაუუქმებია (${fullyCanceled.length}) ===`);
  const recentlyExpired: typeof fullyCanceled = [];
  for (const u of fullyCanceled) {
    const lastPayment = await p.payment.findFirst({
      where: { userId: u.id, status: 'SUCCESS' },
      orderBy: { createdAt: 'desc' },
    });
    if (!lastPayment || !lastPayment.billingIntervalMonths) continue;
    const expiry = new Date(lastPayment.createdAt.getTime() + lastPayment.billingIntervalMonths * 30 * 24 * 60 * 60 * 1000);
    if (expiry > twoDaysAgo) {
      recentlyExpired.push(u);
      console.log(`- ${u.name} (${u.email}) — ბოლო გადახდა: ${lastPayment.createdAt.toISOString().slice(0, 10)} (${lastPayment.billingIntervalMonths}თვე), ვადა გაუვიდა: ${expiry.toISOString().slice(0, 10)} ⚠️ ახლახანს`);
    }
  }
  if (recentlyExpired.length === 0) {
    console.log('(ბოლო 2 დღეში არავის გასდისვადა — ეს ალბათ არ არის იმ ორი ადამიანის ახსნა)');
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
