// National Bank of Georgia official USD→GEL rate for a given date.
// Never throws: returns null when the rate can't be fetched, so callers can fall back to
// manual entry or to the last known rate.

const TBILISI_OFFSET_MS = 4 * 60 * 60 * 1000;

/** Tbilisi calendar day (YYYY-MM-DD) of a moment in time. */
export function tbilisiDay(date: Date): string {
  return new Date(date.getTime() + TBILISI_OFFSET_MS).toISOString().slice(0, 10);
}

const ENDPOINTS = (date: string) => [
  `https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json/?currencies=USD&date=${date}`,
  `https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json?currencies=USD&date=${date}`,
  `https://nbg.gov.ge/api/ct/monetarypolicy/currencies/en/json/?currencies=USD&date=${date}`,
];

// Walks whatever JSON shape the API returns and finds the USD entry.
function findUsd(node: unknown): { rate: number; quantity: number } | null {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findUsd(item);
      if (hit) return hit;
    }
    return null;
  }
  const obj = node as Record<string, unknown>;
  if (obj.code === 'USD' && obj.rate != null) {
    const rate = Number(obj.rate);
    const quantity = Number(obj.quantity ?? 1) || 1;
    if (Number.isFinite(rate) && rate > 0) return { rate, quantity };
  }
  for (const value of Object.values(obj)) {
    const hit = findUsd(value);
    if (hit) return hit;
  }
  return null;
}

const memo = new Map<string, number | null>();

export async function getNbgUsdRate(date: string): Promise<number | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (memo.has(date) && memo.get(date) != null) return memo.get(date)!;
  for (const url of ENDPOINTS(date)) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 60 * 60 * 24 },
      });
      if (!res.ok) continue;
      const hit = findUsd(await res.json());
      if (hit) {
        const rate = hit.rate / hit.quantity;
        memo.set(date, rate);
        return rate;
      }
    } catch {
      // try the next endpoint
    }
  }
  return null;
}
