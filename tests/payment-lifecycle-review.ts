import assert from 'node:assert/strict';
import { generateKeyPairSync, sign, randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma';
import { encodeOrderId } from '../lib/bog';
import { POST } from '../app/api/webhooks/bog/route';
import jwt from 'jsonwebtoken';

async function main() {
  assert(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL || '').hostname));
  assert.equal(process.env.MOMMENU_SANDBOX, '1');
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const oldKey = process.env.BOG_PUBLIC_KEY;
  process.env.BOG_PUBLIC_KEY = Buffer.from(publicKey.export({ type: 'spki', format: 'pem' })).toString('base64');
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    if (String(input).startsWith('http://localhost:3001/')) return originalFetch(input, init);
    throw new Error('External requests forbidden during payment lifecycle review');
  };
  const users: string[] = [], orders: string[] = [];
  const children: string[] = [];
  async function callback(id: string, external: string, status = 'completed', valid = true) {
    const body = JSON.stringify({ event: 'order_payment', body: {
      order_id: id, external_order_id: external, order_status: { key: status },
      payment_detail: { card_type: 'visa' },
    } });
    return POST(new Request('http://localhost:3001/api/webhooks/bog', {
      method: 'POST', body, headers: { 'callback-signature': valid ? sign('RSA-SHA256', Buffer.from(body), privateKey).toString('base64') : 'invalid' },
    }));
  }
  try {
    for (const market of ['GE', 'INTL']) for (const interval of [1, 3, 6] as const) {
      const currency = market === 'GE' ? 'GEL' : 'USD';
      const amount = market === 'GE' ? ({ 1: 17, 3: 39, 6: 59 })[interval] : ({ 1: 15, 3: 34, 6: 52 })[interval];
      const user = await prisma.user.create({ data: { name: 'Payment lifecycle fixture', email: `${randomUUID()}@review.local`, market, locale: market === 'GE' ? 'ka' : 'en', subscriptionCurrency: currency } });
      users.push(user.id);
      const child = await prisma.child.create({ data: { name: 'Payment access fixture', userId: user.id, birthDate: new Date('2025-01-01'), ageGroup: 'FROM_12' } });
      children.push(child.id);
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: 'USER', market, locale: user.locale }, process.env.JWT_SECRET!);
      const headers = { origin: 'http://localhost:3001', cookie: `mom_menu_token=${token}`, 'content-type': 'application/json' };
      const access = () => fetch('http://localhost:3001/api/daily-log?childId=' + child.id, { headers });
      assert.equal((await access()).status, 403);
      const order = `lifecycle-${randomUUID()}`; orders.push(order);
      await prisma.checkoutOrder.create({ data: { id: order, userId: user.id, currency, amount, interval, trial: false } });
      const external = encodeOrderId(user.id, interval);
      assert.equal((await callback(order, external, 'completed', false)).status, 401);
      assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).subscriptionStatus, 'FREE');
      const before = Date.now();
      assert.equal((await callback(order, external)).status, 200);
      const paid = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
      assert.equal(paid.subscriptionStatus, 'FULL_PLAN');
      assert.equal(paid.subscriptionCurrency, currency);
      assert.equal(paid.billingIntervalMonths, interval);
      assert.equal(paid.subscriptionAmount, amount);
      assert.equal((await access()).status, 200);
      const expected = interval * 30 * 86400000;
      assert(paid.subscriptionRenewsAt!.getTime() - before >= expected - 1000);
      assert(paid.subscriptionRenewsAt!.getTime() - before <= expected + 10000);
      assert.equal((await callback(order, external)).status, 200);
      assert.equal(await prisma.payment.count({ where: { bogOrderId: order } }), 1);
      assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).subscriptionRenewsAt!.getTime(), paid.subscriptionRenewsAt!.getTime());
      const renewal = `renewal-${randomUUID()}`;
      assert.equal((await callback(renewal, `mm_renew_${user.id}_${Date.now()}`, 'rejected')).status, 200);
      assert((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).paymentFailedAt);
      assert.equal((await access()).status, 403);
      const retry = renewal; // capture succeeds after this order was recorded as FAILED
      assert.equal((await callback(retry, `mm_renew_${user.id}_${Date.now()}`)).status, 200);
      assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).paymentFailedAt, null);
      assert.equal((await access()).status, 200);
      assert.equal(await prisma.payment.count({ where: { bogOrderId: retry } }), 1);
      assert.equal((await prisma.payment.findUniqueOrThrow({ where: { bogOrderId: retry } })).status, 'SUCCESS');
      const cancellation = await fetch('http://localhost:3001/subscription/cancel', { method: 'POST', headers, body: JSON.stringify({ reason: 'NOT_NEEDED' }) });
      assert.equal(cancellation.status, 200);
      assert.equal((await access()).status, 200);
      await prisma.user.update({ where: { id: user.id }, data: { subscriptionRenewsAt: new Date(Date.now() - 1000) } });
      assert.equal((await access()).status, 403);
      console.log(`PASS: ${currency} ${interval} month purchase, signed callback, exact duration, duplicate delivery, rejected renewal and successful retry`);
    }
    const user = await prisma.user.create({ data: { name: 'Rollback fixture', email: `${randomUUID()}@review.local`, market: 'INTL', subscriptionCurrency: 'USD' } });
    users.push(user.id);
    const order = `rollback-${randomUUID()}`; orders.push(order);
    await prisma.checkoutOrder.create({ data: { id: order, userId: user.id, currency: 'USD', amount: 15, interval: 1, trial: false } });
    const originalTransaction = prisma.$transaction.bind(prisma);
    try {
      prisma.$transaction = (async (action: any) => originalTransaction(async tx => action({ ...tx,
        user: { ...tx.user, update: async () => { throw new Error('Injected activation failure'); } },
      }))) as typeof prisma.$transaction;
      await assert.rejects(callback(order, encodeOrderId(user.id, 1)), /Injected activation failure/);
    } finally { prisma.$transaction = originalTransaction as typeof prisma.$transaction; }
    assert.equal(await prisma.payment.count({ where: { bogOrderId: order } }), 0);
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).subscriptionStatus, 'FREE');
    assert.equal((await callback(order, encodeOrderId(user.id, 1))).status, 200);
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).subscriptionStatus, 'FULL_PLAN');
    console.log('PASS: activation failure rolls back payment; retry activates the plan successfully; no real bank requests or email');
  } finally {
    globalThis.fetch = originalFetch;
    if (oldKey === undefined) delete process.env.BOG_PUBLIC_KEY; else process.env.BOG_PUBLIC_KEY = oldKey;
    await prisma.payment.deleteMany({ where: { userId: { in: users } } });
    await prisma.subscriptionCancellation.deleteMany({ where: { userId: { in: users } } });
    await prisma.dailyLog.deleteMany({ where: { childId: { in: children } } });
    await prisma.child.deleteMany({ where: { id: { in: children } } });
    await prisma.checkoutOrder.deleteMany({ where: { id: { in: orders } } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
