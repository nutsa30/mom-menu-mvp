'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { analyticsAllowed, CONSENT_EVENT } from '@/lib/analytics-consent';
import { classifyTouch, trackablePath, hostOf, type TrafficTouch } from '@/lib/traffic-source';

// Counts page views in our own database (see /api/analytics/collect).
//  - Visitor declined cookies (or has not answered): ONE anonymous hit per page. No ID, no
//    cookie and no browser storage are used on the visitor's device.
//  - Visitor accepted cookies: a random visitor ID and the campaign that brought them are kept
//    in the first-party cookie "mm_attr" (90 days) so registration and payment can be tied
//    back to the ad. It contains no name, e-mail or payment data.

const COOKIE = 'mm_attr';
const MAX_AGE = 60 * 60 * 24 * 90;
const CLICK_IDS = ['fbclid', 'gclid', 'gbraid', 'wbraid', 'ttclid', 'epik', 'msclkid'] as const;

type Stored = { s?: string; m?: string; c?: string; ct?: string; t?: string; u?: string; r?: string; l?: string; at?: number };
type Cookie = { v?: string; f?: Stored; l?: Stored };

let pageLoadHandled = false;                 // true after the first view of this full page load
let landingTouch: (TrafficTouch & { path: string }) | null = null;   // what brought this visit

function readCookie(): Cookie {
  try {
    const raw = document.cookie.split('; ').find(c => c.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
    return raw ? JSON.parse(decodeURIComponent(raw)) : {};
  } catch { return {}; }
}
function writeCookie(data: Cookie) {
  try {
    document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(data))}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  } catch { /* Cookies blocked. */ }
}
function clearCookie() {
  try { for (const d of ['', location.hostname, '.mommenu.ge']) document.cookie = `${COOKIE}=; Max-Age=0; Path=/${d ? '; Domain=' + d : ''}`; } catch { /* ignore */ }
}
function uuid() {
  try { return crypto.randomUUID(); } catch {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3) | 8).toString(16); });
  }
}
const toStored = (t: TrafficTouch & { path: string }): Stored => ({
  s: t.source, m: t.medium, c: t.campaign, ct: t.content, t: t.term, u: t.utmSource, r: t.referrerHost, l: t.path, at: Date.now(),
});

// Remember this visit's source in the cookie (only ever called with cookie consent).
function persistTouch(): { vid: string; isNew: boolean } {
  const cookie = readCookie();
  const isNew = !cookie.v;
  const next: Cookie = { v: cookie.v || uuid(), f: cookie.f, l: cookie.l };
  if (landingTouch) {
    const stored = toStored(landingTouch);
    if (!next.f) next.f = stored;                          // first touch is set once
    if (landingTouch.source !== 'direct') next.l = stored; // last touch = most recent non-direct source
  }
  writeCookie(next);
  return { vid: next.v!, isNew };
}

function send(body: Record<string, unknown>) {
  const json = JSON.stringify(body);
  try {
    if (navigator.sendBeacon?.('/api/analytics/collect', new Blob([json], { type: 'text/plain' }))) return;
  } catch { /* fall through */ }
  fetch('/api/analytics/collect', { method: 'POST', body: json, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
}

export default function FirstPartyTracker() {
  const pathname = usePathname();
  const lastPath = useRef('');

  useEffect(() => {
    // The first view of a full page load decides whether this is a new arrival - even when that
    // first page is private (e.g. /dashboard) and not counted, later soft navigations are not arrivals.
    const firstView = !pageLoadHandled;
    pageLoadHandled = true;
    const path = trackablePath(pathname);
    if (!path || lastPath.current === path) return;
    lastPath.current = path;

    const consent = analyticsAllowed();
    const params = new URL(location.href).searchParams;
    let landing = false;
    let touchInput: Record<string, string> | undefined;
    let referrer: string | undefined;

    if (firstView) {
      const refHost = hostOf(document.referrer);
      const internal = Boolean(refHost && (refHost === location.hostname.replace(/^www\./, '') || refHost.endsWith('.mommenu.ge')));
      const navType = (performance.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined)?.type;
      // A reload, back/forward or an in-site link is the same visit continuing, not a new arrival.
      if (!internal && navType !== 'reload' && navType !== 'back_forward') {
        landing = true;
        touchInput = {};
        for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) { const v = params.get(k); if (v) touchInput[k] = v.slice(0, 100); }
        for (const k of CLICK_IDS) if (params.get(k)) touchInput[k] = '1';
        try { referrer = document.referrer ? new URL(document.referrer).origin : undefined; } catch { referrer = undefined; }
        landingTouch = { ...classifyTouch({ ...touchInput, referrer, ownHost: location.hostname }), path };
      }
    }

    let vid: string | undefined; let isNew = false;
    if (consent) ({ vid, isNew } = persistTouch()); else if (readCookie().v) clearCookie();

    send({ path, landing, consent, vid, isNew, touch: touchInput, referrer });
  }, [pathname]);

  // The visitor answers the cookie banner after the first page was already counted:
  // keep the source of this visit so it is not lost, or wipe the cookie on decline.
  useEffect(() => {
    const onConsent = () => { if (analyticsAllowed()) persistTouch(); else clearCookie(); };
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  return null;
}
