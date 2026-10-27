// Pure helpers for unifying USD (foreign) payments into the single GEL account.
//
// Foreign customers pay in USD but the owner receives lari from the bank. For each USD
// payment she can enter which card it was and how many lari landed. From that and the NBG
// rate we derive the bank's effective cost (commission + conversion spread) per card type,
// and use it to ESTIMATE payments she hasn't entered yet.

export const CARD_KEYS = ['VISA', 'MASTERCARD', 'AMEX', 'UNIONPAY', 'OTHER'] as const;
export type CardKey = (typeof CARD_KEYS)[number];

export const CARD_LABEL: Record<CardKey, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'American Express',
  UNIONPAY: 'UnionPay',
  OTHER: 'სხვა',
};

export function isCardKey(value: unknown): value is CardKey {
  return typeof value === 'string' && (CARD_KEYS as readonly string[]).includes(value);
}

/** Maps whatever BOG's callback called the card to one of our keys (null = unknown). */
export function normalizeCard(raw?: string | null): CardKey | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes('visa')) return 'VISA';
  if (s.includes('master') || s === 'mc' || s.includes('maestro')) return 'MASTERCARD';
  if (s.includes('amex') || s.includes('american')) return 'AMEX';
  if (s.includes('union')) return 'UNIONPAY';
  return null;
}

export type UsdPaymentLike = {
  grossAmount: number;
  discountAmount?: number | null;
  discountRefundFailed?: boolean | null;
  creditAppliedAmount?: number | null;
  creditRefundFailed?: boolean | null;
  cardType?: string | null;
  settledCardType?: string | null;
  settledAmountGel?: number | null;
  settledFxRate?: number | null;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** USD refunded back out of this payment (referral discount / credit) that really went through. */
export function refundsUsd(p: UsdPaymentLike): number {
  const discount = p.discountRefundFailed ? 0 : (p.discountAmount ?? 0);
  const credit = p.creditRefundFailed ? 0 : (p.creditAppliedAmount ?? 0);
  return discount + credit;
}

export function isSettled(p: UsdPaymentLike): boolean {
  return p.settledAmountGel != null && p.settledFxRate != null && p.settledFxRate > 0;
}

export function cardOf(p: UsdPaymentLike): CardKey | null {
  return (isCardKey(p.settledCardType) ? p.settledCardType : null) ?? normalizeCard(p.cardType);
}

/** Effective cost % for one entered payment: (gross×rate − received) / (gross×rate). */
export function settledCostPct(p: UsdPaymentLike): number | null {
  if (!isSettled(p)) return null;
  const grossGel = p.grossAmount * p.settledFxRate!;
  if (grossGel <= 0) return null;
  return (grossGel - p.settledAmountGel!) / grossGel;
}

export type CardStat = { count: number; grossGel: number; costGel: number; pct: number };

/** Weighted average cost per card type over all entered payments. */
export function cardStats(payments: readonly UsdPaymentLike[]): { byCard: Partial<Record<CardKey, CardStat>>; overall: CardStat | null } {
  const byCard: Partial<Record<CardKey, CardStat>> = {};
  let oCount = 0, oGross = 0, oCost = 0;
  for (const p of payments) {
    if (!isSettled(p)) continue;
    const grossGel = p.grossAmount * p.settledFxRate!;
    const costGel = grossGel - p.settledAmountGel!;
    const key = cardOf(p) ?? 'OTHER';
    const s = byCard[key] ?? { count: 0, grossGel: 0, costGel: 0, pct: 0 };
    s.count += 1; s.grossGel += grossGel; s.costGel += costGel;
    byCard[key] = s;
    oCount += 1; oGross += grossGel; oCost += costGel;
  }
  for (const s of Object.values(byCard)) if (s) s.pct = s.grossGel > 0 ? s.costGel / s.grossGel : 0;
  return {
    byCard,
    overall: oCount > 0 ? { count: oCount, grossGel: oGross, costGel: oCost, pct: oGross > 0 ? oCost / oGross : 0 } : null,
  };
}

export type ResolvedUsdPayment = {
  status: 'confirmed' | 'estimated' | 'unknown';
  /** Which basis an estimate used: that card's own average or the overall average. */
  basis?: 'card' | 'overall';
  rate: number | null;
  grossGel: number;
  costGel: number;
  /** Lari that stay in the account from this payment, after bank cost and USD refunds. */
  netGel: number;
};

/**
 * Turns one USD payment into lari figures.
 * - confirmed: owner entered what she received → exact.
 * - estimated: uses that card's learned average cost (or the overall average) and `fallbackRate`.
 * - unknown: no rate or no cost data at all → contributes 0 and is flagged.
 */
export function resolveUsdPayment(
  p: UsdPaymentLike,
  stats: ReturnType<typeof cardStats>,
  fallbackRate: number | null,
): ResolvedUsdPayment {
  if (isSettled(p)) {
    const rate = p.settledFxRate!;
    const grossGel = p.grossAmount * rate;
    return {
      status: 'confirmed',
      rate,
      grossGel: round2(grossGel),
      costGel: round2(grossGel - p.settledAmountGel!),
      netGel: round2(p.settledAmountGel! - refundsUsd(p) * rate),
    };
  }
  const card = cardOf(p);
  const cardStat = card ? stats.byCard[card] : undefined;
  const stat = cardStat ?? stats.overall;
  if (!stat || fallbackRate == null) {
    return { status: 'unknown', rate: fallbackRate, grossGel: fallbackRate != null ? round2(p.grossAmount * fallbackRate) : 0, costGel: 0, netGel: 0 };
  }
  const grossGel = p.grossAmount * fallbackRate;
  const costGel = grossGel * stat.pct;
  return {
    status: 'estimated',
    basis: cardStat ? 'card' : 'overall',
    rate: fallbackRate,
    grossGel: round2(grossGel),
    costGel: round2(costGel),
    netGel: round2(grossGel - costGel - refundsUsd(p) * fallbackRate),
  };
}
