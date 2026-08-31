import { prisma } from '@/lib/prisma';
import { PLAN_AMOUNTS, PLAN_AMOUNTS_BY_INTERVAL, BillingInterval, applyDiscount } from '@/lib/bog';

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
  billingIntervalMonths?: number | null;
  promoCode?: { discountPercent: number } | null;
};
// Every current tier grants subscriptionStatus='FULL_PLAN' — check billingIntervalMonths
// first, or every current-tier user prices at the stale flat FULL_PLAN legacy amount. A
// promo-linked account is actually charged less, permanently, on every renewal (see
// applyDiscount in lib/bog.ts) — without this, a discounted subscriber would inflate
// revenue totals by whatever their promo knocked off.
const priceFor = (u: PriceableUser) => {
  const base = u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths
    ? INTERVAL_PRICE[u.billingIntervalMonths as BillingInterval] ?? PRICES.FULL_PLAN
    : PRICES[u.subscriptionStatus] ?? 0;
  return applyDiscount(base, u.promoCode?.discountPercent);
};
// Normalized to a monthly figure for MRR purposes — a 39₾/3-month subscriber is 13₾ of MRR.
const monthlyPriceFor = (u: PriceableUser) =>
  priceFor(u) / (u.billingIntervalMonths || 1);

export default async function AdminAnalyticsPage() {
  const [users, planItems, recentUsers, successfulPayers] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
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
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { name: true, email: true, subscriptionStatus: true, billingIntervalMonths: true, createdAt: true, isGifted: true },
    }),
    // Who has ever actually been charged — the BOG webhook flips subscriptionStatus to
    // FULL_PLAN the moment a trial's card-verification hold clears, well before any real
    // money moves, so subscriptionStatus alone can't tell "committed, paying subscriber"
    // apart from "still in their free trial, might cancel before ever paying a lari".
    prisma.payment.findMany({ where: { status: 'SUCCESS' }, select: { userId: true }, distinct: ['userId'] }),
  ]);
  const paidUserIds = new Set(successfulPayers.map((p) => p.userId));

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

  // Monthly new-subscription revenue for last 6 months (full tier price at signup month,
  // not normalized to MRR — this chart reads as "cash booked that month", not run-rate).
  const monthlyRevenue: { label: string; revenue: number; newSubs: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString('ka-GE', { month: 'short' });
    const monthUsers = users.filter((u) => {
      if (u.isGifted) return false;
      if (!u.subscriptionStartedAt) return false;
      const s = new Date(u.subscriptionStartedAt);
      return (
        s.getFullYear() === year &&
        s.getMonth() === month &&
        (u.subscriptionStatus === 'RECIPE_PLAN' || u.subscriptionStatus === 'FULL_PLAN')
      );
    });
    monthlyRevenue.push({
      label,
      revenue: monthUsers.reduce((sum, u) => sum + priceFor(u), 0),
      newSubs: monthUsers.length,
    });
  }

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

  const maxMonthRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  const stats = [
    { label: 'Total users', value: total, sub: `${newThisMonth} new this month`, color: 'text-[#465940]' },
    { label: 'Free', value: free, sub: `${((free / Math.max(total, 1)) * 100).toFixed(0)}% of users`, color: 'text-[#465940]/70' },
    { label: `1 month (${INTERVAL_PRICE[1]}₾)`, value: full1, sub: 'active', color: 'text-[#465940]' },
    { label: `3 months (${INTERVAL_PRICE[3]}₾)`, value: full3, sub: 'active', color: 'text-[#465940]' },
    { label: `6 months (${INTERVAL_PRICE[6]}₾)`, value: full6, sub: 'active', color: 'text-[#465940]' },
    { label: 'ტრიალზე', value: trialingCount, sub: `${trialInterval1}×1თვე · ${trialInterval3}×3თვე · ${trialInterval6}×6თვე`, color: 'text-amber-600' },
    { label: 'Canceled', value: canceled, sub: 'churned', color: 'text-amber-600' },
    { label: 'Blocked', value: blocked, sub: 'accounts', color: 'text-[#465940]' },
    { label: 'Conversion rate', value: `${conversionRate}%`, sub: 'free → paid', color: 'text-[#465940]' },
    { label: 'Retention (30d)', value: `${retentionRate}%`, sub: 'new → subscribed', color: 'text-[#465940]' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#465940]">Analytics</h1>
        <p className="mt-1 text-sm text-[#465940]">Overview of users, subscriptions and revenue</p>
      </div>

      {/* ── Real activity ── */}
      <div className="mb-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#465940]/50 mb-3">რეალური აქტივობა</h2>
        <p className="text-[11px] text-[#465940]/50 -mt-2 mb-3">
          ეყრდნობა დეშბორდის ფაქტობრივ გახსნას (ბრაუზერშიც და ჰოუმ-სქრინიდან გახსნილ PWA-შიც) — არა გამოწერის თარიღს და არა "ჭამა" ხმებს, რომლებსაც ბევრი მშობელი უბრალოდ ტოვებს.
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
            <p className="mt-2 text-3xl font-black text-[#FDFBF0]">{mrr}₾</p>
            <p className="mt-1 text-xs text-[#FDFBF0]/50">{payingUsers} მომხმარებელი</p>
          </div>
          <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#465940]">ახალი MRR (30 დღე)</p>
            <p className="mt-2 text-3xl font-black text-[#465940]">{newMrrThisMonth}₾</p>
            <p className="mt-1 text-xs text-[#465940]/50">{activeThisMonth} ახალი გამოწერა</p>
          </div>
          <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#465940]">ARR (წლიური)</p>
            <p className="mt-2 text-3xl font-black text-[#465940]">{mrr * 12}₾</p>
            <p className="mt-1 text-xs text-[#465940]/50">MRR × 12</p>
          </div>
          <div className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#465940]">ARPU (საშ. / მომხ.)</p>
            <p className="mt-2 text-3xl font-black text-[#465940]">{arpu}₾</p>
            <p className="mt-1 text-xs text-[#465940]/50">paying users only</p>
          </div>
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

        {/* ── Revenue by plan ── */}
        <section className="rounded-[20px] bg-[#FDFBF0] p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-[#465940]">Revenue breakdown by plan</h2>
          <div className="space-y-4">
            {[
              // Recipe Plan is no longer sold — only shown if a legacy subscriber still exists,
              // so this section reflects the actual current packages otherwise.
              ...(recipe > 0 ? (() => {
                const realRecipeRows = users.filter((u) => !u.isGifted && !u.subscriptionCanceledAt && u.subscriptionStatus === 'RECIPE_PLAN' && paidUserIds.has(u.id));
                return [{ label: `Recipe Plan (${PRICES.RECIPE_PLAN}₾) — legacy`, rev: realRecipeRows.length * PRICES.RECIPE_PLAN, count: realRecipeRows.length, color: 'bg-[#465940]/40' }];
              })() : []),
              // Same canceled- and trial-exclusion as full1/full3/full6 and payingUserRows
              // above — someone who canceled hasn't paid for a next period, and someone
              // still mid-trial hasn't paid for this one yet either, so neither should count
              // toward this breakdown's revenue or account totals (this is what keeps these
              // rows summing to the same "სულ MRR" shown at the bottom, instead of a lower
              // number that leaves the admin wondering where the difference is coming from).
              ...([1, 3, 6] as BillingInterval[]).map((interval) => {
                const rows = users.filter((u) => !u.isGifted && !u.subscriptionCanceledAt && u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === interval && paidUserIds.has(u.id));
                return {
                  label: `${interval} Month (${INTERVAL_PRICE[interval]}₾)`,
                  rev: Math.round(rows.reduce((sum, u) => sum + monthlyPriceFor(u), 0)),
                  count: rows.length,
                  color: interval === 1 ? 'bg-[#465940]/60' : interval === 3 ? 'bg-[#465940]/80' : 'bg-[#465940]',
                };
              }),
            ].map((row) => {
              const rev = row.rev;
              const pct = mrr > 0 ? Math.round((rev / mrr) * 100) : 0;
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-semibold text-[#465940]">{row.label}</span>
                    <span className="font-black text-[#465940]">{rev}₾ <span className="font-normal text-[#465940]/50">({row.count} acc)</span></span>
                  </div>
                  <div className="h-3 bg-[#465940]/10 rounded-full overflow-hidden">
                    <div className={`h-3 rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-[#465940]/50 mt-0.5">{pct}% of MRR</p>
                </div>
              );
            })}
            <div className="border-t border-[#465940]/10 pt-3 flex justify-between text-sm">
              <span className="font-semibold text-[#465940]">სულ MRR</span>
              <span className="font-black text-[#465940] text-lg">{mrr}₾</span>
            </div>
          </div>
        </section>

        {/* ── Monthly new revenue chart ── */}
        <section className="rounded-[20px] bg-[#FDFBF0] p-6 shadow-sm">
          <h2 className="mb-1 font-bold text-[#465940]">ახალი შემოსავალი (6 თვე)</h2>
          <p className="text-[10px] text-[#465940]/50 mb-4">გამოწერები, რომლებიც თვეში დაიწყო</p>
          <div className="flex items-end gap-2 h-32">
            {monthlyRevenue.map((m) => {
              const pct = maxMonthRevenue > 0 ? (m.revenue / maxMonthRevenue) * 100 : 0;
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-[#465940]">
                    {m.revenue > 0 ? `${m.revenue}₾` : ''}
                  </span>
                  <div className="w-full flex items-end" style={{ height: 80 }}>
                    <div
                      className="w-full rounded-t-lg bg-[#465940] transition-all"
                      style={{ height: `${Math.max(pct, m.revenue > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#465940]/60">{m.label}</span>
                  {m.newSubs > 0 && (
                    <span className="text-[10px] text-[#465940]/40">{m.newSubs}×</span>
                  )}
                </div>
              );
            })}
          </div>
          {monthlyRevenue.every((m) => m.revenue === 0) && (
            <p className="text-center text-sm text-[#465940]/40 mt-4">ჯერ გამოწერები არ არის</p>
          )}
        </section>

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
                    {m.revenue}₾ <span className="font-normal text-[#465940]/50">({m.count} გამომწერი)</span>
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
                      {u.isGifted ? 'GIFTED' : price ? `${price}₾` : u.subscriptionStatus}
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
              ...(recipe > 0 ? [{ label: `Recipe ${PRICES.RECIPE_PLAN}₾ — legacy`, count: recipe, color: 'bg-[#465940]/35' }] : []),
              { label: `1 თვე (${INTERVAL_PRICE[1]}₾)`, count: full1, color: 'bg-[#465940]/55' },
              { label: `3 თვე (${INTERVAL_PRICE[3]}₾)`, count: full3, color: 'bg-[#465940]/75' },
              { label: `6 თვე (${INTERVAL_PRICE[6]}₾)`, count: full6, color: 'bg-[#465940]' },
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
