import type { Units } from './market';
const OZ_GRAMS = 28.349523125;
const US_FL_OZ_ML = 29.5735295625;
const UK_FL_OZ_ML = 28.4130625;
export function convertedQuantity(value: number, unit: 'g' | 'kg' | 'ml' | 'l', units: Units) {
  if (units === 'metric') return { value, unit };
  if (unit === 'g' || unit === 'kg') return { value: value * (unit === 'kg' ? 1000 : 1) / OZ_GRAMS, unit: 'oz' };
  return { value: value * (unit === 'l' ? 1000 : 1) / (units === 'us' ? US_FL_OZ_ML : UK_FL_OZ_ML), unit: units === 'us' ? 'US fl oz' : 'UK fl oz' };
}
// Converts explicit mass/volume only; never assumes an ingredient density or invents cups.
export function ingredientQuantity(text: string, units: Units): string {
  if (units === 'metric') return text;
  const number = '(?:\\d+\\s+\\d+/\\d+|\\d+/\\d+|\\d+(?:[.,]\\d+)?|[½¼¾⅓⅔])';
  const pattern = new RegExp(`(${number})(?:\\s*[-–]\\s*(${number}))?\\s*(kg|ml|g|l|კგ|მლ|გ|ლ)(?![\\p{L}])`, 'giu');
  const numeric = (value: string) => {
    const fractions: Record<string, number> = { '½': .5, '¼': .25, '¾': .75, '⅓': 1/3, '⅔': 2/3 };
    if (fractions[value] !== undefined) return fractions[value];
    const fraction = value.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
    return fraction ? Number(fraction[1] || 0) + Number(fraction[2]) / Number(fraction[3]) : Number(value.replace(',', '.'));
  };
  return text.replace(pattern, (original, first: string, last: string | undefined, rawUnit: string) => {
    const aliases: Record<string, 'g' | 'kg' | 'ml' | 'l'> = { 'კგ': 'kg', 'მლ': 'ml', 'გ': 'g', 'ლ': 'l', g: 'g', kg: 'kg', ml: 'ml', l: 'l' };
    const unit = aliases[rawUnit.toLowerCase()];
    const result = convertedQuantity(numeric(first), unit, units);
    if (!Number.isFinite(result.value) || (last && !Number.isFinite(numeric(last)))) return original;
    const rounded = (value: number) => Number(value.toFixed(2));
    const range = last ? `–${rounded(convertedQuantity(numeric(last), unit, units).value)}` : '';
    return `${rounded(result.value)}${range} ${result.unit} (${original})`;
  });
}
