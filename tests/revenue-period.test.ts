import test from 'node:test';
import assert from 'node:assert/strict';
import { revenuePeriod, grossRevenueForPeriod, revenueYears } from '../lib/revenue-period';

test('revenue months use Tbilisi boundaries, including leap years and December rollover', () => {
  const now = new Date('2026-10-10T12:00:00Z');
  const feb = revenuePeriod('2024', '2', now);
  assert.equal(feb.start.toISOString(), '2024-01-31T20:00:00.000Z');
  assert.equal(feb.end.toISOString(), '2024-02-29T20:00:00.000Z');
  const dec = revenuePeriod('2025', '12', now);
  assert.equal(dec.end.toISOString(), '2025-12-31T20:00:00.000Z');
});

test('gross revenue includes only the selected year and month, before fees', () => {
  const period = revenuePeriod('2025', '10', new Date('2026-10-10T00:00:00Z'));
  const payments = [
    { createdAt: new Date('2025-09-30T19:59:59Z'), grossAmount: 100 },
    { createdAt: period.start, grossAmount: 17 },
    { createdAt: new Date('2025-10-31T19:59:59Z'), grossAmount: 39.99 },
    { createdAt: period.end, grossAmount: 200 },
    { createdAt: new Date('2026-10-15T00:00:00Z'), grossAmount: 300 },
  ];
  assert.equal(grossRevenueForPeriod(payments, period), 56.99);
  assert.equal(grossRevenueForPeriod([], period), 0);
});

test('default period and available years follow Georgia time at New Year', () => {
  const period = revenuePeriod(undefined, undefined, new Date('2026-12-31T20:00:00Z'));
  assert.equal(period.year, 2027);
  assert.equal(period.month, 1);
  assert.deepEqual(revenueYears([
    { createdAt: new Date('2025-12-31T20:00:00Z') },
    { createdAt: new Date('2024-05-01T00:00:00Z') },
  ], 2027), [2027, 2026, 2024]);
  const invalid = revenuePeriod('999999', '-2', new Date('2026-10-10T00:00:00Z'));
  assert.equal(invalid.year, 2026);
  assert.equal(invalid.month, 10);
});
