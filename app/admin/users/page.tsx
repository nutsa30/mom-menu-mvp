import { prisma } from '@/lib/prisma';
import { BlockUserButton, ToggleAdminButton, GiftSubscriptionButton } from '@/components/AdminUserActions';
import { adminDict, getAdminLocale, type AdminLocale } from '@/lib/adminI18n';
import UsersFilterBar from '@/components/UsersFilterBar';
import { PLAN_AMOUNTS, PLAN_AMOUNTS_BY_INTERVAL, BillingInterval } from '@/lib/bog';

// Real, currently-charged prices (env-configured, not hardcoded) — used for every
// MRR/ARR/revenue calc below so this page never drifts from what customers actually pay.
const RECIPE_PRICE = Number(PLAN_AMOUNTS.RECIPE_PLAN ?? 15);
const FULL_PRICE = Number(PLAN_AMOUNTS.FULL_PLAN ?? 30);
const INTERVAL_PRICE: Record<BillingInterval, number> = {
  1: Number(PLAN_AMOUNTS_BY_INTERVAL[1] ?? 17),
  3: Number(PLAN_AMOUNTS_BY_INTERVAL[3] ?? 39),
  6: Number(PLAN_AMOUNTS_BY_INTERVAL[6] ?? 59),
};
// Every current tier grants subscriptionStatus='FULL_PLAN' — the real price/cadence lives
// in billingIntervalMonths, so this must be checked first or every current-tier user would
// incorrectly price at the legacy flat FULL_PRICE regardless of which tier they're actually on.
const priceFor = (user: { subscriptionStatus: string; billingIntervalMonths?: number | null }) => {
  if (user.subscriptionStatus === 'FULL_PLAN' && user.billingIntervalMonths) {
    return INTERVAL_PRICE[user.billingIntervalMonths as BillingInterval] ?? FULL_PRICE;
  }
  return user.subscriptionStatus === 'RECIPE_PLAN' ? RECIPE_PRICE : FULL_PRICE;
};
// Same price, normalized to a monthly figure — a 39₾/3-month plan contributes 13₾ to MRR,
// not the full 39₾, since MRR is inherently a per-month measure.
const monthlyPriceFor = (user: { subscriptionStatus: string; billingIntervalMonths?: number | null }) =>
  priceFor(user) / (user.billingIntervalMonths || 1);

const subBadge: Record<string, string> = {
  FREE: 'bg-[#465940]/10 text-[#465940]/70',
  RECIPE_PLAN: 'bg-[#FDFBF0]/10 text-[#465940]',
  FULL_PLAN: 'bg-[#465940]/20 text-[#465940]',
  CANCELED: 'bg-[#465940]/10 text-[#465940]/60',
};

function UserTable({ users, subLabelFor, locale }: { users: any[]; subLabelFor: (u: any) => string; locale: AdminLocale }) {
  if (users.length === 0) {
    return <p className="text-center py-12 text-[#465940]/60 text-sm">მომხარებელი არ არის</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead className="bg-[#465940]">
          <tr>
            <th className="text-left px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">სახელი</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">Email</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">გეგმა</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">პრომოკოდი</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">შვილები</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">რეგ. თარიღი</th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-[#FDFBF0]/80 uppercase tracking-wide">მოქმედება</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#465940]/5">
          {users.map((user) => (
            <tr key={user.id} className={`hover:bg-[#465940]/5 transition ${user.isBlocked ? 'opacity-50' : ''}`}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#465940]/20 flex items-center justify-center text-[#465940] font-bold text-xs flex-shrink-0">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#465940]">{user.name}</p>
                    {user.role === 'ADMIN' && <span className="text-[10px] font-bold text-[#FDFBF0] bg-[#465940] px-1.5 py-0.5 rounded">ADMIN</span>}
                    {user.isBlocked && <span className="text-[10px] font-bold text-[#FDFBF0]">{locale === 'ka' ? 'დაბლოკილი' : 'BLOCKED'}</span>}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-[#465940]/70">{user.email}</td>
              <td className="px-4 py-4">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${subBadge[user.subscriptionStatus]}`}>
                  {subLabelFor(user)}
                </span>
              </td>
              <td className="px-4 py-4">
                {user.promoCode ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs bg-[#465940]/10 text-[#465940] border border-[#465940]/30 px-2 py-0.5 rounded font-bold w-fit">
                      {user.promoCode.code}
                    </span>
                    <span className="text-[10px] text-[#465940]/60">
                      {priceFor(user)}₾
                    </span>
                  </div>
                ) : (
                  <span className="text-[#465940]/40 text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-4 text-sm text-[#465940]/70">{user._count.children}</td>
              <td className="px-4 py-4 text-sm text-[#465940]/60">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2 flex-wrap">
                  <GiftSubscriptionButton userId={user.id} currentStatus={user.subscriptionStatus} isGifted={user.isGifted} intervalPrices={INTERVAL_PRICE} />
                  <ToggleAdminButton userId={user.id} role={user.role} locale={locale} />
                  <BlockUserButton userId={user.id} isBlocked={user.isBlocked} locale={locale} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { lang?: string; tab?: string; promo?: string };
}) {
  const locale = getAdminLocale(searchParams.lang);
  const d = adminDict[locale];
  const activeTab = searchParams.tab ?? 'all';
  const activePromo = searchParams.promo ?? '';

  const [users, promoCodes, payments] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        isBlocked: true, isGifted: true, subscriptionStatus: true, billingIntervalMonths: true,
        subscriptionStartedAt: true, createdAt: true,
        promoCode: { select: { id: true, code: true, planType: true } },
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
  ]);

  const total = users.length;
  const recipePlan = users.filter((u) => u.subscriptionStatus === 'RECIPE_PLAN').length;
  const fullPlan = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN').length;
  const blocked = users.filter((u) => u.isBlocked).length;
  // Real current packages — replaces the old Recipe/Full split on the stat cards below,
  // since Recipe Plan is no longer sold (0 active subscribers) and "Full Plan" alone no
  // longer says which of the three real prices a subscriber is actually on.
  const byInterval1 = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 1).length;
  const byInterval3 = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 3).length;
  const byInterval6 = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN' && u.billingIntervalMonths === 6).length;
  const promoRecipe = users.filter((u) => u.promoCode?.planType === 'RECIPE_PLAN' && u.subscriptionStatus === 'RECIPE_PLAN').length;
  const promoFull = users.filter((u) => u.promoCode?.planType === 'FULL_PLAN' && u.subscriptionStatus === 'FULL_PLAN').length;

  // Gifted subscriptions (have sub but paid nothing)
  const giftedPaying = users.filter(
    (u) => u.isGifted && (u.subscriptionStatus === 'RECIPE_PLAN' || u.subscriptionStatus === 'FULL_PLAN')
  );
  const giftedCount = giftedPaying.length;
  const giftedValue = giftedPaying.reduce((sum, u) => sum + monthlyPriceFor(u), 0);

  // Revenue — gifted users excluded (they bring no cash). MRR is normalized per-month:
  // a 39₾/3-month subscriber contributes 13₾ to MRR, not the full 39₾, since a 3- or
  // 6-month tier is not itself a monthly charge.
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const realRecipe = users.filter((u) => !u.isGifted && u.subscriptionStatus === 'RECIPE_PLAN').length;
  const realFull   = users.filter((u) => !u.isGifted && u.subscriptionStatus === 'FULL_PLAN').length;
  const realPaying = users.filter((u) => !u.isGifted && (u.subscriptionStatus === 'RECIPE_PLAN' || u.subscriptionStatus === 'FULL_PLAN'));
  const mrr = Math.round(realPaying.reduce((sum, u) => sum + monthlyPriceFor(u), 0));
  const payingUsers = realRecipe + realFull;
  const arpu = payingUsers > 0 ? Math.round(mrr / payingUsers) : 0;
  const newMrr = Math.round(users
    .filter((u) =>
      !u.isGifted &&
      u.subscriptionStartedAt &&
      new Date(u.subscriptionStartedAt) > thirtyDaysAgo &&
      (u.subscriptionStatus === 'RECIPE_PLAN' || u.subscriptionStatus === 'FULL_PLAN')
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
  if (activePromo) filteredUsers = filteredUsers.filter((u) => u.promoCode?.id === activePromo);

  const counts = { all: total, promo15: promoRecipe, promo30: promoFull, gifted: giftedCount };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl font-black text-[#465940]">{d.userStatsTitle}</h1>
        <p className="text-[#465940]/60 text-sm mt-1">{total} {d.totalRegistered}</p>
      </div>

      {/* Stat cards — current packages only (1/3/6 month); Recipe Plan is no longer
          sold and always sits at 0, so it no longer earns a card here. */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 lg:mb-8">
        {[
          { label: d.totalUsers, value: total, color: 'text-[#465940]', bg: 'bg-[#465940]/5' },
          { label: `1 თვე (${INTERVAL_PRICE[1]}₾)`, value: byInterval1, color: 'text-[#465940]', bg: 'bg-[#FDFBF0]/10' },
          { label: `3 თვე (${INTERVAL_PRICE[3]}₾)`, value: byInterval3, color: 'text-[#465940]', bg: 'bg-[#FDFBF0]/10' },
          { label: `6 თვე (${INTERVAL_PRICE[6]}₾)`, value: byInterval6, color: 'text-[#465940]', bg: 'bg-[#FDFBF0]/10' },
          { label: d.blocked, value: blocked, color: 'text-[#FDFBF0]', bg: 'bg-[#465940]' },
        ].map((s) => (
          <div key={s.label} className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#465940]/10 shadow-sm">
            <div className={`inline-block px-2 py-0.5 rounded-lg ${s.bg} mb-3`}>
              <p className={`text-xs font-semibold ${s.color}`}>{s.label}</p>
            </div>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
        <div className="bg-[#465940] rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-[#FDFBF0]/70 mb-3">MRR (ყოველთვიური)</p>
          <p className="text-3xl font-black text-[#FDFBF0]">{mrr}₾</p>
          <p className="text-[10px] text-[#FDFBF0]/50 mt-1">{payingUsers} გადამხდელი · გაჩუქ. გამოკლ.</p>
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

      <UsersFilterBar
        counts={counts}
        promoCodes={promoCodes as any}
        activeTab={activeTab}
        activePromo={activePromo}
        locale={locale}
      />

      {/* Table */}
      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
        <UserTable users={filteredUsers} subLabelFor={subLabelFor} locale={locale} />
      </div>
    </div>
  );
}
