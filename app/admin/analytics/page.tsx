import { currencyFor, normalizeMarket, INTERNATIONAL_PRICES } from '@/lib/market';
import { prisma } from '@/lib/prisma';
import { PLAN_AMOUNTS, PLAN_AMOUNTS_BY_INTERVAL, BillingInterval, applyDiscount } from '@/lib/bog';
import { addWithdrawal } from './actions';
import WithdrawalDeleteButton from '@/components/WithdrawalDeleteButton';
import { revenuePeriod, grossRevenueForPeriod, revenueYears } from '@/lib/revenue-period';
import { getNbgUsdRate, tbilisiDay } from '@/lib/nbg-rate';
import { CARD_KEYS, CARD_LABEL, cardOf, cardStats, isSettled, resolveUsdPayment, type CardKey } from '@/lib/usd-settlement';

const MONTH_NAMES = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];

const PRICES: Record<string, number> = {
  RECIPE_PLAN: Number(PLAN_AMOUNTS.RECIPE_PLAN ?? 15),
  FULL_PLAN: Number(PLAN_AMOUNTS.FULL_PLAN ?? 30),
};
const INTERVAL_PRICE: Record<BillingInterval, number> = {
  1: Number(PLAN_AMOUNTS_BY_INTERVAL[1] ?? 17),
  3: Number(PLAN_AMOUNTS_BY_INTERVAL[3] ?? 39),
  6: Number(PLAN_AMOUNTS_BY_INTERVAL[6] ?? 59),
};
type PriceableUser = {
  subscriptionStatus: string;
  market?: string;
  subscriptionAmount?: number | null;
  billingIntervalMonths?: number | null;
  promoCode?: { discountPercent: number } | null;
};
// Every current tier grants subscriptionStatus='FULL_PLAN' — check billingIntervalMonths
// first, or every current-tier user prices at the stale flat FULL_PLAN legacy amount. A
// promo-linked account is actually charged less, permanently, on every renewal (see
// applyDiscount in lib/bog.ts) — without this, a discounted subscriber would inflate
// revenue totals by whatever their promo knocked off.
const priceFor = (u: PriceableUser) => {
  if (u.subscriptionAmount != null) return u.subscriptionAmount;
  if (u.market === 'INTL') return applyDiscount(INTERNATIONAL_PRICES[(u.billingIntervalMonths || 1) as BillingInterval], u.promoCode?.discountPercent);
  const base = u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths
    ? INTERVAL_PRICE[u.billingIntervalMonths as BillingInterval] ?? PRICES.FULL_PLAN
    : PRICES[u.subscriptionStatus] ?? 0;
  return applyDiscount(base, u.promoCode?.discountPercent);
};
// Normalized to a monthly figure for MRR purposes — a 39₾/3-month subscriber is 13₾ of MRR.
const monthlyPriceFor = (u: PriceableUser) =>
  priceFor(u) / (u.billingIntervalMonths || 1);

export default async function AdminAnalyticsPage(props: { searchParams: Promise<{ market?: string; revenueYear?: string; revenueMonth?: string }> }) {
  const params = await props.searchParams;
  const market = normalizeMarket(params.market);
  const selectedPeriod = revenuePeriod(params.revenueYear, params.revenueMonth);
  const currency = currencyFor(market);
  const currencySymbol = currency === "USD" ? "$" : "₾";
  const INTERVAL_PRICE = market === "INTL" ? INTERNATIONAL_PRICES : Object.fromEntries(Object.entries(PLAN_AMOUNTS_BY_INTERVAL).map(([k,v]) => [k, Number(v)])) as Record<BillingInterval, number>;
  // Tbilisi "now" (Georgia has used a fixed UTC+4 offset, no DST, since 2017) — used only to
  // find the current calendar month's boundaries (1st through the last day) for
  // monthNetRevenue below, so "ეს თვე" agrees with what a Tbilisi-based owner means by "this
  // month" instead of drifting by the few hours' difference from UTC.
  const TBILISI_OFFSET_MS = 4 * 60 * 60 * 1000;
  const nowInTbilisi = new Date(Date.now() + TBILISI_OFFSET_MS);
  const monthStart = new Date(
    Date.UTC(nowInTbilisi.getUTCFullYear(), nowInTbilisi.getUTCMonth(), 1) - TBILISI_OFFSET_MS
  );

  const [users, planItems, recentUsers, successfulPayers, revenuePayments, withdrawals] = await Promise.all([
    prisma.user.findMany({
      where: { market },
      select: {
        id: true,
        market: true,
        subscriptionAmount: true,
        subscriptionStatus: true,
        billingIntervalMonths: true,
        subscriptionStartedAt: true,
        subscriptionCanceledAt: true,
        subscriptionRenewsAt: true,
        createdAt: true,
        isBlocked: true,
        isGifted: true,
        lastActiveAt: true,
        promoCode: { select: { discountPercent: true } },
      },
    }),
    prisma.mealPlanItem.groupBy({
      by: ['dishId'],
      _count: { dishId: true },
      orderBy: { _count: { dishId: 'desc' } },
      take: 10,
    }),
    prisma.user.findMany({
      where: { market },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { market: true, subscriptionAmount: true, name: true, email: true, subscriptionStatus: true, billingIntervalMonths: true, createdAt: true, isGifted: true },
    }),
    // Who has ever actually been charged — the BOG webhook flips subscriptionStatus to
    // FULL_PLAN the moment a trial's card-verification hold clears, well before any real
    // money moves, so subscriptionStatus alone can't tell "committed, paying subscriber"
    // apart from "still in their free trial, might cancel before ever paying a lari".
    prisma.payment.findMany({ where: { status: 'SUCCESS', currency }, select: { userId: true }, distinct: ['userId'] }),
    // All-time actual money collected — one row per real SUCCESS charge, with what BOG's
    // commission and any referral refund actually left in the account, used for both the
    // "სრული შემოსავალი" (all-time) and "ამ თვის შემოსავალი" (this month) balance cards
    // below (see totalNetRevenue/monthNetRevenue) — one unbounded query, filtered by
    // createdAt in JS for the month figure, rather than a second DB round-trip.
    // Both currencies together: the money block below is ONE lari account (USD payments
    // count as the lari actually received), independent of the GE/INTL user toggle.
    prisma.payment.findMany({
      where: { status: 'SUCCESS' },
      select: {
        createdAt: true, currency: true, grossAmount: true, netAmount: true, commissionAmount: true,
        discountAmount: true, discountRefundFailed: true, creditAppliedAmount: true, creditRefundFailed: true,
        cardType: true, settledCardType: true, settledAmountGel: true, settledFxRate: true,
      },
    }),
    prisma.withdrawal.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);
  const paidUserIds = new Set(successfulPayers.map((p) => p.userId));

  // ─── Unified lari account (GEL payments + USD payments as lari received) ────────────
  // GEL payments: exact net from BOG. USD payments: if the owner entered the card + lari
  // received (users page), the figures are exact ("confirmed"). Otherwise they are ESTIMATED
  // from the average bank cost of that card type, learned from the entered ones, at the
  // National Bank of Georgia rate for the payment day. Payments that can't be estimated yet
  // (no rate or no entered payment to learn from) count as 0 and are flagged.
  const usdRows = revenuePayments.filter((p) => p.currency === 'USD');
  const usdStats = cardStats(usdRows);
  const lastKnownRate = [...usdRows]
    .filter(isSettled)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.settledFxRate ?? null;
  const unsettledDays = [...new Set(usdRows.filter((p) => !isSettled(p)).map((p) => tbilisiDay(p.createdAt)))];
  const dayRates = new Map<string, number | null>(
    await Promise.all(unsettledDays.map(async (d) => [d, await getNbgUsdRate(d)] as const)),
  );
  type MoneyRow = { createdAt: Date; grossGel: number; costGel: number; netGel: number; status: 'exact' | 'confirmed' | 'estimated' | 'unknown'; card: CardKey | null };
  const moneyRows: MoneyRow[] = revenuePayments.map((p): MoneyRow => {
    if (p.currency !== 'USD') {
      const discount = p.discountRefundFailed ? 0 : (p.discountAmount ?? 0);
      const credit = p.creditRefundFailed ? 0 : (p.creditAppliedAmount ?? 0);
      return {
        createdAt: p.createdAt, grossGel: p.grossAmount, costGel: p.commissionAmount ?? 0,
        netGel: (p.netAmount ?? 0) - discount - credit, status: 'exact', card: null,
      };
    }
    const dayRate = dayRates.get(tbilisiDay(p.createdAt)) ?? null;
    const r = resolveUsdPayment(p, usdStats, dayRate ?? lastKnownRate);
    return { createdAt: p.createdAt, grossGel: r.grossGel, costGel: r.costGel, netGel: r.netGel, status: r.status === 'confirmed' ? 'confirmed' : r.status, card: cardOf(p) };
  });
  const sumBy = (rows: MoneyRow[], f: (r: MoneyRow) => number) => rows.reduce((sum, r) => sum + f(r), 0);
  const monthRows = moneyRows.filter((r) => r.createdAt >= monthStart);
  const totalNetRevenue = sumBy(moneyRows, (r) => r.netGel);
  const monthNetRevenue = sumBy(monthRows, (r) => r.netGel);
  const totalCommission = sumBy(moneyRows, (r) => r.costGel);
  const monthCommission = sumBy(monthRows, (r) => r.costGel);
  const estimatedRows = moneyRows.filter((r) => r.status === 'estimated');
  const unknownRows = moneyRows.filter((r) => r.status === 'unknown');
  const estimatedNet = sumBy(estimatedRows, (r) => r.netGel);
  const estimatedMonthNet = sumBy(estimatedRows.filter((r) => r.createdAt >= monthStart), (r) => r.netGel);
  const estimatedCommission = sumBy(estimatedRows, (r) => r.costGel);
  const rateFetchFailed = usdRows.some((p) => !isSettled(p) && dayRates.get(tbilisiDay(p.createdAt)) == null);
  const usdCount = usdRows.length;
  const usdConfirmed = usdRows.filter(isSettled).length;

  const monthGrossRevenue = grossRevenueForPeriod(
    moneyRows.map((r) => ({ createdAt: r.createdAt, grossAmount: r.grossGel })),
    selectedPeriod,
  );
  const availableYears = [...new Set([...revenueYears(revenuePayments, selectedPeriod.currentYear), selectedPeriod.year])].sort((a, b) => b - a);
  // Everything entered as a withdrawal is counted as lari (the single account).
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const remainingBalance = totalNetRevenue - totalWithdrawn;
  const usdWithdrawals = withdrawals.filter((w) => w.currency === 'USD').length;

  // Per-card table: what the bank actually takes (incl. conversion), learned from entered payments.
  const cardRows = CARD_KEYS.map((key) => {
    const stat = usdStats.byCard[key];
    const pending = moneyRows.filter((r) => r.card === key && (r.status === 'estimated' || r.status === 'unknown')).length;
    return { key, count: stat?.count ?? 0, pct: stat ? stat.pct * 100 : null, pending };
  }).filter((r) => r.count > 0 || r.pending > 0);
  const noCardPending = usdRows.filter((p) => !isSettled(p) && !cardOf(p)).length;

  const dishIds = planItems.map((p) => p.dishId);
  const topDishes = await prisma.dish.findMany({
    where: { id: { in: dishIds } },
    select: { id: true, titleEn: true, titleKa: true, mealType: true },
  });
  const dishMap = Object.fromEntries(topDishes.map((d) => [d.id, d]));

  // ─── User counts ───────────────────────────────────────────────────────────
  const total = users.length;
  const free = users.filter((u) => u.subscriptionStatus === 'FREE').length;
  const recipe = users.filter((u) => u.subscriptionStatus === 'RECIPE_PLAN').length;
  const full = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN').length;
  // Real current packages — Recipe Plan is no longer sold (always 0 now).
  // Excludes anyone who's already canceled (still FULL_PLAN until their paid period
  // ends, but won't renew) — counts here reflect who's actually still subscribed going
  // forward, not just who happens to still have access today. Also excludes anyone still
  // in their free trial (paidUserIds) — see trialingCount below for where they're counted.
  const full1 = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 1 && !u.subscriptionCanceledAt && paidUserIds.has(u.id)).length;
  const full3 = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 3 && !u.subscriptionCanceledAt && paidUserIds.has(u.id)).length;
  const full6 = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 6 && !u.subscriptionCanceledAt && paidUserIds.has(u.id)).length;
  // Signed up for a paid tier and currently mid-trial — card verified, but not charged a
  // single lari yet, and might cancel before ever converting. Kept separate from MRR/the
  // interval counts above so a wave of new trial signups can't make revenue look higher
  // than it actually is.
  const isTrialing = (u: (typeof users)[number]) =>
    !u.isGifted && !u.subscriptionCanceledAt &&
    (u.subscriptionStatus === 'FULL_PLAN' || u.subscriptionStatus === 'RECIPE_PLAN') &&
    !paidUserIds.has(u.id);
  // Broken out by tier — a single lumped "X on trial" number can't tell you how much of
  // that will convert into 17₾/month vs 59₾/month once each one actually pays.
  const trialInterval1 = users.filter((u) => isTrialing(u) && u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 1).length;
  const trialInterval3 = users.filter((u) => isTrialing(u) && u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 3).length;
  const trialInterval6 = users.filter((u) => isTrialing(u) && u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 6).length;
  const trialingCount = users.filter(isTrialing).length;
  // "Canceled" counts anyone who's canceled, whether their access has already
  // expired (subscriptionStatus === 'CANCELED') or they're just riding out a
  // paid period they won't renew (still FULL_PLAN/RECIPE_PLAN but subscriptionCanceledAt is set).
  const canceled = users.filter(
    (u) => u.subscriptionStatus === 'CANCELED' || (!!u.subscriptionCanceledAt && (u.subscriptionStatus === 'FULL_PLAN' || u.subscriptionStatus === 'RECIPE_PLAN'))
  ).length;
  const blocked = users.filter((u) => u.isBlocked).length;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newThisMonth = users.filter((u) => new Date(u.createdAt) > thirtyDaysAgo).length;
  const activeThisMonth = users.filter(
    (u) => u.subscriptionStartedAt && new Date(u.subscriptionStartedAt) > thirtyDaysAgo
  ).length;

  const conversionRate = total > 0 ? (((recipe + full) / total) * 100).toFixed(1) : '0';
  const retentionRate = newThisMonth > 0 ? ((activeThisMonth / newThisMonth) * 100).toFixed(1) : '0';

  // ─── Real activity (who actually opened the dashboard recently) ────────────────────
  // Distinct from subscriptionStartedAt above (when someone PAID, not when they last used
  // the app) and from dish "ჭამა" votes (an optional click most parents skip entirely —
  // see admin/dish-feedback, which badly undercounts real usage for that exact reason).
  // lastActiveAt is set by /api/heartbeat every time the dashboard loads, in a normal
  // browser tab or an installed home-screen PWA alike, so nobody's usage goes uncounted
  // just because they open Mommenu from their phone's home screen instead of a browser.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const nowMs = Date.now();
  const activeSince = (ms: number) => users.filter((u) => u.lastActiveAt && nowMs - new Date(u.lastActiveAt).getTime() < ms).length;
  const active24h = activeSince(DAY_MS);
  const active7d = activeSince(7 * DAY_MS);
  const active30d = activeSince(30 * DAY_MS);

  // ─── Revenue ───────────────────────────────────────────────────────────────
  // MRR is normalized per-month: a 39₾/3-month subscriber contributes 13₾, not 39₾.
  // Gifted accounts (isGifted) are excluded everywhere below — they have a paid-tier
  // subscriptionStatus but brought in no actual cash, same convention as admin/users.
  // paidUserIds excludes anyone still in their free trial — subscriptionStatus alone
  // flips to FULL_PLAN the moment the trial's card-verification hold clears, well before
  // any real charge, so it can't tell "paying" apart from "trialing" on its own.
  const payingUserRows = users.filter((u) => !u.isGifted && !u.subscriptionCanceledAt && (u.subscriptionStatus === 'RECIPE_PLAN' || u.subscriptionStatus === 'FULL_PLAN') && paidUserIds.has(u.id));
  const mrr = Math.round(payingUserRows.reduce((sum, u) => sum + monthlyPriceFor(u), 0));
  const payingUsers = payingUserRows.length;
  const arpu = payingUsers > 0 ? Math.round(mrr / payingUsers) : 0;
  // How many of those paying users are on a promo code — a promo-linked account is
  // permanently charged less on every renewal (applyDiscount in lib/bog.ts), so MRR here
  // is genuinely lower than "tier price × head count" the moment even one subscriber has a
  // discount — this sub-line is what makes that gap visible instead of looking like a bug.
  const promoPayingCount = payingUserRows.filter((u) => u.promoCode).length;

  const newMrrThisMonth = Math.round(users
    .filter(
      (u) =>
        !u.isGifted &&
        u.subscriptionStartedAt &&
        new Date(u.subscriptionStartedAt) > thirtyDaysAgo &&
        (u.subscriptionStatus === 'RECIPE_PLAN' || u.subscriptionStatus === 'FULL_PLAN') &&
        paidUserIds.has(u.id)
    )
    .reduce((sum, u) => sum + monthlyPriceFor(u), 0));

  // Renewal forecast — which of the next 3 calendar months each active subscriber's next
  // charge (subscriptionRenewsAt) actually falls in. Rolls forward automatically since it's
  // computed from "today" on every load (this month, next month, the one after). Canceled
  // subscribers are excluded — subscriptionCanceledAt means they won't be charged again, per
  // the cancel-keeps-access-until-period-end flow (bog-renew cron downgrades them instead of
  // charging once subscriptionRenewsAt arrives), so they correctly drop out of every future
  // month here the moment they cancel, not just the month they actually stop.
  const renewalForecast: { label: string; count: number; revenue: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + i);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString('ka-GE', { month: 'long', year: 'numeric' });
    const dueUsers = users.filter((u) => {
      if (u.isGifted) return false;
      if (u.subscriptionCanceledAt) return false;
      if (u.subscriptionStatus !== 'FULL_PLAN' && u.subscriptionStatus !== 'RECIPE_PLAN') return false;
      if (!u.subscriptionRenewsAt) return false;
      const r = new Date(u.subscriptionRenewsAt);
      return r.getFullYear() === year && r.getMonth() === month;
    });
    renewalForecast.push({
      label,
      count: dueUsers.length,
      revenue: Math.round(dueUsers.reduce((sum, u) => sum + priceFor(u), 0)),
    });
  }


  const stats = [
    { label: 'Total users', value: total, sub: `${newThisMonth} new this month`, color: 'text-[#465940]' },
    { label: 'Free', value: free, sub: `${((free / Math.max(total, 1)) * 100).toFixed(0)}% of users`, color: 'text-[#465940]/70' },
    { label: `1 month (${INTERVAL_PRICE[1]}${currencySymbol})`, value: full1, sub: 'active', color: 'text-[#465940]' },
    { label: `3 months (${INTERVAL_PRICE[3]}${currencySymbol})`, value: full3, sub: 'active', color: 'text-[#465940]' },
    { label: `6 months (${INTERVAL_PRICE[6]}${currencySymbol})`, value: full6, sub: 'active', color: 'text-[#465940]' },
    { label: 'ტრიალზე', value: trialingCount, sub: `${trialInterval1}×1თვე · ${trialInterval3}×3თვე · ${trialInterval6}×6თვე`, color: 'text-amber-600' },
    { label: 'Canceled', value: canceled, sub: 'churned', color: 'text-amber-600' },
    { label: 'Blocked', value: blocked, sub: 'accounts', color: 'text-[#465940]' },
    { label: 'Conversion rate', value: `${conversionRate}%`, sub: 'free → paid', color: 'text-[#465940]' },
    { label: 'Retention (30d)', value: `${retentionRate}%`, sub: 'new → subscribed', color: 'text-[#465940]' },
  ];

  return (
    <div>
      <nav className="flex gap-4 mb-6"><a href="?market=GE">საქართველო · GEL</a><a href="?market=INTL">საერთაშორისო · USD</a><strong>{currency}</strong></nav>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#465940]">Analytics</h1>
        <p className="mt-1 text-sm text-[#465940]">Overview of users, subscriptions and revenue</p>
      </div>

      {/* ── Real activity ── */}
      <div className="mb-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#465940]/50 mb-3">რეალური აქტივობა</h2>
        <p className="text-[11px] text-[#465940]/50 -mt-2 mb-3">
          ეყრდნობა დეშბორდის ფაქტობრივ გახსნას (ბრაუზერშიც და ჰოუმ-სქრინიდან გახსნილ PWA-შიც) — არა გამოწერის თარიღს და არა &quot;ჭამა&quot; ხმებს, რომლებსაც ბევრი მშობელი უბრალოდ ტოვებს.
        </p>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="rounded-[20px] bg-[#465940] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#FDFBF0]/70">აქტიური (24 სთ)</p>
            <p className="mt-2 text-3xl font-black text-[#FDFBF0]">{active24h}</p>
            <p className="mt-1 text-xs text-[#FDFBF0]/50">{total > 0 ? Math.round((active24h / total) * 100) : 0}% ყველა მომხმარებლიდან</p>
          </div>
          <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#465940]">აქტიური (7 დღე)</p>
            <p className="mt-2 text-3xl font-black text-[#465940]">{active7d}</p>
            <p className="mt-1 text-xs text-[#465940]/50">{total > 0 ? Math.round((active7d / total) * 100) : 0}% ყველა მომხმარებლიდან</p>
          </div>
          <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#465940]">აქტიური (30 დღე)</p>
            <p className="mt-2 text-3xl font-black text-[#465940]">{active30d}</p>
            <p className="mt-1 text-xs text-[#465940]/50">{total > 0 ? Math.round((active30d / total) * 100) : 0}% ყველა მომხმარებლიდან</p>
          </div>
        </div>
      </div>

      {/* ── Revenue cards ── */}
      <div className="mb-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#465940]/50 mb-3">შემოსავალი</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="rounded-[20px] bg-[#465940] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#FDFBF0]/70">MRR (ყოველთვიური)</p>
            <p className="mt-2 text-3xl font-black text-[#FDFBF0]">{mrr}{currencySymbol}</p>
            <p className="mt-1 text-xs text-[#FDFBF0]/50">
              {payingUsers} მომხმარებელი{promoPayingCount > 0 ? ` · ${promoPayingCount} მათგან პრომოკოდით (ფასდაკლებული)` : ''}
            </p>
          </div>
          <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#465940]">ახალი MRR (30 დღე)</p>
            <p className="mt-2 text-3xl font-black text-[#465940]">{newMrrThisMonth}{currencySymbol}</p>
            <p className="mt-1 text-xs text-[#465940]/50">{activeThisMonth} ახალი გამოწერა</p>
          </div>
          <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#465940]">ARR (წლიური)</p>
            <p className="mt-2 text-3xl font-black text-[#465940]">{mrr * 12}{currencySymbol}</p>
            <p className="mt-1 text-xs text-[#465940]/50">MRR × 12</p>
          </div>
          <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#465940]">ARPU (საშ. / მომხ.)</p>
            <p className="mt-2 text-3xl font-black text-[#465940]">{arpu}{currencySymbol}</p>
            <p className="mt-1 text-xs text-[#465940]/50">paying users only</p>
          </div>
        </div>
      </div>

      {/* ── Balance: ONE lari account — GEL payments + USD payments as lari received ── */}
      <div className="mb-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#465940]/50 mb-3">შემოსავალი საკომისიოს ჩამოჭრამდე</h2>
        <form method="get" className="flex flex-wrap items-end gap-3 mb-4">
          <input type="hidden" name="market" value={market} />
          <label className="text-sm font-semibold text-[#465940]">
            წელი
            <select name="revenueYear" defaultValue={selectedPeriod.year} className="block mt-1 rounded-xl border border-[#465940]/20 bg-[#FDFBF0] px-3 py-2">
              {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-[#465940]">
            თვე
            <select name="revenueMonth" defaultValue={selectedPeriod.month} className="block mt-1 rounded-xl border border-[#465940]/20 bg-[#FDFBF0] px-3 py-2">
              {MONTH_NAMES.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
            </select>
          </label>
          <button type="submit" className="rounded-full bg-[#465940] px-5 py-2 text-sm font-bold text-[#FDFBF0]">ჩვენება</button>
        </form>
        <div className="mb-6">
          <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#465940]">{MONTH_NAMES[selectedPeriod.month - 1]} {selectedPeriod.year} — საკომისიომდე</p>
            <p className="mt-2 text-3xl font-black text-[#465940]">{monthGrossRevenue.toFixed(2)}₾</p>
            <p className="mt-1 text-xs text-[#465940]/50">ლარი + USD ერთად (USD ეროვნული ბანკის კურსით ლარში გადაყვანილი), თვის 1 რიცხვიდან ბოლო რიცხვის ჩათვლით, საქართველოს დროით</p>
          </div>
        </div>
        <h2 className="text-xs font-black uppercase tracking-widest text-[#465940]/50 mb-3">ბალანსი (ერთი ლარის ანგარიში)</h2>
        <p className="text-[11px] text-[#465940]/50 -mt-2 mb-3">
          ლარის გადახდები - BOG-ის საკომისიოს გამოკლებით. USD გადახდები - ლარი, რაც რეალურად ჩაგერიცხა (შენს მიერ შეყვანილი მომხმარებლების გვერდზე), ხოლო ვისაც ჯერ არ შეუყვანია - სავარაუდო, იმავე ბარათის საშუალო საკომისიოთი. რეფერალური დაბრუნებები გამოკლებულია.
        </p>
        {(unknownRows.length > 0 || rateFetchFailed) && (
          <div className="mb-3 rounded-2xl border border-amber-400/60 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            {unknownRows.length > 0 && <p>⚠ {unknownRows.length} USD გადახდა ჯერ ვერ დაითვალა (არც კურსია ცნობილი და არც ერთი შევსებული გადახდა, საიდანაც საკომისიოს ვისწავლით) - ბალანსში 0₾-ად არის. შეავსე ერთი მაინც მომხმარებლების გვერდზე (საერთაშორისო).</p>}
            {rateFetchFailed && <p>⚠ ეროვნული ბანკის კურსი ამჟამად ვერ ჩამოიტვირთა - ვის გადახდასაც კურსი არ აქვს, ბოლო ცნობილი კურსით ითვლება.</p>}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-4">
          <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#465940]">სრული შემოსავალი</p>
            <p className="mt-2 text-3xl font-black text-[#465940]">{totalNetRevenue.toFixed(2)}₾</p>
            <p className="mt-1 text-xs text-[#465940]/50">წმინდა, დღემდე სულ{estimatedRows.length > 0 ? ` · აქედან სავარაუდო: ${estimatedNet.toFixed(2)}₾` : ''}</p>
          </div>
          <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#465940]">ამ თვის შემოსავალი</p>
            <p className="mt-2 text-3xl font-black text-[#465940]">{monthNetRevenue.toFixed(2)}₾</p>
            <p className="mt-1 text-xs text-[#465940]/50">წმინდა, ამ თვეში{estimatedMonthNet !== 0 ? ` · სავარაუდო: ${estimatedMonthNet.toFixed(2)}₾` : ''}</p>
          </div>
          <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#465940]">ბანკის საკომისიო</p>
            <p className="mt-2 text-3xl font-black text-[#465940]">{totalCommission.toFixed(2)}₾</p>
            <p className="mt-1 text-xs text-[#465940]/50">დღემდე სულ · ამ თვე: {monthCommission.toFixed(2)}₾{estimatedRows.length > 0 ? ` · სავარაუდო ნაწილი: ${estimatedCommission.toFixed(2)}₾` : ''}</p>
          </div>
          <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#465940]">სულ გატანილი</p>
            <p className="mt-2 text-3xl font-black text-[#465940]">{totalWithdrawn.toFixed(2)}₾</p>
            <p className="mt-1 text-xs text-[#465940]/50">{withdrawals.length} ჩანაწერი</p>
          </div>
          <div className="rounded-[20px] bg-[#465940] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#FDFBF0]/70">დარჩენილი ბალანსი</p>
            <p className="mt-2 text-3xl font-black text-[#FDFBF0]">{remainingBalance.toFixed(2)}₾</p>
            <p className="mt-1 text-xs text-[#FDFBF0]/50">ბანკს ევალება შენთვის · სრული შემოსავალი − გატანილი</p>
          </div>
        </div>

        {/* ── What the bank takes per card type (learned from the USD payments she filled in) ── */}
        {usdCount > 0 && (
          <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm mb-4">
            <h3 className="font-bold text-[#465940] mb-1">USD გადახდები - რამდენს იღებს ბანკი ბარათის მიხედვით</h3>
            <p className="text-[11px] text-[#465940]/50 mb-3">
              {usdConfirmed} / {usdCount} გადახდა შევსებულია. პროცენტი = (დოლარი × ეროვნული ბანკის კურსი − რაც ჩაგერიცხა) / (დოლარი × კურსი), ანუ საკომისიო და კონვერტაციის სხვაობა ერთად.
            </p>
            {cardRows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-[#465940]/60">
                      <th className="py-1.5 pr-4">ბარათი</th>
                      <th className="py-1.5 pr-4">შევსებული გადახდა</th>
                      <th className="py-1.5 pr-4">ბანკს მიაქვს</th>
                      <th className="py-1.5">შეუვსებელი (სავარაუდოდ ითვლება)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#465940]/10">
                    {cardRows.map((r) => (
                      <tr key={r.key} className="text-[#465940]">
                        <td className="py-2 pr-4 font-semibold">{CARD_LABEL[r.key]}</td>
                        <td className="py-2 pr-4">{r.count}</td>
                        <td className="py-2 pr-4 font-bold">{r.pct != null ? `${r.pct.toFixed(2)}%` : '—'}</td>
                        <td className="py-2">{r.pending}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[#465940]/50">ჯერ არცერთი USD გადახდა არ არის შევსებული.</p>
            )}
            {noCardPending > 0 && (
              <p className="mt-2 text-[11px] text-[#465940]/60">{noCardPending} შეუვსებელ გადახდაზე BOG-მა ბარათის ტიპი არ დააბრუნა - ისინი ითვლება ყველა შევსებულის საერთო საშუალო საკომისიოთი.</p>
            )}
          </div>
        )}

        <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm mb-6">
          <form action={addWithdrawal} className="flex flex-wrap items-end gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-[#465940]/70 mb-1">გატანილი თანხა (₾)</label>
              <input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00"
                className="w-32 px-3 py-2 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm text-[#465940] bg-white" />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-semibold text-[#465940]/70 mb-1">შენიშვნა (არასავალდებულო)</label>
              <input name="note" type="text" placeholder="მაგ. გატანა ბარათზე"
                className="w-full px-3 py-2 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm text-[#465940] bg-white" />
            </div>
            <button type="submit"
              className="px-5 py-2 rounded-full bg-[#465940] text-[#FDFBF0] text-sm font-bold hover:opacity-90 transition">
              დამატება
            </button>
          </form>
          {usdWithdrawals > 0 && (
            <p className="mb-3 text-[11px] text-amber-700">⚠ {usdWithdrawals} ძველი გატანის ჩანაწერი USD-შია შეყვანილი, მაგრამ ბალანსში უბრალოდ ციფრად ითვლება ლარად. შეამოწმე და საჭიროებისას წაშალე/თავიდან შეიყვანე ლარში.</p>
          )}

          {withdrawals.length > 0 ? (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between gap-3 text-sm py-1.5 border-t border-[#465940]/10 first:border-t-0">
                  <div className="min-w-0">
                    <span className="font-bold text-[#465940]">{w.amount.toFixed(2)}{w.currency === 'USD' ? '$' : '₾'}</span>
                    {w.note && <span className="text-[#465940]/60 ml-2 truncate">{w.note}</span>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-[#465940]/40">{new Date(w.createdAt).toLocaleDateString('ka-GE')}</span>
                    <WithdrawalDeleteButton id={w.id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#465940]/40">ჯერ არაფერია გატანილი.</p>
          )}
        </div>
      </div>

      {/* ── User stats ── */}
      <div className="mb-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#465940]/50 mb-3">მომხმარებლები</h2>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#465940]">{s.label}</p>
              <p className={`mt-2 text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-xs text-[#bbb]">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Renewal forecast (next 3 months) ── */}
        <section className="rounded-[20px] bg-[#FDFBF0] p-6 shadow-sm">
          <h2 className="mb-1 font-bold text-[#465940]">მოსალოდნელი განახლებები</h2>
          <p className="text-[10px] text-[#465940]/50 mb-4">ვისაც აქ თვეში ჩამოეჭრება — გაუქმებულები უკვე გამოკლებულია</p>
          <div className="space-y-4">
            {renewalForecast.map((m, i) => (
              <div key={m.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-[#465940]">
                    {m.label} {i === 0 && <span className="text-[10px] font-normal text-[#465940]/40">(მიმდინარე)</span>}
                  </span>
                  <span className="font-black text-[#465940]">
                    {m.revenue}{currencySymbol} <span className="font-normal text-[#465940]/50">({m.count} გამომწერი)</span>
                  </span>
                </div>
                <div className="h-3 bg-[#465940]/10 rounded-full overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-[#465940] transition-all"
                    style={{ width: `${Math.max(...renewalForecast.map((x) => x.revenue), 1) > 0 ? (m.revenue / Math.max(...renewalForecast.map((x) => x.revenue), 1)) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {renewalForecast.every((m) => m.count === 0) && (
            <p className="text-center text-sm text-[#465940]/40 mt-4">მოახლოებული განახლება არ არის</p>
          )}
        </section>

        {/* ── Top dishes ── */}
        <section className="rounded-[20px] bg-[#FDFBF0] p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-[#465940]">Top 10 meals (by plan usage)</h2>
          <div className="space-y-3">
            {planItems.map((item, i) => {
              const dish = dishMap[item.dishId];
              if (!dish) return null;
              const max = planItems[0]._count.dishId;
              const pct = Math.round((item._count.dishId / max) * 100);
              return (
                <div key={item.dishId}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#465940]">
                      {i + 1}. {dish.titleKa || dish.titleEn}
                    </span>
                    <span className="text-[#465940]">{item._count.dishId}×</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-[#465940]/10">
                    <div className="h-1.5 rounded-full bg-[#465940]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {planItems.length === 0 && (
              <p className="text-sm text-[#bbb]">No plan data yet.</p>
            )}
          </div>
        </section>

        {/* ── Recent registrations ── */}
        <section className="rounded-[20px] bg-[#FDFBF0] p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-[#465940]">Recent registrations</h2>
          <div className="space-y-3">
            {recentUsers.map((u) => {
              const price = u.isGifted || u.subscriptionStatus === 'FREE' || u.subscriptionStatus === 'CANCELED' ? undefined : priceFor(u);
              return (
                <div key={u.email} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#465940]">{u.name}</p>
                    <p className="text-xs text-[#465940]/60">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      price ? 'bg-[#465940] text-[#FDFBF0]' : 'bg-[#465940]/10 text-[#465940]/70'
                    }`}>
                      {u.isGifted ? 'GIFTED' : price ? `${price}${currencySymbol}` : u.subscriptionStatus}
                    </span>
                    <p className="mt-1 text-xs text-[#bbb]">{new Date(u.createdAt).toLocaleDateString('ka-GE')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Subscription breakdown bar ── */}
        <section className="rounded-[20px] bg-[#FDFBF0] p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-bold text-[#465940]">Subscription breakdown</h2>
          <div className="flex items-center gap-4 flex-wrap mb-4">
            {[
              { label: 'Free', count: free, color: 'bg-[#465940]/15' },
              ...(recipe > 0 ? [{ label: `Recipe ${PRICES.RECIPE_PLAN}${currencySymbol} — legacy`, count: recipe, color: 'bg-[#465940]/35' }] : []),
              { label: `1 თვე (${INTERVAL_PRICE[1]}${currencySymbol})`, count: full1, color: 'bg-[#465940]/55' },
              { label: `3 თვე (${INTERVAL_PRICE[3]}${currencySymbol})`, count: full3, color: 'bg-[#465940]/75' },
              { label: `6 თვე (${INTERVAL_PRICE[6]}${currencySymbol})`, count: full6, color: 'bg-[#465940]' },
              { label: 'ტრიალზე', count: trialingCount, color: 'bg-amber-300' },
              { label: 'Canceled', count: canceled, color: 'bg-red-300' },
            ].map((seg) => (
              <div key={seg.label} className="flex items-center gap-2 text-sm">
                <span className={`h-3 w-3 rounded-full ${seg.color}`} />
                <span className="font-semibold text-[#465940]">{seg.label}</span>
                <span className="text-[#465940]">{seg.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex h-6 w-full overflow-hidden rounded-full">
            {[
              { count: free, color: 'bg-[#465940]/15' },
              { count: recipe, color: 'bg-[#465940]/35' },
              { count: full1, color: 'bg-[#465940]/55' },
              { count: full3, color: 'bg-[#465940]/75' },
              { count: full6, color: 'bg-[#465940]' },
              { count: trialingCount, color: 'bg-amber-300' },
              { count: canceled, color: 'bg-red-300' },
            ]
              .filter((s) => s.count > 0)
              .map((seg, i) => (
                <div
                  key={i}
                  className={seg.color}
                  style={{ width: `${(seg.count / Math.max(total, 1)) * 100}%` }}
                />
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
