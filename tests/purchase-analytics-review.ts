import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma';
async function main() {
  assert(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL || '').hostname), 'Requires a disposable local database');
  assert.equal(process.env.MOMMENU_SANDBOX, '1');
  const origin = 'http://localhost:3001';
  async function login(email: string) {
    const result = await fetch(`${origin}/api/auth/login`, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify({ email, password: 'Review-only-2026!' }) });
    assert.equal(result.status, 200);
    return result.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
  }
  const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'parent@review.local' } });
  const cookie = await login(owner.email), otherCookie = await login('georgian@review.local');
  const orderId = `analytics-review-${randomUUID()}`;
  const endpoint = `${origin}/api/analytics/purchase?orderId=${orderId}`;
  let id: string | undefined;
  try {
    assert.equal((await fetch(endpoint)).status, 401);
    assert.deepEqual(await (await fetch(endpoint, { headers: { cookie } })).json(), { pending: true });
    const payment = await prisma.payment.create({ data: { userId: owner.id, plan: 'FULL_PLAN', status: 'SUCCESS', bogOrderId: orderId, grossAmount: 15, currency: 'USD', billingIntervalMonths: 1 } });
    id = payment.id;
    const response = await fetch(endpoint, { headers: { cookie } });
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    const data = await response.json();
    assert.equal(data.transaction_id, orderId); assert.equal(data.value, 15); assert.equal(data.currency, 'USD');
    assert.equal(data.items[0].item_id, 'plan_1m');
    assert.deepEqual(await (await fetch(endpoint, { headers: { cookie: otherCookie } })).json(), { pending: true });
    for (const status of ['FAILED', 'REFUNDED'] as const) {
      await prisma.payment.update({ where: { id }, data: { status } });
      assert.deepEqual(await (await fetch(endpoint, { headers: { cookie } })).json(), { pending: true });
    }
    console.log('PASS: analytics uses owned confirmed payments only; no forged return URL, failed payment, refund or other account leaks a purchase.');
  } finally {
    if (id) await prisma.payment.delete({ where: { id } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
