import type { Locale } from './market';

/** Original records and canonical IDs are never changed by presentation. */
export function localizedField(record: any, field: string, locale: Locale): any {
  if (!record) return undefined;
  const value = record[`${field}${locale === 'en' ? 'En' : 'Ka'}`];
  if (locale === 'ka') return value;
  const valid = typeof value === 'string' ? value.trim() && !/[\u10A0-\u10FF]/.test(value)
    : Array.isArray(value) && value.every(v => typeof v === 'string' && !/[\u10A0-\u10FF]/.test(v));
  if (valid) return value;
  // Never leak Georgian when a newly published record is missing English.
  return field === 'ingredients' || field === 'benefits' ? [] : field === 'title' || field === 'name' ? 'Translation pending' : '';
}
