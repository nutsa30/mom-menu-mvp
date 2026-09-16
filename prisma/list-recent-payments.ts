import { prisma } from '../lib/prisma';

// Diagnostic: lists every SUCCESS payment from the last 40 days with its exact date, so we
// can see precisely which ones fall inside vs. outside the admin page's rolling "last 30
// days" gross-revenue window (that card is intentionally scoped to 30 days — a payment
// older than that still counts the customer as an active subscriber elsewhere on the page,
// but won't show up in that specific card's total).
async function main() {
  const cutoff40 = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
  const cutoff30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const payments = await prisma.payment.findMany({
    where: { status: 'SUCCESS', createdAt: { gte: cutoff40 } },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  });

  console.log(`ბოლო 40 დღის წარმატებული გადახდები (სულ ${payments.length}):\n`);
  for (const p of payments) {
    const inLast30 = new Date(p.createdAt) > cutoff30;
    const name = p.user?.name ?? (p as any).deletedUserName ?? '(წაშლილი ანგარიში)';
    const email = p.user?.email ?? (p as any).deletedUserEmail ?? '';
    console.log(
      `${p.createdAt.toISOString().slice(0, 10)}  ${inLast30 ? '✅ ბოლო 30 დღეში' : '❌ 30 დღეზე ძველი'}  ${p.grossAmount}₾ / ${p.billingIntervalMonths}თვე  —  ${name} (${email})`
    );
  }

  const sumLast30 = payments.filter((p) => new Date(p.createdAt) > cutoff30).reduce((s, p) => s + p.grossAmount, 0);
  console.log(`\nჯამი ბოლო 30 დღეში: ${sumLast30.toFixed(2)}₾`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
