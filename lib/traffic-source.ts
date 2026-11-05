// Pure helpers shared by the browser tracker and the server (no imports, no I/O).
// They turn UTM parameters, ad click IDs and the referrer into ONE of the fixed source
// buckets the admin dashboard reports on. Nothing here ever stores or sends anything.

export const SOURCES = ['instagram', 'facebook', 'pinterest', 'tiktok', 'google', 'direct', 'referral', 'other'] as const;
export type TrafficSource = (typeof SOURCES)[number];

export type TrafficTouch = {
  source: TrafficSource;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  utmSource?: string;     // exactly what the link said (e.g. "justparents"), cleaned
  referrerHost?: string;
};

export type TouchInput = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  fbclid?: string | null;
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  ttclid?: string | null;
  epik?: string | null;
  msclkid?: string | null;
  referrer?: string | null;   // full document.referrer / Referer
  ownHost?: string | null;
};

// Letters (Georgian included), digits, space and a few safe separators only.
export function cleanParam(value: unknown, max = 100): string | undefined {
  if (typeof value !== 'string') return undefined;
  const v = value.trim().slice(0, max);
  return v && /^[\p{L}\p{N} _.+:|/-]+$/u.test(v) ? v : undefined;
}

export function hostOf(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./, '') || undefined; } catch { return undefined; }
}

const HOST_RULES: Array<[TrafficSource, RegExp]> = [
  ['instagram', /(^|\.)instagram\.com$/],
  ['facebook', /(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/],
  ['pinterest', /(^|\.)(pinterest\.[a-z.]+|pin\.it)$/],
  ['tiktok', /(^|\.)tiktok\.com$/],
  ['google', /(^|\.)google\.[a-z.]+$/],
];
const OTHER_SEARCH = /(^|\.)(bing\.com|yahoo\.com|duckduckgo\.com|yandex\.[a-z.]+|ecosia\.org|search\.brave\.com)$/;

function sourceFromHost(host: string): TrafficSource | undefined {
  for (const [source, re] of HOST_RULES) if (re.test(host)) return source;
  return undefined;
}

const ALIASES: Record<string, TrafficSource> = {
  ig: 'instagram', insta: 'instagram', instagram: 'instagram',
  fb: 'facebook', facebook: 'facebook', meta: 'facebook', messenger: 'facebook',
  pinterest: 'pinterest', pin: 'pinterest',
  tiktok: 'tiktok', tt: 'tiktok',
  google: 'google', adwords: 'google', googleads: 'google', gads: 'google',
};

function sourceFromUtm(raw: string): TrafficSource {
  const key = raw.toLowerCase();
  if (ALIASES[key]) return ALIASES[key];
  return sourceFromHost(key.replace(/^www\./, '')) ?? 'other';
}

export function classifyTouch(input: TouchInput): TrafficTouch {
  const utmSource = cleanParam(input.utm_source);
  const medium = cleanParam(input.utm_medium, 50)?.toLowerCase();
  const campaign = cleanParam(input.utm_campaign);
  const content = cleanParam(input.utm_content);
  const term = cleanParam(input.utm_term);
  const own = (input.ownHost || '').toLowerCase().replace(/^www\./, '');
  let refHost = hostOf(input.referrer);
  if (refHost && own && (refHost === own || refHost.endsWith('.' + own))) refHost = undefined; // internal navigation
  const base = { campaign, content, term, utmSource, referrerHost: refHost };

  if (utmSource) return { ...base, source: sourceFromUtm(utmSource), medium };

  const has = (v: string | null | undefined) => Boolean(v && v.length <= 600);
  if (has(input.gclid) || has(input.gbraid) || has(input.wbraid)) return { ...base, source: 'google', medium: medium || 'cpc' };
  if (has(input.fbclid)) {
    const fromIg = refHost ? sourceFromHost(refHost) === 'instagram' : false;
    return { ...base, source: fromIg ? 'instagram' : 'facebook', medium: medium || 'social' };
  }
  if (has(input.ttclid)) return { ...base, source: 'tiktok', medium: medium || 'social' };
  if (has(input.epik)) return { ...base, source: 'pinterest', medium: medium || 'social' };
  if (has(input.msclkid)) return { ...base, source: 'other', medium: medium || 'cpc' };

  if (refHost) {
    const known = sourceFromHost(refHost);
    if (known === 'google') return { ...base, source: 'google', medium: 'organic' };
    if (known) return { ...base, source: known, medium: 'social' };
    if (OTHER_SEARCH.test(refHost)) return { ...base, source: 'other', medium: 'organic' };
    return { ...base, source: 'referral', medium: 'referral' };
  }
  return { ...base, source: 'direct', medium: 'none' };
}

export type PageKind = 'home' | 'menu' | 'pricing' | 'register' | 'login' | 'blog' | 'info' | 'other';

// Only public marketing pages are ever tracked; account, admin, token and API paths return null.
const NEVER_TRACK = /^\/(admin|api|dashboard|reset-password|verify-email|change-password|forgot-password|_next)(\/|$)/;

export function trackablePath(rawPath: unknown): string | null {
  if (typeof rawPath !== 'string') return null;
  const path = rawPath.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  if (!path.startsWith('/') || path.includes('//') || path.length > 200 || !/^\/[\p{L}\p{N}_\-./%]*$/u.test(path)) return null;
  return NEVER_TRACK.test(path) ? null : path;
}

export function pageKind(path: string): PageKind {
  if (path === '/') return 'home';
  if (/^\/(meals|recipes)(\/|$)/.test(path)) return 'menu';
  if (/^\/subscription(\/|$)/.test(path)) return 'pricing';
  if (/^\/(register|signup)(\/|$)/.test(path)) return 'register';
  if (/^\/login(\/|$)/.test(path)) return 'login';
  if (/^\/blog(\/|$)/.test(path)) return 'blog';
  if (/^\/(how-it-works|about|contact|privacy|terms|refunds)(\/|$)/.test(path)) return 'info';
  return 'other';
}
