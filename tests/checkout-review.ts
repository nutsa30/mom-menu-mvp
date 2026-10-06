import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createDirectOrder, createTrialOrder } from '../lib/bog';
import { prisma } from '../lib/prisma';

async function main() {
  const database = new URL(process.env.DATABASE_URL || '');
  assert(['localhost', '127.0.0.1'].includes(database.hostname), 'Checkout review requires a local disposable database');
  const originalFetch = globalThis.fetch;
  const originalSandbox = process.env.MOMMENU_SANDBOX;
  const originalClientId = process.env.BOG_CLIENT_ID;
  const originalClientSecret = process.env.BOG_CLIENT_SECRET;
  const orderIds: string[] = [];
  let captured: any;
  let capturedLanguage: string | undefined;
  // Every fetch is intercepted. No request reaches a payment provider.
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url === 'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token') {
      return Response.json({ access_token: 'local-review-token', expires_in: 3600 });
    }
    if (url === 'https://api.bog.ge/payments/v1/ecommerce/orders') {
      captured = JSON.parse(String(init?.body));
      capturedLanguage = (init?.headers as Record<string, string>)['Accept-Language'];
      const id = `review-${randomUUID()}`;
      orderIds.push(id);
      return Response.json({ id, _links: { redirect: { href: `https://payment.invalid/${id}` } } });
    }
    if (orderIds.some(id => url === `https://api.bog.ge/payments/v1/orders/${id}/subscriptions`)) {
      return new Response(null, { status: 204 });
    }
    throw new Error(`Unexpected fetch during isolated checkout test: ${url}`);
  };
  process.env.MOMMENU_SANDBOX = '0';
  process.env.BOG_CLIENT_ID = 'local-review';
  process.env.BOG_CLIENT_SECRET = 'local-review';
  try {
    for (const market of ['GE', 'INTL'] as const) {
      for (const interval of [1, 3, 6] as const) {
        const expected = market === 'GE' ? ({ 1: 17, 3: 39, 6: 59 })[interval] : ({ 1: 15, 3: 34, 6: 52 })[interval];
        const opts = { market, interval, userId: 'localreview', name: 'Local review', email: 'review@example.invalid', locale: market === 'GE' ? 'ka' as const : 'en' as const };
        const result = await createDirectOrder(opts);
        assert.equal(captured.purchase_units.currency, market === 'GE' ? 'GEL' : 'USD');
        assert.equal(captured.purchase_units.total_amount, expected);
        assert.equal(captured.purchase_units.basket[0].unit_price, expected);
        assert.equal(captured.capture, 'automatic');
        assert.equal(capturedLanguage, opts.locale);
        assert.deepEqual(captured.payment_method, ['card']);
        const snapshot = await prisma.checkoutOrder.findUniqueOrThrow({ where: { id: result.orderId } });
        assert.equal(snapshot.currency, captured.purchase_units.currency);
        assert.equal(snapshot.amount, expected);
        assert.equal(snapshot.interval, interval);
        assert.equal(snapshot.trial, false);
        await createTrialOrder({ ...opts, discountPercent: 10 });
        assert.equal(captured.capture, 'manual');
        assert.equal(captured.purchase_units.total_amount, Math.round(expected * .9 * 100) / 100);
      }
    }
    console.log('PASS: all GEL/USD checkout tiers, discounted trials, language, card saving and immutable order snapshots; no external requests.');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSandbox === undefined) delete process.env.MOMMENU_SANDBOX; else process.env.MOMMENU_SANDBOX = originalSandbox;
    if (originalClientId === undefined) delete process.env.BOG_CLIENT_ID; else process.env.BOG_CLIENT_ID = originalClientId;
    if (originalClientSecret === undefined) delete process.env.BOG_CLIENT_SECRET; else process.env.BOG_CLIENT_SECRET = originalClientSecret;
    await prisma.checkoutOrder.deleteMany({ where: { id: { in: orderIds } } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
