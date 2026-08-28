import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { PLAN_AMOUNTS_BY_INTERVAL, BillingInterval } from '@/lib/bog';
import ReferralsAdminClient from './ReferralsAdminClient';

export default async function ReferralsAdminPage() {
  await requireAdmin();

  const owners = await prisma.user.findMany({
    where: { referralCode: { not: null } },
    select: {
      id: true,
      name: true,
      email: true,
      referralCode: true,
      createdAt: true,
      subscriptionStatus: true,
      billingIntervalMonths: true,
      bogParentOrderId: true,
      subscriptionCanceledAt: true,
      creditLedgerAsOwner: { select: { type: true, amount: true, referredUserId: true } },
      referrals: {
        select: {
          id: true,
          name: true,
          email: true,
          billingIntervalMonths: true,
          referralFirstPaymentAt: true,
          subscriptionStatus: true,
          subscriptionCanceledAt: true,
          payments: {
            where: { status: 'SUCCESS', discountAmount: { not: null } },
            select: { grossAmount: true, discountAmount: true, billingIntervalMonths: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
      },
    },
  });

  const planAmounts: Record<BillingInterval, number> = {
    1: Number(PLAN_AMOUNTS_BY_INTERVAL[1] ?? 17),
    3: Number(PLAN_AMOUNTS_BY_INTERVAL[3] ?? 39),
    6: Number(PLAN_AMOUNTS_BY_INTERVAL[6] ?? 59),
  };

  const rows = owners.map((o) => {
    const invitedCount = o.referrals.length;
    const paidCount = o.referrals.filter((r) => r.referralFirstPaymentAt).length;
    const activeCount = o.referrals.filter((r) => r.subscriptionStatus === 'FULL_PLAN' && !r.subscriptionCanceledAt).length;
    const canceledCount = o.referrals.filter((r) => !!r.subscriptionCanceledAt).length;

    let totalEarned = 0, totalUsed = 0, totalReversed = 0;
    const reversedReferredIds = new Set<string>();
    for (const entry of o.creditLedgerAsOwner) {
      if (entry.type === 'EARNED') totalEarned += entry.amount;
      else if (entry.type === 'USED') totalUsed += Math.abs(entry.amount);
      else if (entry.type === 'REVERSED') {
        totalReversed += Math.abs(entry.amount);
        if (entry.referredUserId) reversedReferredIds.add(entry.referredUserId);
      }
    }
    const availableCredit = Math.round((totalEarned - totalUsed - totalReversed) * 100) / 100;

    const interval = o.billingIntervalMonths as BillingInterval | null;
    const packagePrice = interval ? planAmounts[interval] : null;
    const isActiveSubscriber = o.subscriptionStatus === 'FULL_PLAN' && !!o.bogParentOrderId;
    const nextChargeAmount = isActiveSubscriber && packagePrice !== null
      ? Math.max(0, Math.round((packagePrice - availableCredit) * 100) / 100)
      : null;

    const referralRows = o.referrals.map((r) => {
      const firstPayment = r.payments[0];
      const interval2 = (firstPayment?.billingIntervalMonths ?? r.billingIntervalMonths) as BillingInterval | null;
      const fullPrice = interval2 ? planAmounts[interval2] : null;
      const discount = firstPayment?.discountAmount ?? null;
      const actuallyPaid = firstPayment ? Math.round(((firstPayment.grossAmount) - (discount ?? 0)) * 100) / 100 : null;
      let status: string;
      if (!r.referralFirstPaymentAt) status = r.subscriptionCanceledAt ? 'გაუქმდა (ტესტში)' : 'სატესტო/მოლოდინში';
      else if (r.subscriptionCanceledAt) status = 'გაუქმდა';
      else status = 'აქტიური';
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        package: interval2 ? `${interval2} თვე` : '—',
        fullPrice,
        discount,
        actuallyPaid,
        paymentStatus: firstPayment ? 'გადახდილი' : 'არ გადახდილა',
        ownerCredit: r.referralFirstPaymentAt ? 1.7 : 0,
        status,
        // Can this referral's earned credit be manually reversed (e.g. an external bank
        // chargeback/refund the app has no webhook for)? Only if it was ever earned in
        // the first place, and only once — never offer it again after it's been reversed.
        canReverse: !!r.referralFirstPaymentAt && !reversedReferredIds.has(r.id),
      };
    });

    return {
      id: o.id,
      name: o.name,
      email: o.email,
      code: o.referralCode!,
      createdAt: o.createdAt.toISOString(),
      invitedCount,
      paidCount,
      activeCount,
      canceledCount,
      totalEarned: Math.round(totalEarned * 100) / 100,
      totalUsed: Math.round(totalUsed * 100) / 100,
      totalReversed: Math.round(totalReversed * 100) / 100,
      availableCredit,
      packagePrice,
      nextChargeAmount,
      subscriptionStatus: o.subscriptionStatus,
      referrals: referralRows,
    };
  }).sort((a, b) => b.invitedCount - a.invitedCount);

  return <ReferralsAdminClient rows={rows} />;
}
