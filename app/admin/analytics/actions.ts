'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getNbgUsdRate, tbilisiDay } from '@/lib/nbg-rate';
import { isCardKey } from '@/lib/usd-settlement';

// The balance is ONE lari account (USD payments are counted as the lari actually received),
// so every withdrawal is recorded in GEL.
export async function addWithdrawal(formData: FormData) {
  await requireAdmin();
  const amount = Number(formData.get('amount'));
  const noteRaw = String(formData.get('note') ?? '').trim();
  if (!Number.isFinite(amount) || amount <= 0) return;
  await prisma.withdrawal.create({ data: { amount, currency: 'GEL', note: noteRaw || null } });
  revalidatePath('/admin/analytics');
}

export async function deleteWithdrawal(id: string) {
  await requireAdmin();
  await prisma.withdrawal.delete({ where: { id } });
  revalidatePath('/admin/analytics');
}

export type SettlementResult = { ok: true; rate: number; rateDate: string } | { ok: false; error: string };

// Owner enters, for one foreign (USD) payment, which card it was and how many lari the bank
// credited. The USD→GEL rate is the National Bank of Georgia's official rate for the given
// date (default: the payment's day in Tbilisi) unless she types a rate herself.
export async function saveUsdSettlement(input: {
  paymentId: string;
  card: string;
  amountGel: number;
  date?: string;
  manualRate?: number | null;
}): Promise<SettlementResult> {
  await requireAdmin();
  if (!isCardKey(input.card)) return { ok: false, error: 'აირჩიე ბარათის ტიპი' };
  if (!Number.isFinite(input.amountGel) || input.amountGel <= 0) return { ok: false, error: 'ჩარიცხული თანხა უნდა იყოს 0-ზე მეტი' };

  const payment = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    select: { id: true, currency: true, status: true, createdAt: true, grossAmount: true },
  });
  if (!payment || payment.currency !== 'USD' || payment.status !== 'SUCCESS') {
    return { ok: false, error: 'ეს გადახდა USD-ით წარმატებული გადახდა არ არის' };
  }

  const rateDate = input.date && /^\d{4}-\d{2}-\d{2}$/.test(input.date) ? input.date : tbilisiDay(payment.createdAt);
  let rate: number | null = null;
  if (input.manualRate != null && Number.isFinite(input.manualRate) && input.manualRate > 0) rate = input.manualRate;
  else rate = await getNbgUsdRate(rateDate);
  if (rate == null) {
    return { ok: false, error: 'ეროვნული ბანკის კურსი ვერ მოიძებნა - ჩაწერე კურსი ხელით (მაგ. 2.7) და ისევ შეინახე' };
  }
  // Sanity check: received lari can't be wildly more/less than gross × rate.
  const expected = payment.grossAmount * rate;
  if (input.amountGel > expected * 1.05 || input.amountGel < expected * 0.5) {
    return { ok: false, error: `თანხა საეჭვოა: ${payment.grossAmount}$ × ${rate.toFixed(4)} ≈ ${expected.toFixed(2)}₾. შეამოწმე ჩარიცხული თანხა.` };
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      settledCardType: input.card,
      settledAmountGel: input.amountGel,
      settledFxRate: rate,
      settledRateDate: rateDate,
      settledAt: new Date(),
    },
  });
  revalidatePath('/admin/users');
  revalidatePath('/admin/analytics');
  return { ok: true, rate, rateDate };
}

export async function clearUsdSettlement(paymentId: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  await prisma.payment.update({
    where: { id: paymentId },
    data: { settledCardType: null, settledAmountGel: null, settledFxRate: null, settledRateDate: null, settledAt: null },
  });
  revalidatePath('/admin/users');
  revalidatePath('/admin/analytics');
  return { ok: true };
}
