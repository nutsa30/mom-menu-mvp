// Read-only: asks BOG for the receipt of the Amex payments (and a few Visa/Mastercard ones
// for comparison) to see what differs between a 2% and a 3.5% Amex payment (card issuer BIN,
// card category, etc.). Personal data and full card numbers are hidden in the output.
// Run: npx tsx prisma/inspect-amex-receipts.ts
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// load .env.local / .env (the BOG credentials live there)
for (const file of ['.env.local', '.env']) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const prisma = new PrismaClient();
const HIDE = /name|mail|phone|address|expir|trx|rrn|auth|token|ip$|ip_|session|url|callback|redirect|id$/i;

function clean(node: any, key = ''): any {
  if (node == null) return node;
  if (Array.isArray(node)) return node.map((x) => clean(x, key));
  if (typeof node === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(node)) out[k] = clean(v, k);
    return out;
  }
  if (/payer_identifier|card_number|pan/i.test(key) && typeof node === 'string') return `${node.replace(/\D/g, '').slice(0, 6)}****** (BIN)`;
  if (HIDE.test(key)) return '[hidden]';
  return node;
}

async function main() {
  const { getPaymentDetails } = await import('../lib/bog');
  const amex = await prisma.payment.findMany({
    where: { status: 'SUCCESS', currency: 'GEL', cardType: { contains: 'amex', mode: 'insensitive' } },
    orderBy: { createdAt: 'asc' },
    select: { bogOrderId: true, createdAt: true, grossAmount: true, commissionAmount: true, cardType: true },
  });
  const others = await prisma.payment.findMany({
    where: { status: 'SUCCESS', currency: 'GEL', NOT: { cardType: { contains: 'amex', mode: 'insensitive' } } },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { bogOrderId: true, createdAt: true, grossAmount: true, commissionAmount: true, cardType: true },
  });
  for (const p of [...amex, ...others]) {
    const pct = p.grossAmount > 0 ? (((p.commissionAmount ?? 0) / p.grossAmount) * 100).toFixed(1) : '?';
    console.log(`\n=== ${p.createdAt.toISOString().slice(0, 10)}  ${p.grossAmount}₾  ${p.cardType}  საიტმა: ${pct}%  ორდერი: ${p.bogOrderId.slice(0, 8)}…`);
    try {
      const receipt = await getPaymentDetails(p.bogOrderId);
      console.log(JSON.stringify(clean(receipt), null, 1).replace(/\n\s*/g, ' '));
    } catch (e: any) {
      console.log('ვერ მივიღე ჩეკი:', String(e?.message ?? e).slice(0, 200));
    }
  }
}
main().finally(() => prisma.$disconnect());
