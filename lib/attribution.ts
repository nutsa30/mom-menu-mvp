import 'server-only';
import { cookies, headers } from 'next/headers';
import { prisma } from './prisma';
import { SOURCES, cleanParam } from './traffic-source';
import { parseUserAgent } from './user-agent';

// The browser keeps a small first-party cookie ("mm_attr") ONLY after the visitor accepted
// cookies. It remembers where the visitor first came from and where they last came from, so
// registration and payment can be tied back to the ad that brought them - even across the
// Google sign-in redirect and the bank's payment page.
export const ATTR_COOKIE = 'mm_attr';

export type StoredTouch = {
  s?: string;   // source bucket
  m?: string;   // medium
  c?: string;   // campaign
  ct?: string;  // content (creative / ad set)
  t?: string;   // term
  u?: string;   // raw utm_source
  r?: string;   // referrer host
  l?: string;   // landing path
  at?: number;  // epoch ms
};
export type AttributionCookie = { v?: string; f?: StoredTouch; l?: StoredTouch };

export type AttributionSnapshot = {
  consented: boolean;
  visitorId?: string;
  first?: StoredTouch;
  last?: StoredTouch;
  country?: string; region?: string; city?: string;
  device?: string; browser?: string; os?: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cleanTouch(raw: any): StoredTouch | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const source = typeof raw.s === 'string' && (SOURCES as readonly string[]).includes(raw.s) ? raw.s : undefined;
  if (!source) return undefined;
  const landing = typeof raw.l === 'string' && raw.l.startsWith('/') && raw.l.length <= 200 ? raw.l.split(/[?#]/)[0] : undefined;
  const at = typeof raw.at === 'number' && Number.isFinite(raw.at) ? raw.at : undefined;
  return {
    s: source, m: cleanParam(raw.m, 50), c: cleanParam(raw.c), ct: cleanParam(raw.ct), t: cleanParam(raw.t),
    u: cleanParam(raw.u), r: cleanParam(raw.r, 100), l: landing, at,
  };
}

export function parseAttributionCookie(raw: string | undefined | null): AttributionCookie | null {
  if (!raw || raw.length > 2000) return null;
  try {
    const data = JSON.parse(decodeURIComponent(raw));
    return {
      v: typeof data.v === 'string' && UUID.test(data.v) ? data.v : undefined,
      f: cleanTouch(data.f), l: cleanTouch(data.l),
    };
  } catch { return null; }
}

export function geoFromHeaders(h: Pick<Headers, 'get'>) {
  const country = (h.get('x-vercel-ip-country') || '').toUpperCase();
  let city: string | undefined;
  try { city = decodeURIComponent(h.get('x-vercel-ip-city') || '').slice(0, 80) || undefined; } catch { city = undefined; }
  const region = (h.get('x-vercel-ip-country-region') || '').slice(0, 10) || undefined;
  return { country: /^[A-Z]{2}$/.test(country) && country !== 'XX' && country !== 'ZZ' ? country : undefined, region, city };
}

// Read-only snapshot of the current request: where the visitor is, what device, and (only if
// they accepted cookies) the campaign that brought them. Never throws.
export async function attributionSnapshot(): Promise<AttributionSnapshot> {
  try {
    const [jar, h] = await Promise.all([cookies(), headers()]);
    const parsed = parseAttributionCookie(jar.get(ATTR_COOKIE)?.value);
    const ua = parseUserAgent(h.get('user-agent'));
    return {
      consented: Boolean(parsed),
      visitorId: parsed?.v, first: parsed?.f, last: parsed?.l,
      ...geoFromHeaders(h),
      device: ua.bot ? undefined : ua.device, browser: ua.bot ? undefined : ua.browser, os: ua.bot ? undefined : ua.os,
    };
  } catch { return { consented: false }; }
}

// One row per account, written ONCE when the account is created. Failure here must never
// block signup, so it swallows errors.
export async function saveUserAttribution(userId: string, snap: AttributionSnapshot | null | undefined, signupMethod: 'email' | 'google') {
  if (!snap) return;
  try {
    const t = (x?: StoredTouch) => x ? ({ source: x.s, medium: x.m, campaign: x.c, content: x.ct, term: x.t, utmSource: x.u }) : null;
    const first = snap.consented ? t(snap.first) : null;
    const last = snap.consented ? t(snap.last) : null;
    await prisma.userAttribution.upsert({
      where: { userId },
      create: {
        userId, signupMethod, consented: snap.consented, visitorId: snap.consented ? snap.visitorId : undefined,
        firstSource: first?.source, firstMedium: first?.medium, firstCampaign: first?.campaign, firstContent: first?.content, firstTerm: first?.term, firstUtmSource: first?.utmSource,
        firstLandingPath: snap.consented ? snap.first?.l : undefined, firstReferrerHost: snap.consented ? snap.first?.r : undefined,
        firstSeenAt: snap.consented && snap.first?.at ? new Date(snap.first.at) : undefined,
        lastSource: last?.source, lastMedium: last?.medium, lastCampaign: last?.campaign, lastContent: last?.content, lastTerm: last?.term, lastUtmSource: last?.utmSource,
        country: snap.country, region: snap.region, city: snap.city, device: snap.device, browser: snap.browser, os: snap.os,
      },
      update: {},
    });
  } catch (error) {
    console.error('[attribution] save failed', error instanceof Error ? error.message : 'unknown');
  }
}
