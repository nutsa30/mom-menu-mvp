// Read-only: GEL payments grouped by the card type BOG reported and the commission the site
// assumed. Run: npx tsx prisma/check-commission-cards.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.payment.findMany({
    where: { status: 'SUCCESS', currency: 'GEL' },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true, grossAmount: true, commissionAmount: true, netAmount: true, cardType: true, user: { select: { email: true } }, deletedUserEmail: true },
  });
  const groups = new Map<string, number>();
  for (const r of rows) {
    const pct = r.grossAmount > 0 ? ((r.commissionAmount ?? 0) / r.grossAmount) * 100 : 0;
    const key = `ბარათი(BOG): ${r.cardType ?? '-'}  |  საიტმა დათვალა: ${pct.toFixed(1)}%`;
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  console.log('ჯგუფები:');
  for (const [k, n] of groups) console.log(`  ${n} ცალი  ${k}`);
  console.log('\nგადახდები, სადაც საიტმა 2%-ზე მეტი დათვალა:');
  for (const r of rows) {
    const pct = r.grossAmount > 0 ? ((r.commissionAmount ?? 0) / r.grossAmount) * 100 : 0;
    if (pct > 2.5) console.log(`  ${r.createdAt.toISOString().slice(0, 10)}  ${r.grossAmount}₾  საკომისიო ${r.commissionAmount} (${pct.toFixed(1)}%)  ბარათი: ${r.cardType ?? '-'}  ${r.user?.email ?? r.deletedUserEmail ?? ''}`);
  }
}
main().finally(() => prisma.$disconnect());
