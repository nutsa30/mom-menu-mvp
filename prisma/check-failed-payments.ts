import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Diagnostic: every FAILED payment attempt (recorded since the webhook started saving
// them) with as much detail as we currently store, so it's clear who declined and on
// which card type. We do NOT yet store BOG's specific decline reason (insufficient funds,
// expired card, bank-side block, etc.) — this script shows what's available today.
async function main() {
  const since = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // last 3 days

  const failed = await p.payment.findMany({
    where: { status: 'FAILED', createdAt: { gte: since } },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true, billingIntervalMonths: true, paymentFailedAt: true } } },
  });

  console.log(`ბოლო 3 დღეში წარუმატებელი ჩამოჭრის მცდელობა: ${failed.length}\n`);

  for (const pay of failed) {
    console.log('──────────────────────────────');
    console.log('მომხმარებელი:', pay.user.name, `(${pay.user.email})`);
    console.log('თარიღი:', pay.createdAt.toISOString());
    console.log('თანხა:', pay.grossAmount, '₾ /', pay.billingIntervalMonths, 'თვე');
    console.log('ბარათის ტიპი:', pay.cardType ?? 'უცნობი');
    console.log('BOG Order ID:', pay.bogOrderId);
    console.log('მიზეზი:', (pay as any).failureReason ?? '(ჯერ არ ინახებოდა ამ თარიღისთვის)');
    console.log('ამჟამად დაბლოკილია საიტზე:', pay.user.paymentFailedAt ? 'კი' : 'არა (მას შემდეგ გადაიხადა ან სხვაგვარად გასწორდა)');
  }

  if (failed.length === 0) {
    console.log('ბოლო 3 დღეში არცერთი წარუმატებელი მცდელობა არ დაფიქსირებულა ბაზაში.');
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
