const TBILISI_OFFSET_MS = 4 * 60 * 60 * 1000;

export function revenuePeriod(yearInput?: string, monthInput?: string, now = new Date()) {
  const localNow = new Date(now.getTime() + TBILISI_OFFSET_MS);
  const currentYear = localNow.getUTCFullYear();
  const parsedYear = Number(yearInput);
  const parsedMonth = Number(monthInput);
  const year = Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= currentYear
    ? parsedYear : currentYear;
  const month = Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
    ? parsedMonth : localNow.getUTCMonth() + 1;
  return {
    year, month, currentYear,
    start: new Date(Date.UTC(year, month - 1, 1) - TBILISI_OFFSET_MS),
    end: new Date(Date.UTC(year, month, 1) - TBILISI_OFFSET_MS),
  };
}

export function grossRevenueForPeriod(
  payments: readonly { createdAt: Date; grossAmount: number }[],
  period: { start: Date; end: Date },
) {
  return payments
    .filter(p => p.createdAt >= period.start && p.createdAt < period.end)
    .reduce((sum, p) => sum + Math.round(p.grossAmount * 100), 0) / 100;
}

export function revenueYears(payments: readonly { createdAt: Date }[], currentYear: number) {
  const years = new Set([currentYear]);
  for (const payment of payments) {
    const year = new Date(payment.createdAt.getTime() + TBILISI_OFFSET_MS).getUTCFullYear();
    if (year >= 2000 && year <= currentYear) years.add(year);
  }
  return [...years].sort((a, b) => b - a);
}
