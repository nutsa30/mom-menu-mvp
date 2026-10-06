export type Market = 'GE' | 'INTL';
export type Currency = 'GEL' | 'USD';
export type Locale = 'ka' | 'en';
export type Units = 'metric' | 'us' | 'uk';
export type Interval = 1 | 3 | 6;
export const INTERNATIONAL_PRICES: Record<Interval, number> = { 1: 15, 3: 34, 6: 52 };

export function normalizeMarket(value: unknown): Market { return value === 'INTL' ? 'INTL' : 'GE'; }
export function currencyFor(market: Market): Currency { return market === 'INTL' ? 'USD' : 'GEL'; }
export function localeFor(market: Market): Locale { return market === 'INTL' ? 'en' : 'ka'; }
export function marketForCountry(country: string | null): Market {
  // Unknown IP information retains the existing Georgian experience.
  return country && /^[A-Z]{2}$/.test(country) && country !== 'GE' && country !== 'XX' && country !== 'ZZ' ? 'INTL' : 'GE';
}
export function planPrice(market: Market, interval: Interval): number {
  if (market === 'INTL') return INTERNATIONAL_PRICES[interval];
  const value = process.env[`BOG_PLAN_${interval}M_AMOUNT_GEL`];
  const amount = Number(value);
  if (!value || !Number.isFinite(amount) || amount <= 0) throw new Error('Georgian plan price is not configured');
  return amount;
}
export function money(amount: number, currency: Currency, locale: Locale = 'en'): string {
  return new Intl.NumberFormat(locale === 'ka' ? 'ka-GE' : 'en-US', { style: 'currency', currency }).format(amount);
}
export function validTimeZone(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 100) return false;
  try { new Intl.DateTimeFormat('en', { timeZone: value }).format(); return true; } catch { return false; }
}
export function localDay(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export function referralReward(market: Market): number { return market === 'INTL' ? 1.5 : 1.7; }
