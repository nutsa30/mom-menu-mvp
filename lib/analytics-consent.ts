export const CONSENT_EVENT = 'mommenu:analytics-consent';
export const COOKIE_SETTINGS_EVENT = 'mommenu:cookie-settings';

export function analyticsAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem('cookie_consent') === 'accepted'; } catch { return false; }
}

export function campaignFromUrl(url: URL): Record<string, string> {
  return Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign'].flatMap(key => {
    const value = url.searchParams.get(key);
    return value && /^[a-z0-9_-]{1,100}$/i.test(value) ? [[key, value]] : [];
  }));
}

// Never send email addresses, verification codes, child IDs or private query data.
export function analyticsLocation(href: string): string {
  const url = new URL(href);
  const params = new URLSearchParams(campaignFromUrl(url));
  const lang = url.searchParams.get('lang');
  if (lang === 'ka' || lang === 'en') params.set('lang', lang);
  return `${url.origin}${url.pathname}${params.size ? '?' + params : ''}`;
}

export function campaignAttribution(): Record<string, string> {
  if (!analyticsAllowed()) return {};
  try {
    const current = campaignFromUrl(new URL(window.location.href));
    if (current.utm_source) localStorage.setItem('mommenu_campaign', JSON.stringify({ ...current, recordedAt: Date.now() }));
    const stored = JSON.parse(localStorage.getItem('mommenu_campaign') || '{}');
    if (!stored.recordedAt || Date.now() - stored.recordedAt > 30 * 86400000) return {};
    return campaignFromUrl(new URL('https://attribution.invalid/?' + new URLSearchParams(stored)));
  } catch { return {}; }
}
