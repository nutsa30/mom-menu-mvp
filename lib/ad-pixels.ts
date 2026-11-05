// Advertising pixels (Meta = Instagram + Facebook, TikTok, Pinterest).
//
// Rules this file enforces:
//  - Nothing loads or fires without cookie consent, and a pixel only exists when its ID is set.
//  - Only value / currency / order id / plan id are ever sent. No name, e-mail, child data,
//    card data or account id. Advanced-matching (e-mail hashing) is NOT used.
//  - "purchase" is only passed here by PurchaseConversion, i.e. after the bank's callback has
//    been confirmed on our server and once per order (see components/PurchaseConversion.tsx).
import { analyticsAllowed } from './analytics-consent';

export type PixelIds = { meta?: string; tiktok?: string; pinterest?: string };

export const validMetaId = (v?: string | null) => (v && /^\d{6,20}$/.test(v.trim()) ? v.trim() : undefined);
export const validPinterestId = (v?: string | null) => (v && /^\d{6,20}$/.test(v.trim()) ? v.trim() : undefined);
export const validTiktokId = (v?: string | null) => (v && /^[A-Za-z0-9]{8,32}$/.test(v.trim()) ? v.trim() : undefined);

type W = Window & { fbq?: any; _fbq?: any; ttq?: any; TiktokAnalyticsObject?: string; pintrk?: any };
const w = () => window as unknown as W;

let ids: PixelIds = {};
let active = false;                                // pixels loaded and allowed to send
const queue: Array<{ name: string; params: Record<string, any> }> = [];

function script(src: string) {
  const s = document.createElement('script'); s.async = true; s.src = src;
  document.head.appendChild(s);
}

function loadMeta(id: string) {
  const win = w();
  if (win.fbq) return;
  const f: any = function (...args: any[]) { f.callMethod ? f.callMethod.apply(f, args) : f.queue.push(args); };
  win.fbq = f; if (!win._fbq) win._fbq = f;
  f.push = f; f.loaded = true; f.version = '2.0'; f.queue = [];
  f.disablePushState = true;                       // we send page views ourselves, only for public pages
  script('https://connect.facebook.net/en_US/fbevents.js');
  f('set', 'autoConfig', false, id);               // no automatic button / form-field capture
  f('init', id);
}

function loadTiktok(id: string) {
  const win = w();
  if (win.ttq) return;
  const t = 'ttq';
  win.TiktokAnalyticsObject = t;
  const q: any = (win.ttq = win.ttq || []);
  q.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
  q.setAndDefer = (o: any, m: string) => { o[m] = (...a: any[]) => o.push([m, ...a]); };
  for (const m of q.methods) q.setAndDefer(q, m);
  q.instance = (name: string) => { const inst = q._i[name] || []; for (const m of q.methods) q.setAndDefer(inst, m); return inst; };
  q.load = (sdk: string, opts?: any) => {
    const base = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    q._i = q._i || {}; q._i[sdk] = []; q._i[sdk]._u = base;
    q._t = q._t || {}; q._t[sdk] = +new Date(); q._o = q._o || {}; q._o[sdk] = opts || {};
    script(`${base}?sdkid=${encodeURIComponent(sdk)}&lib=${t}`);
  };
  q.load(id);
}

function loadPinterest(id: string) {
  const win = w();
  if (win.pintrk) return;
  const p: any = function (...a: any[]) { p.queue.push(a); };
  p.queue = []; p.version = '3.0'; win.pintrk = p;
  script('https://s.pinimg.com/ct/core.js');
  p('load', id);
}

// Called by <AdPixels/> once the visitor has accepted cookies.
export function enablePixels(next: PixelIds) {
  if (typeof window === 'undefined' || !analyticsAllowed()) return;
  ids = next;
  if (ids.meta) loadMeta(ids.meta);
  if (ids.tiktok) loadTiktok(ids.tiktok);
  if (ids.pinterest) loadPinterest(ids.pinterest);
  active = Boolean(ids.meta || ids.tiktok || ids.pinterest);
  if (active) for (const e of queue.splice(0)) send(e.name, e.params);
}

// Called when the visitor withdraws consent: stop sending and tell the platforms where possible.
export function disablePixels() {
  active = false; queue.length = 0;
  try { w().fbq?.('consent', 'revoke'); } catch { /* ignore */ }
  try { w().ttq?.revokeConsent?.(); } catch { /* ignore */ }
}

export function pixelPageView() {
  if (!active || !analyticsAllowed()) return;
  try { if (ids.meta) w().fbq?.('track', 'PageView'); } catch { /* ignore */ }
  try { if (ids.tiktok) w().ttq?.page(); } catch { /* ignore */ }
  try { if (ids.pinterest) w().pintrk?.('page'); } catch { /* ignore */ }
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const cur = (v: unknown) => (typeof v === 'string' && /^[A-Z]{3}$/.test(v) ? v : undefined);
const txt = (v: unknown, max = 100) => (typeof v === 'string' ? v.slice(0, max) : undefined);

function send(name: string, p: Record<string, any>) {
  const value = num(p.value), currency = cur(p.currency);
  const orderId = txt(p.transaction_id, 200);
  const planId = txt(p.items?.[0]?.item_id) || txt(p.item_name);
  try {
    if (ids.meta) {
      const f = w().fbq;
      if (name === 'view_pricing') f?.('track', 'ViewContent', { content_name: 'pricing', content_category: 'subscription' });
      else if (name === 'sign_up') f?.('track', 'CompleteRegistration', { status: true });
      else if (name === 'begin_checkout') f?.('track', 'InitiateCheckout', { value, currency });
      else if (name === 'purchase') f?.('track', 'Purchase', { value, currency, content_type: 'product', content_ids: planId ? [planId] : undefined }, orderId ? { eventID: orderId } : undefined);
    }
    if (ids.tiktok) {
      const t = w().ttq;
      if (name === 'view_pricing') t?.track('ViewContent', { content_name: 'pricing', content_type: 'product' });
      else if (name === 'sign_up') t?.track('CompleteRegistration');
      else if (name === 'begin_checkout') t?.track('InitiateCheckout', { value, currency, content_type: 'product' });
      else if (name === 'purchase') t?.track('CompletePayment', { value, currency, content_type: 'product', content_id: planId }, orderId ? { event_id: orderId } : undefined);
    }
    if (ids.pinterest) {
      const p2 = w().pintrk;
      if (name === 'sign_up') p2?.('track', 'signup');
      else if (name === 'purchase') p2?.('track', 'checkout', { value, order_quantity: 1, currency, order_id: orderId, line_items: [{ product_id: planId, product_name: txt(p.items?.[0]?.item_name), product_price: value, product_quantity: 1 }] });
    }
  } catch { /* A pixel failure must never affect the site. */ }
}

// Single entry point used by lib/gtag.ts for every conversion event.
export function pixelEvent(name: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined' || !analyticsAllowed()) return;
  if (!['view_pricing', 'sign_up', 'begin_checkout', 'purchase'].includes(name)) return;
  if (!active) { queue.push({ name, params }); if (queue.length > 20) queue.shift(); return; }
  send(name, params);
}
