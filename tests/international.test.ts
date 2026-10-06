import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { marketForCountry, planPrice, currencyFor, referralReward, localDay, validTimeZone } from '../lib/market';
import { ingredientQuantity } from '../lib/measurements';
import { verifiedPayload } from '../lib/edge-token';
import { hasPaidAccess } from '../lib/paid-access';

test('paid access expires at the end of the purchased period and blocks declined payments', () => {
  const now = Date.now();
  const account = { subscriptionStatus: 'FULL_PLAN', subscriptionRenewsAt: new Date(now + 1000) };
  assert.equal(hasPaidAccess(account, true, now), true);
  assert.equal(hasPaidAccess(account, true, now + 1000), false);
  assert.equal(hasPaidAccess({ ...account, paymentFailedAt: new Date(now) }, true, now), false);
  assert.equal(hasPaidAccess({ ...account, isBlocked: true }, true, now), false);
  assert.equal(hasPaidAccess({ subscriptionStatus: 'FREE', role: 'ADMIN' }, true, now), true);
  assert.equal(hasPaidAccess({ subscriptionStatus: 'RECIPE_PLAN' }, true, now), false);
});

test('foreign discovery and unknown IP preserve the appropriate market', () => {
  assert.equal(marketForCountry('US'), 'INTL');
  assert.equal(marketForCountry('GB'), 'INTL');
  for (const country of ['GE', null, '', 'XX', 'ZZ', 'invalid']) assert.equal(marketForCountry(country), 'GE');
});
test('pricing and referral rewards remain separate across currencies', () => {
  process.env.BOG_PLAN_1M_AMOUNT_GEL = '17'; process.env.BOG_PLAN_3M_AMOUNT_GEL = '39'; process.env.BOG_PLAN_6M_AMOUNT_GEL = '59';
  assert.deepEqual([1,3,6].map(i => planPrice('INTL', i as 1|3|6)), [15,34,52]);
  assert.deepEqual([1,3,6].map(i => planPrice('GE', i as 1|3|6)), [17,39,59]);
  assert.equal(currencyFor('GE'), 'GEL'); assert.equal(currencyFor('INTL'), 'USD');
  assert.equal(referralReward('GE'), 1.7); assert.equal(referralReward('INTL'), 1.5);
  delete process.env.BOG_PLAN_1M_AMOUNT_GEL;
  assert.throws(() => planPrice('GE', 1));
  process.env.BOG_PLAN_1M_AMOUNT_GEL = '17';
});
test('quantities distinguish weight, US volume and UK volume without guessing density', () => {
  assert.equal(ingredientQuantity('Milk 100 ml', 'us'), 'Milk 3.38 US fl oz (100 ml)');
  assert.equal(ingredientQuantity('Milk 100 ml', 'uk'), 'Milk 3.52 UK fl oz (100 ml)');
  assert.equal(ingredientQuantity('Oats 100 g', 'us'), 'Oats 3.53 oz (100 g)');
  assert.equal(ingredientQuantity('Oats 1/2 kg', 'uk'), 'Oats 17.64 oz (1/2 kg)');
  assert.equal(ingredientQuantity('Milk 100–200 ml', 'us'), 'Milk 3.38–6.76 US fl oz (100–200 ml)');
  assert.equal(ingredientQuantity('1 cup flour; 2 apples', 'us'), '1 cup flour; 2 apples');
  assert.equal(ingredientQuantity('0/0 g', 'us'), '0/0 g');
  assert.equal(ingredientQuantity('100 g', 'metric'), '100 g');
});
test('local dates cross UTC boundaries and reject invalid zones', () => {
  const date = new Date('2026-10-04T21:00:00Z');
  assert.equal(localDay(date, 'Asia/Tbilisi'), '2026-10-05');
  assert.equal(localDay(date, 'America/New_York'), '2026-10-04');
  assert.equal(validTimeZone('Europe/London'), true);
  assert.equal(validTimeZone('fake/timezone'), false);
});
test('preview and identity cookies reject tampering, wrong audience and expiry', async () => {
  process.env.JWT_SECRET = 'test-only-secret-not-for-production';
  const signed = jwt.sign({ id: 'owner', role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  assert.equal((await verifiedPayload(signed))?.id, 'owner');
  const parts=signed.split('.'); parts[1]=Buffer.from(JSON.stringify({ id: 'intruder', role: 'ADMIN', exp: 9999999999 })).toString('base64url');
  assert.equal(await verifiedPayload(parts.join('.')), null);
  assert.equal(await verifiedPayload(signed, 'mommenu-preview'), null);
  const expired=jwt.sign({ id:'owner' }, process.env.JWT_SECRET, { expiresIn:-1 });
  assert.equal(await verifiedPayload(expired), null);
  const preview=jwt.sign({ market:'INTL' }, process.env.JWT_SECRET, { audience:'mommenu-preview', subject:'owner', expiresIn:'1h' });
  assert.equal((await verifiedPayload(preview, 'mommenu-preview'))?.market,'INTL');
});
