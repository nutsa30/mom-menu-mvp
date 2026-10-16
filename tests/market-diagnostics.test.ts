import test from 'node:test';
import assert from 'node:assert/strict';
import { marketDiagnostics } from '../lib/market-diagnostics';

test('proxy disagreement is visible without trusting Cloudflare to change the selected market', () => {
  const result = marketDiagnostics(new Headers({ 'x-vercel-ip-country': 'US', 'cf-ipcountry': 'GE', 'cf-ray': 'review' }));
  assert.equal(result.countriesDisagree, true);
  assert.equal(result.vercelCountry, 'US');
  assert.equal(result.cloudflareCountry, 'GE');
  assert.equal(result.geoMarket, 'INTL');
});

test('matching Georgian countries and missing Vercel information preserve current routing', () => {
  assert.equal(marketDiagnostics(new Headers({ 'x-vercel-ip-country': 'GE', 'cf-ipcountry': 'GE' })).geoMarket, 'GE');
  const missing = marketDiagnostics(new Headers({ 'cf-ipcountry': 'US' }));
  assert.equal(missing.geoMarket, 'GE');
  assert.equal(missing.countriesDisagree, false);
});

test('diagnostics exclude personal data and arbitrary header content', () => {
  const result = marketDiagnostics(new Headers({
    'x-vercel-ip-country': 'invalid-value', 'cf-ipcountry': 'XX',
    'cf-connecting-ip': '192.0.2.1', authorization: 'secret', cookie: 'private=value',
  }));
  assert.equal(result.vercelCountry, null);
  assert.equal(result.cloudflareCountry, null);
  assert.doesNotMatch(JSON.stringify(result), /192\.0\.2\.1|secret|private|invalid-value/);
  assert.deepEqual(Object.keys(result).sort(), ['cloudflareCountry', 'cloudflarePresent', 'countriesDisagree', 'geoMarket', 'vercelCountry'].sort());
});
