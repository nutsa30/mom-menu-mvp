import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { ensureReferralCode, getAvailableCredit, hasPendingReferralDiscount, REFERRAL_CREDIT_AMOUNT, REFERRAL_DISCOUNT_PERCENT } from '@/lib/referral';
import { PLAN_AMOUNTS_BY_INTERVAL, BillingInterval } from '@/lib/bog';
import { NextResponse } from 'next/server';

// GET /api/referral — everything the "პრომოკოდი" dashboard tab needs: the user's own
// code, invite stats, and their current credit balance/next-charge estimate. All numbers
// are computed live from CreditLedgerEntry / Payment / User — nothing cached, so this can
// never drift from the audit trail admin sees in app/admin/referrals.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Lazy backfill — accounts registered before this feature shipped won't have a code yet.
  if (!user.referralCode) {
    await ensureReferralCode(user.id);
    user = await prisma.user.findUnique({ where: { id: user.id } });
  }

  const [invitedCount, paidCount, ledgerAgg, referredByOwner] = await Promise.all([
    prisma.user.count({ where: { referredByUserId: user!.id } }),
    prisma.user.count({ where: { referredByUserId: user!.id, referralFirstPaymentAt: { not: null } } }),
    prisma.creditLedgerEntry.groupBy({ by: ['type'], where: { ownerId: user!.id }, _sum: { amount: true } }),
    user!.referredByUserId
      ? prisma.user.findUnique({ where: { id: user!.referredByUserId }, select: { referralCode: true, name: true } })
      : null,
  ]);

  const totalsByType: Record<string, number> = {};
  for (const row of ledgerAgg) totalsByType[row.type] = row._sum.amount ?? 0;
  const totalEarned = totalsByType.EARNED ?? 0;
  const totalUsed = Math.abs(totalsByType.USED ?? 0);
  const totalReversed = Math.abs(totalsByType.REVERSED ?? 0);
  const availableCredit = await getAvailableCredit(user!.id);

  const interval = user!.billingIntervalMonths as BillingInterval | null;
  const packagePrice = interval ? Number(PLAN_AMOUNTS_BY_INTERVAL[interval] ?? 0) : null;
  const isActiveSubscriber = user!.subscriptionStatus === 'FULL_PLAN' && !!user!.bogParentOrderId;
  // A referred user still awaiting their first real charge (e.g. currently in the 3-day
  // trial) is guaranteed 10% off that charge — factor it in here too, or this "next
  // charge" preview would quote the full price and contradict the page's own promise.
  const expectedPrice = packagePrice !== null && hasPendingReferralDiscount(user!)
    ? Math.round(packagePrice * (1 - REFERRAL_DISCOUNT_PERCENT / 100) * 100) / 100
    : packagePrice;
  const nextChargeAmount = isActiveSubscriber && expectedPrice !== null
    ? Math.max(0, Math.round((expectedPrice - availableCredit) * 100) / 100)
    : null;

  return NextResponse.json({
    code: user!.referralCode,
    discountPercent: REFERRAL_DISCOUNT_PERCENT,
    creditPerReferral: REFERRAL_CREDIT_AMOUNT,
    invitedCount,
    paidCount,
    availableCredit,
    totalEarned,
    totalUsed,
    totalReversed,
    packagePrice,
    nextChargeAmount,
    canRedeem: !user!.referredByUserId && !user!.bogParentOrderId,
    alreadyUsedCode: user!.referredByUserId ? (referredByOwner?.referralCode ?? null) : null,
  });
}
