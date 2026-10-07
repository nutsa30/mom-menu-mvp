import 'server-only';
import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getSession } from './auth';
import { prisma } from './prisma';
import { currencyFor, localeFor, marketForCountry, normalizeMarket, validTimeZone, type Market, type Locale, type Units } from './market';

export const PREVIEW_COOKIE = 'mommenu_admin_preview';
export async function getExperience() {
  const session = await getSession();
  const account = session ? await prisma.user.findUnique({ where: { id: session.id }, select: { id: true, role: true, market: true, locale: true, timeZone: true, units: true } }) : null;
  const country = process.env.NODE_ENV !== 'production' && process.env.DEV_COUNTRY ? process.env.DEV_COUNTRY : (await headers()).get('x-vercel-ip-country');
  let market = account ? normalizeMarket(account.market) : marketForCountry(country);
  let preview: Market | null = null;
  const token = (await cookies()).get(PREVIEW_COOKIE)?.value;
  // A preview is bound to the authenticated administrator and independently signed.
  if (token && account?.role === 'ADMIN' && process.env.JWT_SECRET) {
    try {
      const value = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], audience: 'mommenu-preview' }) as jwt.JwtPayload;
      if (value.sub === account.id && (value.market === 'GE' || value.market === 'INTL')) preview = value.market;
    } catch { /* Invalid/expired preview never changes the real market. */ }
  }
  if (preview) market = preview;
  const chosenLanguage = (await headers()).get('x-mommenu-locale') || (await cookies()).get('mommenu_locale')?.value;
  const locale: Locale = preview ? localeFor(preview) : chosenLanguage === 'en' || chosenLanguage === 'ka' ? chosenLanguage : account?.locale === 'en' ? 'en' : account ? 'ka' : localeFor(market);
  const unitPreference = account?.units || (await cookies()).get('mommenu_units')?.value;
  const units: Units = market === 'INTL' && (unitPreference === 'us' || unitPreference === 'uk') ? unitPreference : 'metric';
  const zonePreference = account?.timeZone || (await cookies()).get('mommenu_timezone')?.value;
  const timeZone = validTimeZone(zonePreference) ? zonePreference! : market === 'GE' ? 'Asia/Tbilisi' : 'UTC';
  return { market, currency: currencyFor(market), locale, units, timeZone, country, preview, isAdmin: account?.role === 'ADMIN' };
}

// Commercial decisions always use the persisted account, never admin preview or UI locale.
export function accountMarket(account: { market: string }): Market { return normalizeMarket(account.market); }
