import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma';

async function main() {
  const database = new URL(process.env.DATABASE_URL || '');
  assert(['localhost', '127.0.0.1'].includes(database.hostname), 'Finance review requires a local disposable database');
  const origin = 'http://localhost:3001';
  const login = await fetch(`${origin}/api/auth/login`, { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'owner@review.local', password: 'Review-only-2026!' }) });
  assert.equal(login.status, 200);
  const cookie = login.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
  const ids: string[] = [];
  try {
    for (const market of ['GE', 'INTL'] as const) {
      const user = await prisma.user.findUniqueOrThrow({ where: { email: market === 'GE' ? 'georgian@review.local' : 'parent@review.local' } });
      const payment = await prisma.payment.create({ data: {
        userId: user.id, plan: 'FULL_PLAN', billingIntervalMonths: 1, status: 'SUCCESS', bogOrderId: `finance-review-${randomUUID()}`,
        currency: market === 'GE' ? 'GEL' : 'USD', grossAmount: market === 'GE' ? 17 : 15,
        commissionAmount: market === 'GE' ? .34 : null, netAmount: market === 'GE' ? 16.66 : null,
      } });
      ids.push(payment.id);
      const response = await fetch(`${origin}/admin/analytics?market=${market}`, { headers: { origin, cookie } });
      assert.equal(response.status, 200);
      const html = await response.text();
      const text = html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      assert.match(text, market === 'GE' ? /MRR \(ყოველთვიური\)\s*17\s*₾/ : /MRR \(ყოველთვიური\)\s*15\s*\$/);
      if (market === 'INTL') {
        assert.match(text, /ბანკის საკომისიო\s*დაუზუსტებელი/);
        assert.match(text, /დარჩენილი ბალანსი\s*დაუზუსტებელი/);
        assert.match(text, /სრული შემოსავალი\s*15\.00\s*\$/);
      }
    }
    console.log('PASS: actual GEL/USD paid fixtures report separate MRR and collected amounts; USD settlement and commission remain explicitly unconfirmed.');
  } finally {
    await prisma.payment.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
