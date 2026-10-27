// Read-only: lists USD payments (with the card type BOG reported) and withdrawals per currency.
// Run: npx tsx prisma/check-usd-payments.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const usd = await prisma.payment.findMany({
    where: { currency: 'USD' },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true, status: true, grossAmount: true, cardType: true, deletedUserEmail: true, user: { select: { email: true } } },
  });
  console.log(`USD გადახდები: ${usd.length}`);
  for (const p of usd) {
    console.log(`${p.createdAt.toISOString().slice(0, 16)}  ${p.status.padEnd(9)} ${String(p.grossAmount).padStart(6)}$  ბარათი(BOG): ${p.cardType ?? '-'}  ${p.user?.email ?? p.deletedUserEmail ?? ''}`);
  }
  const w = await prisma.withdrawal.groupBy({ by: ['currency'], _sum: { amount: true }, _count: true });
  console.log('\nგატანები ვალუტის მიხედვით:');
  for (const r of w) console.log(`${r.currency}: ${r._count} ჩანაწერი, სულ ${r._sum.amount ?? 0}`);
}
main().finally(() => prisma.$disconnect());
