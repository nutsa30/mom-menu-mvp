import assert from 'node:assert/strict';
import test from 'node:test';
import { analyticsLocation, campaignAttribution } from '../lib/analytics-consent';
import { flushAnalyticsEvents, trackEvent } from '../lib/gtag';

test('analytics waits for consent, preserves campaign attribution and never duplicates queued events', () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const storage = new Map<string, string>();
  const events: any[][] = [];
  const fakeWindow: any = { location: { href: 'https://www.mommenu.ge/?lang=en&utm_source=justparents&utm_medium=banner&utm_campaign=uk_launch&email=private@example.com' }, gtag: (...args: any[]) => events.push(args) };
  Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true });
  Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (key: string) => storage.get(key) || null, setItem: (key: string, value: string) => storage.set(key, value) }, configurable: true });
  try {
    trackEvent('sign_up'); assert.equal(events.length, 0); assert.equal(storage.size, 0);
    storage.set('cookie_consent', 'accepted');
    trackEvent('sign_up'); assert.equal(events.length, 0);
    fakeWindow.mommenuAnalyticsReady = true; flushAnalyticsEvents(); flushAnalyticsEvents();
    assert.equal(events.length, 1); assert.equal(events[0][1], 'sign_up');
    assert.equal(events[0][2].utm_source, 'justparents'); assert(!events[0][2].page_location.includes('private'));
    fakeWindow.location.href = 'https://www.mommenu.ge/dashboard?sub=success';
    trackEvent('purchase', { transaction_id: 'bank-order', value: 15, currency: 'USD' });
    assert.equal(events[1][2].utm_campaign, 'uk_launch'); assert.equal(events[1][2].currency, 'USD');
    storage.set('cookie_consent', 'declined'); trackEvent('purchase'); assert.equal(events.length, 2);
    assert.deepEqual(campaignAttribution(), {});
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow); else Reflect.deleteProperty(globalThis, 'window');
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage); else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('analytics URLs exclude verification and payment tokens and invalid campaign values', () => {
  assert.equal(analyticsLocation('https://www.mommenu.ge/verify-email?email=secret@example.com&code=123456&lang=en&utm_source=justparents'), 'https://www.mommenu.ge/verify-email?utm_source=justparents&lang=en');
  assert.equal(analyticsLocation('https://www.mommenu.ge/dashboard?token=private&utm_campaign=private%40example.com'), 'https://www.mommenu.ge/dashboard');
});
