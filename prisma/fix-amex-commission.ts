// Re-computes the stored commission/net of GEL Amex payments using the card's BIN from BOG's
// receipt (see computeCommission in lib/bog.ts). Only commissionAmount/netAmount change.
// Run: npx tsx prisma/fix-amex-commission.ts
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

for (const file of ['.env.local', '.env']) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const prisma = new PrismaClient();

async function main() {
  const { getPaymentDetails, computeCommission } = await import('../lib/bog');
  const rows = await prisma.payment.findMany({
    where: { status: 'SUCCESS', currency: 'GEL', cardType: { contains: 'amex', mode: 'insensitive' } },
    orderBy: { createdAt: 'asc' },
    select: { id: true, bogOrderId: true, createdAt: true, grossAmount: true, commissionAmount: true, netAmount: true, cardType: true },
  });
  let changed = 0, gain = 0;
  for (const r of rows) {
    const day = new Date(r.createdAt.getTime() + 4 * 3600 * 1000).toISOString().slice(0, 10);
    let bin = '';
    try {
      const receipt = await getPaymentDetails(r.bogOrderId);
      bin = String(receipt?.payment_detail?.payer_identifier ?? '').replace(/\D/g, '').slice(0, 6);
    } catch {
      console.log(`გამოტოვებულია (ჩეკი ვერ მივიღე): ${day} ${r.grossAmount}₾`);
      continue;
    }
    const { commissionAmount, netAmount } = computeCommission(r.grossAmount, r.cardType, bin);
    if (r.commissionAmount === commissionAmount && r.netAmount === netAmount) {
      console.log(`უცვლელი:  ${day} ${r.grossAmount}₾  BIN ${bin}  საკომისიო ${commissionAmount}`);
      continue;
    }
    await prisma.payment.update({ where: { id: r.id }, data: { commissionAmount, netAmount } });
    console.log(`შესწორდა: ${day} ${r.grossAmount}₾  BIN ${bin}  წმინდა ${r.netAmount} -> ${netAmount}`);
    changed++;
    gain += netAmount - (r.netAmount ?? 0);
  }
  console.log(`\nშესწორდა ${changed} გადახდა, ბალანსი გაიზარდა ${gain.toFixed(2)}₾-ით`);
}
main().finally(() => prisma.$disconnect());
