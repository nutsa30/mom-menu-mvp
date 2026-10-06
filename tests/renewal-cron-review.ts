import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { prisma } from '../lib/prisma';

async function main() {
  assert(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL || '').hostname));
  assert.equal(process.env.MOMMENU_SANDBOX, '1');
  process.env.CRON_SECRET ||= `local-review-${randomUUID()}`;
  const { GET } = await import('../app/api/cron/bog-renew/route');
  assert.equal(await prisma.user.count({ where: { bogParentOrderId: { not: null }, subscriptionCanceledAt: null, isGifted: false, subscriptionStatus: { in: ['FULL_PLAN', 'RECIPE_PLAN'] }, subscriptionRenewsAt: { lte: new Date() } } }), 0, 'No unrelated due subscriptions may be present');
  const ids: string[] = [];
  try {
    for (const currency of ['GEL', 'USD']) {
      const user = await prisma.user.create({ data: {
        email: `${randomUUID()}@review.local`, name: 'Renewal cron fixture',
        market: currency === 'USD' ? 'INTL' : 'GE', subscriptionCurrency: currency,
        subscriptionAmount: currency === 'USD' ? 13.5 : 15.3,
        subscriptionStatus: 'FULL_PLAN', billingIntervalMonths: 1,
        subscriptionRenewsAt: new Date(Date.now() - 1000), bogParentOrderId: `review-${randomUUID()}`,
      } }); ids.push(user.id);
    }
    const response = await GET(new NextRequest('http://localhost:3001/api/cron/bog-renew', { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } }));
    assert.equal(response.status, 200);
    const result = await response.json(); assert.equal(result.failed, 2);
    for (const id of ids) {
      const account = await prisma.user.findUniqueOrThrow({ where: { id } });
      const payment = await prisma.payment.findFirstOrThrow({ where: { userId: id } });
      assert.equal(payment.currency, account.subscriptionCurrency);
      assert.equal(payment.grossAmount, account.subscriptionAmount);
      assert.equal(payment.status, 'FAILED'); assert(account.paymentFailedAt);
      assert.equal(account.subscriptionStatus, 'FULL_PLAN'); assert(account.bogParentOrderId);
    }
    console.log('PASS: cron authentication, failed renewal recording in correct GEL/USD currency and immutable price; saved-card retry state retained; sandbox prevents bank calls');
  } finally {
    await prisma.payment.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
