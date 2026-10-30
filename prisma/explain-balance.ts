// Read-only: shows every successful payment and exactly how much of it is counted in the
// balance, plus withdrawals. Run: npx tsx prisma/explain-balance.ts
import { PrismaClient } from '@prisma/client';
import { getNbgUsdRate, tbilisiDay } from '../lib/nbg-rate';
import { cardOf, cardStats, isSettled, resolveUsdPayment } from '../lib/usd-settlement';

const prisma = new PrismaClient();
const f = (n: number) => n.toFixed(2).padStart(8);

async function main() {
  const payments = await prisma.payment.findMany({
    where: { status: 'SUCCESS' },
    orderBy: { createdAt: 'asc' },
    select: {
      createdAt: true, currency: true, grossAmount: true, netAmount: true, commissionAmount: true,
      discountAmount: true, discountRefundFailed: true, creditAppliedAmount: true, creditRefundFailed: true,
      cardType: true, settledCardType: true, settledAmountGel: true, settledFxRate: true,
      user: { select: { email: true } }, deletedUserEmail: true,
    },
  });
  const usd = payments.filter((p) => p.currency === 'USD');
  const stats = cardStats(usd);
  const lastKnownRate = [...usd].filter(isSettled).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.settledFxRate ?? null;

  let total = 0;
  console.log('თარიღი       ვალ  ბრუტო   ჩაითვალა  სტატუსი     შენიშვნა');
  for (const p of payments) {
    const who = p.user?.email ?? p.deletedUserEmail ?? '';
    const day = tbilisiDay(p.createdAt);
    if (p.currency !== 'USD') {
      const discount = p.discountRefundFailed ? 0 : (p.discountAmount ?? 0);
      const credit = p.creditRefundFailed ? 0 : (p.creditAppliedAmount ?? 0);
      const net = (p.netAmount ?? 0) - discount - credit;
      total += net;
      console.log(`${day}  GEL ${f(p.grossAmount)} ${f(net)}  ზუსტი       წმინდა BOG-დან${discount || credit ? `, დაბრუნება -${discount + credit}` : ''}  ${who}`);
    } else {
      const rate = isSettled(p) ? p.settledFxRate : (await getNbgUsdRate(day)) ?? lastKnownRate;
      const r = resolveUsdPayment(p, stats, rate);
      total += r.netGel;
      console.log(`${day}  USD ${f(p.grossAmount)} ${f(r.netGel)}  ${r.status.padEnd(10)}  კურსი ${r.rate ?? '?'}, ბარათი ${cardOf(p) ?? '?'}  ${who}`);
    }
  }
  const w = await prisma.withdrawal.findMany({ orderBy: { createdAt: 'asc' } });
  const withdrawn = w.reduce((s, x) => s + x.amount, 0);
  console.log(`\nსულ შემოსავალი (ჩათვლილი): ${total.toFixed(2)}`);
  console.log('გატანები:');
  for (const x of w) console.log(`  ${x.createdAt.toISOString().slice(0, 10)}  ${x.amount} ${x.currency}  ${x.note ?? ''}`);
  console.log(`სულ გატანილი: ${withdrawn.toFixed(2)}`);
  console.log(`ბალანსი: ${(total - withdrawn).toFixed(2)}`);
}
main().finally(() => prisma.$disconnect());
