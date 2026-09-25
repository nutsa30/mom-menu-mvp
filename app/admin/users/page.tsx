import { prisma } from '@/lib/prisma';
import { adminDict, getAdminLocale } from '@/lib/adminI18n';
import UsersFilterBar from '@/components/UsersFilterBar';
import UsersSearchTable from '@/components/UsersSearchTable';
import DueByDateList from '@/components/DueByDateList';
import { PLAN_AMOUNTS, PLAN_AMOUNTS_BY_INTERVAL, BillingInterval, applyDiscount } from '@/lib/bog';

// Real, currently-charged prices (env-configured, not hardcoded) — used for every
// MRR/ARR/revenue calc below so this page never drifts from what customers actually pay.
const RECIPE_PRICE = Number(PLAN_AMOUNTS.RECIPE_PLAN ?? 15);
const FULL_PRICE = Number(PLAN_AMOUNTS.FULL_PLAN ?? 30);
const INTERVAL_PRICE: Record<BillingInterval, number> = {
  1: Number(PLAN_AMOUNTS_BY_INTERVAL[1] ?? 17),
  3: Number(PLAN_AMOUNTS_BY_INTERVAL[3] ?? 39),
  6: Number(PLAN_AMOUNTS_BY_INTERVAL[6] ?? 59),
};
type PriceableUser = {
  subscriptionStatus: string;
  billingIntervalMonths?: number | null;
  promoCode?: { discountPercent: number } | null;
};
// Every current tier grants subscriptionStatus='FULL_PLAN' — the real price/cadence lives
// in billingIntervalMonths, so this must be checked first or every current-tier user would
// incorrectly price at the legacy flat FULL_PRICE regardless of which tier they're actually on.
// A promo-linked account is actually charged less, permanently, on every renewal (see
// applyDiscount in lib/bog.ts) — without this, a discounted subscriber would inflate MRR by
// whatever their promo knocked off.
const priceFor = (user: PriceableUser) => {
  const base = user.subscriptionStatus === 'FULL_PLAN' && user.billingIntervalMonths
    ? INTERVAL_PRICE[user.billingIntervalMonths as BillingInterval] ?? FULL_PRICE
    : (user.subscriptionStatus === 'RECIPE_PLAN' ? RECIPE_PRICE : FULL_PRICE);
  return applyDiscount(base, user.promoCode?.discountPercent);
};
// Same price, normalized to a monthly figure — a 39₾/3-month plan contributes 13₾ to MRR,
// not the full 39₾, since MRR is inherently a per-month measure.
const monthlyPriceFor = (user: PriceableUser) =>
  priceFor(user) / (user.billingIntervalMonths || 1);

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { lang?: string; tab?: string; promo?: string };
}) {
  const locale = getAdminLocale(searchParams.lang);
  const d = adminDict[locale];
  const activeTab = searchParams.tab ?? 'all';
  const activePromo = searchParams.promo ?? '';

  // Tbilisi "now" (Georgia has used a fixed UTC+4 offset, no DST, since 2017) — computed
  // once here and reused both for the calendar-month revenue boundaries below and the "due
  // today" list further down, so every date-based section on this page agrees on what day/
  // month it actually is for an admin reading this from Tbilisi. Vercel functions run in
  // UTC, so a naive new Date().setHours(0,0,0,0) would silently shift every window by 4
  // hours from what a Tbilisi reader means by "today"/"this month".
  const TBILISI_OFFSET_MS = 4 * 60 * 60 * 1000;
  const nowInTbilisi = new Date(Date.now() + TBILISI_OFFSET_MS);
  const todayStart = new Date(
    Date.UTC(nowInTbilisi.getUTCFullYear(), nowInTbilisi.getUTCMonth(), nowInTbilisi.getUTCDate()) - TBILISI_OFFSET_MS
  );
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [users, promoCodes, successfulPayers, allSuccessPaymentDates, promoRevenueTotal, allTimeRevenueAgg] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        isBlocked: true, isGifted: true, subscriptionStatus: true, billingIntervalMonths: true,
        subscriptionStartedAt: true, subscriptionCanceledAt: true, subscriptionRenewsAt: true, createdAt: true,
        paymentFailedAt: true,
        promoCode: { select: { id: true, code: true, planType: true, discountPercent: true } },
        _count: { select: { children: true } },
      },
    }),
    prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, code: true, planType: true } }),
    // Who has ever actually been charged. The BOG webhook flips subscriptionStatus to
    // FULL_PLAN the moment a trial's card-verification hold clears — well before any real
    // charge — so subscriptionStatus alone can't tell "paying" apart from "still in free trial".
    prisma.payment.findMany({ where: { status: 'SUCCESS' }, select: { userId: true }, distinct: ['userId'] }),
    // Every successful payment's date, per user — not just distinct userIds (a renewing
    // subscriber has several) — so the users table below can offer a "purchase date" filter
    // the same way it already offers a registration-date one: pick a date, see who actually
    // paid that day.
    prisma.payment.findMany({ where: { status: 'SUCCESS' }, select: { userId: true, createdAt: true } }),
    // Lifetime revenue from EVERY promo-code buyer combined, across all codes — separate
    // from the single-code `promoRevenue` query below (which only runs once a specific code
    // is selected in the filter dropdown).
    prisma.payment.aggregate({
      where: { status: 'SUCCESS', user: { promoCodeId: { not: null } } },
      _sum: { grossAmount: true, netAmount: true },
      _count: true,
    }),
    // Lifetime gross/net, every SUCCESS payment ever — used only for the real blended BOG
    // commission rate (netRate below), which the net MRR/ARR cards apply. The full
    // gross/commission/net revenue breakdown itself now lives on the Analytics page only,
    // per the owner's request not to show the same money figures on two different pages.
    prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { grossAmount: true, netAmount: true },
    }),
  ]);
  const paidUserIds = new Set(successfulPayers.map((p) => p.userId));

  // Per-user list of the calendar dates (UTC, same convention as the registration-date
  // filter below) they actually had a successful payment on — a subscriber who's renewed a
  // few times has several. Feeds the users table's "purchase date" filter/column.
  const purchaseDatesByUser = new Map<string, string[]>();
  for (const p of allSuccessPaymentDates) {
    const day = p.createdAt.toISOString().slice(0, 10);
    const existing = purchaseDatesByUser.get(p.userId);
    if (existing) { if (!existing.includes(day)) existing.push(day); }
    else purchaseDatesByUser.set(p.userId, [day]);
  }

  // Total real revenue a specific promo code has brought in — a dedicated, unbounded query.
  // Only queried when a promo filter is actually active, so this doesn't run on every
  // normal page load.
  const promoRevenue = activePromo
    ? await prisma.payment.aggregate({
        where: { status: 'SUCCESS', user: { promoCodeId: activePromo } },
        _sum: { grossAmount: true },
        _count: true,
      })
    : null;

  const total = users.length;
  const recipePlan = users.filter((u) => u.subscriptionStatus === 'RECIPE_PLAN').length;
  const fullPlan = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN').length;
  const blocked = users.filter((u) => u.isBlocked).length;
  // Real current packages — replaces the old Recipe/Full split on the stat cards below,
  // since Recipe Plan is no longer sold (0 active subscribers) and "Full Plan" alone no
  // longer says which of the three real prices a subscriber is actually on. Excludes
  // anyone who's already canceled (still FULL_PLAN until their paid period ends, but
  // won't renew) — they shouldn't count as a subscriber still going forward.
  // Also requires paidUserIds — otherwise someone still mid-trial (card verified, not
  // charged yet) already reads as a real "1/3/6-month subscriber" here, the moment the
  // BOG webhook flips their subscriptionStatus to FULL_PLAN on trial start.
  // !paymentFailedAt excludes anyone currently locked out over a declined renewal —
  // subscriptionStatus deliberately stays FULL_PLAN for them (see paymentFailedAt's
  // definition in schema.prisma) so the daily cron keeps retrying, but that means they'd
  // otherwise still read as an active paying subscriber here even though they're blocked
  // and not actually being charged right now. They move to the "⚠️ გადახდა ვერ ჩამოეჭრა"
  // card instead — this is what pulls them out of wherever they used to be counted.
  const byInterval1 = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 1 && !u.subscriptionCanceledAt && !u.paymentFailedAt && paidUserIds.has(u.id)).length;
  const byInterval3 = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 3 && !u.subscriptionCanceledAt && !u.paymentFailedAt && paidUserIds.has(u.id)).length;
  const byInterval6 = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 6 && !u.subscriptionCanceledAt && !u.paymentFailedAt && paidUserIds.has(u.id)).length;
  // Of those same subscribers, how many are on a linked promo code (i.e. paying a
  // discounted rate on this tier, not the sticker price the card header quotes) — shown
  // as a sub-line on each interval card below so a "17₾" card doesn't silently include
  // people who are actually paying less than that.
  const byInterval1Promo = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 1 && !u.subscriptionCanceledAt && !u.paymentFailedAt && paidUserIds.has(u.id) && u.promoCode).length;
  const byInterval3Promo = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 3 && !u.subscriptionCanceledAt && !u.paymentFailedAt && paidUserIds.has(u.id) && u.promoCode).length;
  const byInterval6Promo = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 6 && !u.subscriptionCanceledAt && !u.paymentFailedAt && paidUserIds.has(u.id) && u.promoCode).length;
  // Every currently-paying promo-code subscriber, combined across all three tiers — one
  // number that answers "რამდენმა იყიდა პრომოკოდით" at a glance, without adding up the
  // three sub-lines above by hand.
  const promoPayingTotal = byInterval1Promo + byInterval3Promo + byInterval6Promo;
  // Signed up for a paid tier and currently mid-trial — not yet counted above, and not
  // counted toward MRR below, since they haven't paid a single lari yet and some will
  // cancel before their trial ever converts to a real charge. !paymentFailedAt matters
  // here too: if the trial's very first real charge is declined, paymentFailedAt gets set
  // but paidUserIds never gains them (no SUCCESS payment exists) — without excluding them
  // here they'd stay stuck showing as "still on trial" forever instead of moving to the
  // payment-failed card.
  const isTrialing = (u: (typeof users)[number]) =>
    !u.isGifted && !u.subscriptionCanceledAt && !u.paymentFailedAt &&
    (u.subscriptionStatus === 'FULL_PLAN' || u.subscriptionStatus === 'RECIPE_PLAN') &&
    !paidUserIds.has(u.id);
  // Broken out by which tier they picked — a single lumped "17 on trial" number can't tell
  // you how much of that will convert into 17₾/month vs 59₾/month once they actually pay.
  // Non-promo breakdown (2026-09-13 trial retirement): the free trial is retired for
  // everyone except promo-code signups going forward, so every account still on a
  // non-promo trial right now is a leftover from before that change, phasing itself out on
  // its own (converts or fails). Kept as its own visible line — not folded away — until
  // that leftover bucket actually reaches zero (owner explicitly asked to keep watching it
  // resolve first); remove trialInterval1/3/6 and their sub-line once it does.
  const trialInterval1 = users.filter((u) => isTrialing(u) && u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 1 && !u.promoCode).length;
  const trialInterval3 = users.filter((u) => isTrialing(u) && u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 3 && !u.promoCode).length;
  const trialInterval6 = users.filter((u) => isTrialing(u) && u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 6 && !u.promoCode).length;
  const trialInterval1Promo = users.filter((u) => isTrialing(u) && u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 1 && u.promoCode).length;
  const trialInterval3Promo = users.filter((u) => isTrialing(u) && u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 3 && u.promoCode).length;
  const trialInterval6Promo = users.filter((u) => isTrialing(u) && u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 6 && u.promoCode).length;
  const trialingCount = users.filter(isTrialing).length;
  const canceledPendingCount = users.filter(
    (u) => u.subscriptionCanceledAt && (u.subscriptionStatus === 'FULL_PLAN' || u.subscriptionStatus === 'RECIPE_PLAN')
  ).length;

  // Gifted subscriptions (have sub but paid nothing)
  const giftedPaying = users.filter(
    (u) => u.isGifted && (u.subscriptionStatus === 'RECIPE_PLAN' || u.subscriptionStatus === 'FULL_PLAN')
  );
  const giftedCount = giftedPaying.length;
  const giftedValue = giftedPaying.reduce((sum, u) => sum + monthlyPriceFor(u), 0);

  // Currently locked out of dashboard content because their last renewal charge was
  // declined (see DashboardClient's isFullPlan / the BOG webhook's paymentFailedAt) — the
  // daily cron keeps retrying automatically, this is just who's blocked right now.
  const paymentFailedCount = users.filter((u) => !!u.paymentFailedAt).length;

  // Revenue — gifted users excluded (they bring no cash). MRR is normalized per-month:
  // a 39₾/3-month subscriber contributes 13₾ to MRR, not the full 39₾, since a 3- or
  // 6-month tier is not itself a monthly charge. Also excludes anyone who's already
  // canceled (still FULL_PLAN/RECIPE_PLAN until their paid period ends, but won't renew)
  // — matches admin/analytics' MRR convention and the byInterval1/3/6 cards above, so MRR
  // drops the moment someone cancels instead of only once their period actually expires.
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  // paidUserIds excludes anyone still mid-trial (see byInterval1/3/6 above) — this is what
  // keeps MRR from counting revenue that hasn't actually landed yet, and might not.
  // !paymentFailedAt excludes anyone currently blocked over a declined renewal — no money
  // is actually coming in from them right now, so they shouldn't inflate MRR either.
  const realRecipe = users.filter((u) => !u.isGifted && !u.subscriptionCanceledAt && !u.paymentFailedAt && u.subscriptionStatus === 'RECIPE_PLAN' && paidUserIds.has(u.id)).length;
  const realFull   = users.filter((u) => !u.isGifted && !u.subscriptionCanceledAt && !u.paymentFailedAt && u.subscriptionStatus === 'FULL_PLAN' && paidUserIds.has(u.id)).length;
  const realPaying = users.filter((u) => !u.isGifted && !u.subscriptionCanceledAt && !u.paymentFailedAt && (u.subscriptionStatus === 'RECIPE_PLAN' || u.subscriptionStatus === 'FULL_PLAN') && paidUserIds.has(u.id));
  const mrr = Math.round(realPaying.reduce((sum, u) => sum + monthlyPriceFor(u), 0));
  const payingUsers = realRecipe + realFull;
  const arpu = payingUsers > 0 ? Math.round(mrr / payingUsers) : 0;
  const newMrr = Math.round(users
    .filter((u) =>
      !u.isGifted &&
      !u.paymentFailedAt &&
      u.subscriptionStartedAt &&
      new Date(u.subscriptionStartedAt) > thirtyDaysAgo &&
      (u.subscriptionStatus === 'RECIPE_PLAN' || u.subscriptionStatus === 'FULL_PLAN') &&
      paidUserIds.has(u.id)
    )
    .reduce((sum, u) => sum + monthlyPriceFor(u), 0));

  // All-time gross/net (unbounded, every SUCCESS payment ever) — used only to derive the
  // real blended BOG commission rate below (netRate). The visible gross/commission/net
  // revenue cards now live on the Analytics page only, per the owner's request not to show
  // the same money figures on two different admin pages.
  const allTimeTotals = {
    gross: allTimeRevenueAgg._sum.grossAmount ?? 0,
    net: allTimeRevenueAgg._sum.netAmount ?? 0,
  };
  // Net MRR/ARR — what actually lands on the card after BOG's commission, not just the
  // sticker-price recurring total. There's no way to know each individual subscriber's
  // exact card type (local 2% vs. Amex 3.5%) from subscriptionStatus alone, so this applies
  // the REAL blended commission rate observed across every actual payment so far
  // (allTimeTotals.net / allTimeTotals.gross) — more accurate than assuming a flat 2%, and
  // it self-corrects as more payments come in with whatever the real card-type mix is.
  // Falls back to a flat 2% (the local-card rate) only before any real payment exists yet.
  const netRate = allTimeTotals.gross > 0 ? allTimeTotals.net / allTimeTotals.gross : 0.98;
  const netMrr = Math.round(mrr * netRate * 100) / 100;
  // Built from the real, currently-configured prices rather than lib/adminI18n's static
  // strings, which hardcode stale numbers (e.g. "30₾") that drift as soon as pricing changes.
  const recipePlanLabel = `${RECIPE_PRICE}₾ ${locale === 'ka' ? 'რეცეპტები' : 'Recipe'}`;
  // No single price anymore — a FULL_PLAN user might be on any of the three tiers
  // (17/39/59₾), so this stat-card header can't quote one number the way it used to.
  const fullPlanLabel = locale === 'ka' ? 'სრული პაკეტი (ყველა ვადა)' : 'Full Package (any tier)';

  // Per-user plan label for the users table — interval-aware, since 'FULL_PLAN' alone no
  // longer implies a single price the way it did with the old two-tier model.
  const subLabelFor = (u: { subscriptionStatus: string; billingIntervalMonths?: number | null }) => {
    if (u.subscriptionStatus === 'FREE') return locale === 'ka' ? 'უფასო' : 'Free';
    if (u.subscriptionStatus === 'CANCELED') return locale === 'ka' ? 'გაუქმებული' : 'Canceled';
    if (u.subscriptionStatus === 'RECIPE_PLAN') return recipePlanLabel;
    if (u.subscriptionStatus === 'FULL_PLAN') {
      const interval = u.billingIntervalMonths as BillingInterval | undefined;
      const price = interval ? INTERVAL_PRICE[interval] : FULL_PRICE;
      return interval ? `${price}₾ / ${interval}${locale === 'ka' ? 'თვ' : 'mo'}` : fullPlanLabel;
    }
    return u.subscriptionStatus;
  };

  // Filter logic — promo1/promo3/promo6 mirror byInterval1Promo/3Promo/6Promo exactly
  // (currently paying, not canceled, not blocked on a failed charge, promo-linked) so the
  // count on each tab button always matches the list it opens into.
  const promoTierFilter = (interval: BillingInterval) => (u: (typeof users)[number]) =>
    u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === interval &&
    !u.subscriptionCanceledAt && !u.paymentFailedAt && paidUserIds.has(u.id) && !!u.promoCode;
  let filteredUsers = users;
  if (activeTab === 'promo1') filteredUsers = filteredUsers.filter(promoTierFilter(1));
  else if (activeTab === 'promo3') filteredUsers = filteredUsers.filter(promoTierFilter(3));
  else if (activeTab === 'promo6') filteredUsers = filteredUsers.filter(promoTierFilter(6));
  else if (activeTab === 'gifted') filteredUsers = filteredUsers.filter((u) => u.isGifted && (u.subscriptionStatus === 'RECIPE_PLAN' || u.subscriptionStatus === 'FULL_PLAN'));
  else if (activeTab === 'paymentFailed') filteredUsers = filteredUsers.filter((u) => !!u.paymentFailedAt);
  if (activePromo) filteredUsers = filteredUsers.filter((u) => u.promoCode?.id === activePromo);

  const counts = {
    all: total,
    promo1: byInterval1Promo, promo3: byInterval3Promo, promo6: byInterval6Promo,
    gifted: giftedCount, paymentFailed: paymentFailedCount,
  };

  // "Due by date" — anyone whose next charge (a trial converting to its first real payment,
  // or an ordinary renewal — both live in the same subscriptionRenewsAt field, see the BOG
  // webhook) is still ahead of them, on ANY date — not just today — so admin can pick a
  // date (e.g. "the 3rd") from a dropdown of the actual upcoming dates and see who's due
  // then, the same "select an actual date from the data" pattern as the registration/
  // purchase date filters on the users table below (DueByDateList does the date-dropdown
  // + filtering client-side; this just prepares the full list once). Gifted subscriptions
  // never go through BOG (no real charge happens), so they're excluded here even though
  // isGifted's own subscriptionRenewsAt is used elsewhere to auto-expire them.
  const upcomingDueUsers = users
    .filter((u) =>
      !u.isGifted &&
      !u.subscriptionCanceledAt &&
      (u.subscriptionStatus === 'FULL_PLAN' || u.subscriptionStatus === 'RECIPE_PLAN') &&
      u.subscriptionRenewsAt
    )
    .map((u) => ({
      ...u,
      // Hasn't ever completed a real payment yet — this charge is their trial converting
      // to its first real one, not a routine renewal.
      isFirstCharge: !paidUserIds.has(u.id),
      planLabel: subLabelFor(u),
      amount: priceFor(u),
    }))
    .sort((a, b) => new Date(a.subscriptionRenewsAt!).getTime() - new Date(b.subscriptionRenewsAt!).getTime());
  // Tbilisi-local YYYY-MM-DD for "today", so DueByDateList can default its dropdown to
  // today's date (when someone actually has a charge due then) instead of always the
  // earliest upcoming one.
  const todayKey = todayStart.toLocaleDateString('en-CA', { timeZone: 'Asia/Tbilisi' });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl font-black text-[#465940]">{d.userStatsTitle}</h1>
        <p className="text-[#465940]/60 text-sm mt-1">{total} {d.totalRegistered}</p>
      </div>

      {/* Stat cards — current packages only (1/3/6 month); Recipe Plan is no longer
          sold and always sits at 0, so it no longer earns a card here. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
        {[
          { label: d.totalUsers, value: total, color: 'text-[#465940]', bg: 'bg-[#465940]/5' },
          {
            label: `1 თვე (${INTERVAL_PRICE[1]}₾)`, value: byInterval1, color: 'text-[#465940]', bg: 'bg-[#FDFBF0]/10',
            sub: byInterval1Promo > 0 ? `მათგან ${byInterval1Promo} პრომოკოდით` : undefined,
          },
          {
            label: `3 თვე (${INTERVAL_PRICE[3]}₾)`, value: byInterval3, color: 'text-[#465940]', bg: 'bg-[#FDFBF0]/10',
            sub: byInterval3Promo > 0 ? `მათგან ${byInterval3Promo} პრომოკოდით` : undefined,
          },
          {
            label: `6 თვე (${INTERVAL_PRICE[6]}₾)`, value: byInterval6, color: 'text-[#465940]', bg: 'bg-[#FDFBF0]/10',
            sub: byInterval6Promo > 0 ? `მათგან ${byInterval6Promo} პრომოკოდით` : undefined,
          },
          {
            // Two sub-lines while the pre-2026-09-13 non-promo trials still exist: the
            // top one is the leftover bucket that's phasing itself out (converts or fails,
            // never refilled since new signups can no longer get a non-promo trial), the
            // second is the ongoing promo-code trial breakdown. Drop the first sub-line
            // (and trialInterval1/3/6 above) once the leftover bucket reaches zero.
            label: 'ტრიალზე (ჯერ არ გადაუხდია)', value: trialingCount, color: 'text-amber-600', bg: 'bg-amber-50',
            sub: [
              `ჩვეულებრივი (ძველი): ${trialInterval1}×1თვე · ${trialInterval3}×3თვე · ${trialInterval6}×6თვე`,
              `პრომოკოდით: ${trialInterval1Promo}×1თვე · ${trialInterval3Promo}×3თვე · ${trialInterval6Promo}×6თვე`,
            ],
          },
          { label: 'გაუქმებული (მალე)', value: canceledPendingCount, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: '⚠️ გადახდა ვერ ჩამოეჭრა', value: paymentFailedCount, color: 'text-red-600', bg: 'bg-red-50' },
          { label: d.blocked, value: blocked, color: 'text-[#FDFBF0]', bg: 'bg-[#465940]' },
          {
            label: '🏷 სულ პრომოკოდით (გადამხდელი)', value: promoPayingTotal, color: 'text-[#465940]', bg: 'bg-[#FDFBF0]/10',
            sub: [
              `${byInterval1Promo}×1თვე · ${byInterval3Promo}×3თვე · ${byInterval6Promo}×6თვე`,
              `ჩარიცხული: ${(promoRevenueTotal._sum.grossAmount ?? 0).toFixed(2)}₾ (${promoRevenueTotal._count} გადახდა)`,
            ],
          },
        ].map((s) => (
          <div key={s.label} className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm">
            <div className={`inline-block px-2 py-0.5 rounded-lg ${s.bg} mb-3`}>
              <p className={`text-xs font-semibold ${s.color}`}>{s.label}</p>
            </div>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            {'sub' in s && s.sub && (
              Array.isArray(s.sub)
                ? s.sub.map((line, i) => <p key={i} className="text-[10px] text-[#465940]/50 mt-1">{line}</p>)
                : <p className="text-[10px] text-[#465940]/50 mt-1">{s.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
        <div className="bg-[#465940] rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-[#FDFBF0]/70 mb-3">MRR (ყოველთვიური, საკომისიოს გამოკლებით)</p>
          <p className="text-3xl font-black text-[#FDFBF0]">~{netMrr.toFixed(2)}₾</p>
          <p className="text-[10px] text-[#FDFBF0]/50 mt-1">{payingUsers} გადამხდელი · გაჩუქ./ტრიალი გამოკლ.</p>
          <p className="text-[10px] text-[#FDFBF0]/50 mt-1">საკომისიოს ჩამოჭრამდე: {mrr}₾</p>
        </div>
        <div className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm">
          <p className="text-xs font-semibold text-[#465940] mb-3">ARR (წლიური, საკომისიოს გამოკლებით)</p>
          <p className="text-3xl font-black text-[#465940]">~{(netMrr * 12).toFixed(2)}₾</p>
          <p className="text-[10px] text-[#465940]/50 mt-1">წმინდა MRR × 12</p>
          <p className="text-[10px] text-[#465940]/50 mt-1">საკომისიოს ჩამოჭრამდე: {mrr * 12}₾</p>
        </div>
        <div className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm">
          <p className="text-xs font-semibold text-[#465940] mb-3">ახალი MRR (30 დღე)</p>
          <p className="text-3xl font-black text-[#465940]">{newMrr}₾</p>
          <p className="text-[10px] text-[#465940]/50 mt-1">გაჩუქებული არ შედის</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-700 mb-3">🎁 გაჩუქებული</p>
          <p className="text-3xl font-black text-amber-600">{giftedCount}</p>
          <p className="text-[10px] text-amber-500 mt-1">{giftedValue}₾/თვე · MRR-ში არ ითვლება</p>
        </div>
      </div>

      {/* The gross/commission/net BOG revenue breakdown and the payments transactions table
          used to live here — removed per the owner's request: those money figures now live
          only on the Analytics page, so the same numbers aren't shown twice across two
          different admin pages. */}

      {/* Due-by-date list — trial conversions and renewals expected to charge, with a date
          dropdown so admin isn't limited to only seeing today's queue, between the
          transactions table above and the full users list below. */}
      <DueByDateList users={upcomingDueUsers as any} todayKey={todayKey} />

      <UsersFilterBar
        counts={counts}
        promoCodes={promoCodes as any}
        activeTab={activeTab}
        activePromo={activePromo}
        locale={locale}
      />

      {activePromo && promoRevenue && (
        <div className="mb-6 -mt-2 bg-[#465940] rounded-2xl p-5 shadow-sm flex flex-wrap items-center gap-x-8 gap-y-2">
          <div>
            <p className="text-xs font-semibold text-[#FDFBF0]/70 mb-1">
              "{promoCodes.find((p) => p.id === activePromo)?.code ?? ''}" კოდით — შემოსავალი
            </p>
            <p className="text-2xl font-black text-[#FDFBF0]">{(promoRevenue._sum.grossAmount ?? 0).toFixed(2)}₾</p>
          </div>
          <p className="text-xs text-[#FDFBF0]/60">{promoRevenue._count} წარმატებული გადახდა (ტრიალის დაბრუნებადი თანხის გარეშე)</p>
        </div>
      )}

      {/* Table — planLabel/promoPrice are pre-computed here (server-side, env-configured
          prices) since functions like subLabelFor/priceFor can't be passed as props into
          the client component below. */}
      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
        <UsersSearchTable
          users={filteredUsers.map((u) => ({
            ...u,
            planLabel: subLabelFor(u),
            promoPrice: priceFor(u),
            purchaseDates: purchaseDatesByUser.get(u.id) ?? [],
          }))}
          locale={locale}
          intervalPrices={INTERVAL_PRICE}
        />
      </div>
    </div>
  );
}
