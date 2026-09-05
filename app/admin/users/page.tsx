import { prisma } from '@/lib/prisma';
import { adminDict, getAdminLocale } from '@/lib/adminI18n';
import UsersFilterBar from '@/components/UsersFilterBar';
import UsersSearchTable from '@/components/UsersSearchTable';
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

  const [users, promoCodes, payments, successfulPayers] = await Promise.all([
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
    // REFUNDED is what every trial preauthorization release is recorded as (the hold gets
    // canceled, never a real charge) — every free-trial signup creates one, which reads as
    // a worrying "refund" in this table even though no money ever moved. There is currently
    // no code path that produces REFUNDED for an actual captured-then-reversed charge, so
    // excluding the status here hides only these expected trial-start artifacts.
    prisma.payment.findMany({
      where: { status: { not: 'REFUNDED' } },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { name: true, email: true } } },
    }),
    // Who has ever actually been charged — a dedicated, unlimited query (the `payments`
    // list above is capped at the 100 most recent for the table below, so it can't be
    // trusted as a complete "has this user ever paid" source once there are more than 100
    // payments total). The BOG webhook flips subscriptionStatus to FULL_PLAN the moment a
    // trial's card-verification hold clears — well before any real charge — so
    // subscriptionStatus alone can't tell "paying" apart from "still in free trial".
    prisma.payment.findMany({ where: { status: 'SUCCESS' }, select: { userId: true }, distinct: ['userId'] }),
  ]);
  const paidUserIds = new Set(successfulPayers.map((p) => p.userId));

  // Total real revenue a specific promo code has brought in — a dedicated query, not
  // derived from the `payments` list above, since that one is capped at the 100 most
  // recent and would silently undercount an older/heavily-used code. Only queried when a
  // promo filter is actually active, so this doesn't run on every normal page load.
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
  // Broken out by which tier they picked (same as byInterval1/3/6, just the trial side of
  // that same split) — a single lumped "17 on trial" number can't tell you how much of
  // that will convert into 17₾/month vs 59₾/month once they actually pay.
  const trialInterval1 = users.filter((u) => isTrialing(u) && u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 1).length;
  const trialInterval3 = users.filter((u) => isTrialing(u) && u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 3).length;
  const trialInterval6 = users.filter((u) => isTrialing(u) && u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 6).length;
  const trialingCount = users.filter(isTrialing).length;
  const canceledPendingCount = users.filter(
    (u) => u.subscriptionCanceledAt && (u.subscriptionStatus === 'FULL_PLAN' || u.subscriptionStatus === 'RECIPE_PLAN')
  ).length;
  const promoRecipe = users.filter((u) => u.promoCode?.planType === 'RECIPE_PLAN' && u.subscriptionStatus === 'RECIPE_PLAN').length;
  const promoFull = users.filter((u) => u.promoCode?.planType === 'FULL_PLAN' && u.subscriptionStatus === 'FULL_PLAN').length;

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

  // BOG payment revenue (gross / commission / net) — separate from the MRR cards
  // above, which are derived from subscriptionStatus, not actual charged amounts.
  const successfulPayments = payments.filter((p) => p.status === 'SUCCESS');
  const paymentsThisMonth = successfulPayments.filter((p) => new Date(p.createdAt) > thirtyDaysAgo);
  const sum = (arr: typeof payments, field: 'grossAmount' | 'commissionAmount' | 'netAmount') =>
    arr.reduce((s, p) => s + (p[field] ?? 0), 0);
  const revenueTotals = {
    gross: sum(paymentsThisMonth, 'grossAmount'),
    commission: sum(paymentsThisMonth, 'commissionAmount'),
    net: sum(paymentsThisMonth, 'netAmount'),
  };
  // Payment-record plan label — uses the payment's OWN stored amount/interval rather than a
  // static lookup, since every current-tier payment has plan='FULL_PLAN' regardless of which
  // of the three real prices (17/39/59₾) was actually charged.
  const planLabelFor = (p: { plan: string; grossAmount: number; billingIntervalMonths?: number | null }) =>
    p.plan === 'FULL_PLAN' && p.billingIntervalMonths
      ? `${p.grossAmount}₾ / ${p.billingIntervalMonths}${locale === 'ka' ? 'თვ' : 'mo'}`
      : `${p.grossAmount}₾`;
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

  // Filter logic
  let filteredUsers = users;
  if (activeTab === 'promo15') filteredUsers = filteredUsers.filter((u) => u.promoCode?.planType === 'RECIPE_PLAN' && u.subscriptionStatus === 'RECIPE_PLAN');
  else if (activeTab === 'promo30') filteredUsers = filteredUsers.filter((u) => u.promoCode?.planType === 'FULL_PLAN' && u.subscriptionStatus === 'FULL_PLAN');
  else if (activeTab === 'gifted') filteredUsers = filteredUsers.filter((u) => u.isGifted && (u.subscriptionStatus === 'RECIPE_PLAN' || u.subscriptionStatus === 'FULL_PLAN'));
  else if (activeTab === 'paymentFailed') filteredUsers = filteredUsers.filter((u) => !!u.paymentFailedAt);
  if (activePromo) filteredUsers = filteredUsers.filter((u) => u.promoCode?.id === activePromo);

  const counts = { all: total, promo15: promoRecipe, promo30: promoFull, gifted: giftedCount, paymentFailed: paymentFailedCount };

  // "Due today" — anyone whose next charge (a trial converting to its first real payment,
  // or an ordinary renewal — both live in the same subscriptionRenewsAt field, see the BOG
  // webhook) falls on today's calendar date, so admin can see today's queue at a glance
  // instead of waiting for the 4-hourly cron to work through it and reading results after
  // the fact from the transactions table above. Gifted subscriptions never go through BOG
  // (no real charge happens), so they're excluded here even though isGifted's own
  // subscriptionRenewsAt is used elsewhere to auto-expire them.
  //
  // "Today" must mean today in Tbilisi (the admin's own timezone), not the server's —
  // Vercel functions run in UTC, so new Date().setHours(0,0,0,0) would compute UTC
  // midnight, silently shifting the whole window 4 hours from what a Tbilisi reader means
  // by "today". Georgia has used a fixed UTC+4 offset (no DST) since 2017.
  const TBILISI_OFFSET_MS = 4 * 60 * 60 * 1000;
  const nowInTbilisi = new Date(Date.now() + TBILISI_OFFSET_MS);
  const todayStart = new Date(
    Date.UTC(nowInTbilisi.getUTCFullYear(), nowInTbilisi.getUTCMonth(), nowInTbilisi.getUTCDate()) - TBILISI_OFFSET_MS
  );
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const dueTodayUsers = users
    .filter((u) =>
      !u.isGifted &&
      !u.subscriptionCanceledAt &&
      (u.subscriptionStatus === 'FULL_PLAN' || u.subscriptionStatus === 'RECIPE_PLAN') &&
      u.subscriptionRenewsAt &&
      new Date(u.subscriptionRenewsAt) >= todayStart &&
      new Date(u.subscriptionRenewsAt) < todayEnd
    )
    .map((u) => ({
      ...u,
      // Hasn't ever completed a real payment yet — today's charge is their trial
      // converting to its first real one, not a routine renewal.
      isFirstCharge: !paidUserIds.has(u.id),
      planLabel: subLabelFor(u),
      amount: priceFor(u),
    }))
    .sort((a, b) => new Date(a.subscriptionRenewsAt!).getTime() - new Date(b.subscriptionRenewsAt!).getTime());

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
            label: 'ტრიალზე (ჯერ არ გადაუხდია)', value: trialingCount, color: 'text-amber-600', bg: 'bg-amber-50',
            sub: `${trialInterval1}×1თვე · ${trialInterval3}×3თვე · ${trialInterval6}×6თვე`,
          },
          { label: 'გაუქმებული (მალე)', value: canceledPendingCount, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: '⚠️ გადახდა ვერ ჩამოეჭრა', value: paymentFailedCount, color: 'text-red-600', bg: 'bg-red-50' },
          { label: d.blocked, value: blocked, color: 'text-[#FDFBF0]', bg: 'bg-[#465940]' },
        ].map((s) => (
          <div key={s.label} className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm">
            <div className={`inline-block px-2 py-0.5 rounded-lg ${s.bg} mb-3`}>
              <p className={`text-xs font-semibold ${s.color}`}>{s.label}</p>
            </div>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] text-[#465940]/50 mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
        <div className="bg-[#465940] rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-[#FDFBF0]/70 mb-3">MRR (ყოველთვიური)</p>
          <p className="text-3xl font-black text-[#FDFBF0]">{mrr}₾</p>
          <p className="text-[10px] text-[#FDFBF0]/50 mt-1">{payingUsers} გადამხდელი · გაჩუქ./ტრიალი გამოკლ.</p>
        </div>
        <div className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm">
          <p className="text-xs font-semibold text-[#465940] mb-3">ARR (წლიური)</p>
          <p className="text-3xl font-black text-[#465940]">{mrr * 12}₾</p>
          <p className="text-[10px] text-[#465940]/50 mt-1">MRR × 12</p>
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

      {/* BOG payment revenue breakdown */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl font-black text-[#465940] mb-1">გადახდების ანალიტიკა (BOG)</h2>
        <p className="text-[#465940]/60 text-sm mb-4">ბოლო 30 დღე · მხოლოდ წარმატებული გადახდები, ტრიალის დაბრუნებადი თანხის გარეშე</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div className="bg-[#465940] rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#FDFBF0]/70 mb-3">ბრუტო შემოსავალი</p>
            <p className="text-3xl font-black text-[#FDFBF0]">{revenueTotals.gross.toFixed(2)}₾</p>
            <p className="text-[10px] text-[#FDFBF0]/50 mt-1">{paymentsThisMonth.length} ტრანზაქცია</p>
          </div>
          <div className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm">
            <p className="text-xs font-semibold text-[#465940] mb-3">BOG საკომისიო</p>
            <p className="text-3xl font-black text-[#465940]">{revenueTotals.commission.toFixed(2)}₾</p>
            <p className="text-[10px] text-[#465940]/50 mt-1">2% ლოკ. / 3.5% Amex</p>
          </div>
          <div className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm">
            <p className="text-xs font-semibold text-[#465940] mb-3">წმინდა შემოსავალი</p>
            <p className="text-3xl font-black text-[#465940]">{revenueTotals.net.toFixed(2)}₾</p>
            <p className="text-[10px] text-[#465940]/50 mt-1">ბრუტო − საკომისიო</p>
          </div>
        </div>

        <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
          {payments.length === 0 ? (
            <p className="text-center py-12 text-[#465940]/60 text-sm">ჯერ არცერთი BOG გადახდა არ დაფიქსირებულა</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-[#465940]">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">თარიღი</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">მომხმარებელი</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">გეგმა</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">სტატუსი</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">ბარათი</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">ბრუტო</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">საკომისიო</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">წმინდა</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#465940]/5">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#465940]/5 transition">
                      <td className="px-6 py-4 text-sm text-[#465940]/70">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-[#465940]">{p.user.name}</p>
                        <p className="text-xs text-[#465940]/50">{p.user.email}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#465940]/70">{planLabelFor(p)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.status === 'SUCCESS' ? 'bg-[#465940]/10 text-[#465940]' :
                          p.status === 'REFUNDED' ? 'bg-amber-50 text-amber-700' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {p.status}
                        </span>
                        {p.status === 'FAILED' && (p as any).failureReason && (
                          <p className="text-[10px] text-red-500 mt-1 max-w-[180px]">{(p as any).failureReason}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#465940]/70">{p.cardType ?? '—'}</td>
                      <td className="px-4 py-4 text-sm text-[#465940]/70 text-right">{p.grossAmount.toFixed(2)}₾</td>
                      <td className="px-4 py-4 text-sm text-[#465940]/70 text-right">{p.commissionAmount != null ? `${p.commissionAmount.toFixed(2)}₾` : '—'}</td>
                      <td className="px-6 py-4 text-sm text-[#465940] font-semibold text-right">{p.netAmount != null ? `${p.netAmount.toFixed(2)}₾` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Today's due list — trial conversions and renewals expected to charge today,
          between the transactions table above and the full users list below. */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl font-black text-[#465940] mb-1">დღეს გადასახდელები</h2>
        <p className="text-[#465940]/60 text-sm mb-4">
          {dueTodayUsers.length} ადამიანს დღეს უწევს გადახდა (ტრიალის დასრულება ან გამოწერის განახლება) — {todayStart.toLocaleDateString('ka-GE', { timeZone: 'Asia/Tbilisi' })}
        </p>

        <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
          {dueTodayUsers.length === 0 ? (
            <p className="text-center py-12 text-[#465940]/60 text-sm">დღეს არავის უწევს გადახდა</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-[#465940]">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">დრო</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">მომხმარებელი</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">გეგმა</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">ტიპი</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">სტატუსი</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">თანხა</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#465940]/5">
                  {dueTodayUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#465940]/5 transition">
                      <td className="px-6 py-4 text-sm text-[#465940]/70">
                        {new Date(u.subscriptionRenewsAt!).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tbilisi' })}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-[#465940]">{u.name}</p>
                        <p className="text-xs text-[#465940]/50">{u.email}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#465940]/70">{u.planLabel}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.isFirstCharge ? 'bg-amber-50 text-amber-700' : 'bg-[#465940]/10 text-[#465940]'
                        }`}>
                          {u.isFirstCharge ? 'ტრიალის დასრულება' : 'განახლება'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {u.paymentFailedAt ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">დაბლოკილი</span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">აქტიური</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#465940] font-semibold text-right">{u.amount.toFixed(2)}₾</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
          users={filteredUsers.map((u) => ({ ...u, planLabel: subLabelFor(u), promoPrice: priceFor(u) }))}
          locale={locale}
          intervalPrices={INTERVAL_PRICE}
        />
      </div>
    </div>
  );
}
