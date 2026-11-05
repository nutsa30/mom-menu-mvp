import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyTouch, trackablePath, pageKind, cleanParam } from '../lib/traffic-source';
import { parseUserAgent } from '../lib/user-agent';

const own = 'mommenu.ge';

test('UTM source is mapped to a fixed bucket and keeps campaign details', () => {
  const t = classifyTouch({ utm_source: 'ig', utm_medium: 'Paid_Social', utm_campaign: 'oct_launch', utm_content: 'reel_a', utm_term: 'x', ownHost: own });
  assert.equal(t.source, 'instagram'); assert.equal(t.medium, 'paid_social'); assert.equal(t.campaign, 'oct_launch'); assert.equal(t.content, 'reel_a');
  assert.equal(classifyTouch({ utm_source: 'FB' }).source, 'facebook');
  assert.equal(classifyTouch({ utm_source: 'pinterest' }).source, 'pinterest');
  assert.equal(classifyTouch({ utm_source: 'tiktok' }).source, 'tiktok');
  assert.equal(classifyTouch({ utm_source: 'google' }).source, 'google');
  assert.equal(classifyTouch({ utm_source: 'justparents' }).source, 'other');
  assert.equal(classifyTouch({ utm_source: 'justparents' }).utmSource, 'justparents');
});

test('click ids identify the ad platform when there is no UTM', () => {
  assert.equal(classifyTouch({ gclid: '1' }).source, 'google');
  assert.equal(classifyTouch({ gclid: '1' }).medium, 'cpc');
  assert.equal(classifyTouch({ ttclid: '1' }).source, 'tiktok');
  assert.equal(classifyTouch({ epik: '1' }).source, 'pinterest');
  assert.equal(classifyTouch({ fbclid: '1' }).source, 'facebook');
  assert.equal(classifyTouch({ fbclid: '1', referrer: 'https://l.instagram.com/' }).source, 'instagram');
});

test('referrer decides the source when there is no campaign', () => {
  assert.equal(classifyTouch({ referrer: 'https://www.google.com/', ownHost: own }).source, 'google');
  assert.equal(classifyTouch({ referrer: 'https://www.google.ge/search?q=x', ownHost: own }).medium, 'organic');
  assert.equal(classifyTouch({ referrer: 'https://l.instagram.com/?u=x', ownHost: own }).source, 'instagram');
  assert.equal(classifyTouch({ referrer: 'https://m.facebook.com/', ownHost: own }).source, 'facebook');
  assert.equal(classifyTouch({ referrer: 'https://www.pinterest.com/pin/1', ownHost: own }).source, 'pinterest');
  assert.equal(classifyTouch({ referrer: 'https://www.tiktok.com/', ownHost: own }).source, 'tiktok');
  assert.equal(classifyTouch({ referrer: 'https://www.bing.com/', ownHost: own }).source, 'other');
  assert.equal(classifyTouch({ referrer: 'https://some-blog.example/post', ownHost: own }).source, 'referral');
});

test('no referrer, or our own site, is direct', () => {
  assert.equal(classifyTouch({ ownHost: own }).source, 'direct');
  assert.equal(classifyTouch({ referrer: 'https://mommenu.ge/blog', ownHost: own }).source, 'direct');
  assert.equal(classifyTouch({ referrer: 'https://www.mommenu.ge/', ownHost: own }).source, 'direct');
});

test('hostile or oversized parameters are dropped', () => {
  assert.equal(cleanParam('<script>alert(1)</script>'), undefined);
  assert.equal(cleanParam('a'.repeat(300))?.length, 100);
  assert.equal(cleanParam('summer sale-2026'), 'summer sale-2026');
  assert.equal(cleanParam('კამპანია_1'), 'კამპანია_1');
});

test('private and account paths are never tracked; query strings are stripped', () => {
  assert.equal(trackablePath('/dashboard'), null);
  assert.equal(trackablePath('/admin/analytics'), null);
  assert.equal(trackablePath('/api/x'), null);
  assert.equal(trackablePath('/reset-password/abc123'), null);
  assert.equal(trackablePath('/verify-email?email=a@b.c'), null);
  assert.equal(trackablePath('/subscription?lang=ka&email=a@b.c'), '/subscription');
  assert.equal(trackablePath('/'), '/');
  assert.equal(trackablePath('//evil.com'), null);
  assert.equal(pageKind('/'), 'home');
  assert.equal(pageKind('/meals/abc'), 'menu');
  assert.equal(pageKind('/subscription'), 'pricing');
  assert.equal(pageKind('/register'), 'register');
});

test('user-agent: bots excluded, in-app browsers recognised', () => {
  assert.equal(parseUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)').bot, true);
  assert.equal(parseUserAgent('').bot, true);
  const ig = parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 300.0');
  assert.equal(ig.bot, false); assert.equal(ig.browser, 'Instagram app'); assert.equal(ig.os, 'iOS'); assert.equal(ig.device, 'mobile');
  const win = parseUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36 Edg/120.0');
  assert.equal(win.browser, 'Edge'); assert.equal(win.device, 'desktop');
  assert.equal(parseUserAgent('Mozilla/5.0 (Linux; Android 13; SM-T500) AppleWebKit/537.36 Chrome/120 Safari/537.36').device, 'tablet');
});
