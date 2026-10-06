import english from './ui-en.json';
import type { Locale } from './market';
const translations: Record<string, string> = Object.fromEntries(Object.entries(english).map(([key, value]) => [key.replace(/\s+/g, ' ').trim(), value]));
const fragments = Object.keys(translations).sort((a, b) => b.length - a.length);

export function translateCopy(text: string, locale: Locale): string {
  if (locale === 'ka' || !/[\u10A0-\u10FF]/.test(text)) return text;
  const trimmed = text.trim();
  if (translations[trimmed] !== undefined) return text.replace(trimmed, translations[trimmed]);
  // Authored templates can combine numbers with static fragments. Longest first,
  // one pass over the original string, so translations never translate each other.
  let result = '';
  for (let i = 0; i < text.length;) {
    const key = fragments.find(key => text.startsWith(key, i)
      && !(i > 0 && /[\u10A0-\u10FF]/.test(text[i - 1]) && /[\u10A0-\u10FF]/.test(key[0]))
      && !(/[\u10A0-\u10FF]/.test(key[key.length - 1]) && /[\u10A0-\u10FF]/.test(text[i + key.length] || '')));
    if (key) { result += translations[key]; i += key.length; }
    else { result += text[i]; i++; }
  }
  return result;
}
