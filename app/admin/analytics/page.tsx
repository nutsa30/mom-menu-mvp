import { prisma } from '@/lib/prisma';

const PRICES: Record<string, number> = { RECIPE_PLAN: 15, FULL_PLAN: 30 };

export default async function AdminAnalyticsPage() {
  const [users, planItems, recentUsers] = await Promise.all([
    prisma.user.findMany({
      select: {
        subscriptionStatus: true,
        subscriptionStartedAt: true,
        subscriptionCanceledAt: true,
        createdAt: true,
        isBlocked: true,
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
      select: { name: true, email: true, subscriptionStatus: true, createdAt: true },
    }),
  ]);

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
  const canceled = users.filter((u) => u.subscriptionStatus === 'CANCELED').length;
  const blocked = users.filter((u) => u.isBlocked).length;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newThisMonth = users.filter((u) => new Date(u.createdAt) > thirtyDaysAgo).length;
  const activeThisMonth = users.filter(
    (u) => u.subscriptionStartedAt && new Date(u.subscriptionStartedAt) > thirtyDaysAgo
  ).length;

  const conversionRate = total > 0 ? (((recipe + full) / total) * 100).toFixed(1) : '0';
  const retentionRate = newThisMonth > 0 ? ((activeThisMonth / newThisMonth) * 100).toFixed(1) : '0';

  // ─── Revenue ───────────────────────────────────────────────────────────────
  const mrr = recipe * 15 + full * 30;
  const payingUsers = recipe + full;
  const arpu = payingUsers > 0 ? Math.round(mrr / payingUsers) : 0;

  const newMrrThisMonth = users
    .filter(
      (u) =>
        u.subscriptionStartedAt &&
        new Date(u.subscriptionStartedAt) > thirtyDaysAgo &&
        (u.subscriptionStatus === 'RECIPE_PLAN' || u.subscriptionStatus === 'FULL_PLAN')
    )
    .reduce((sum, u) => sum + (PRICES[u.subscriptionStatus] ?? 0), 0);

  // Monthly new-subscription revenue for last 6 months
  const monthlyRevenue: { label: string; revenue: number; newSubs: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString('ka-GE', { month: 'short' });
    const monthUsers = users.filter((u) => {
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
      revenue: monthUsers.reduce((sum, u) => sum + (PRICES[u.subscriptionStatus] ?? 0), 0),
      newSubs: monthUsers.length,
    });
  }

  const maxMonthRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  const stats = [
    { label: 'Total users', value: total, sub: `${newThisMonth} new this month`, color: 'text-[#465940]' },
    { label: 'Free', value: free, sub: `${((free / Math.max(total, 1)) * 100).toFixed(0)}% of users`, color: 'text-[#465940]/70' },
    { label: 'Recipe plan (15₾)', value: recipe, sub: 'active', color: 'text-[#465940]' },
    { label: 'Full plan (30₾)', value: full, sub: 'active', color: 'text-[#465940]' },
    { label: 'Canceled', value: canceled, sub: 'churned', color: 'text-[#FDFBF0]' },
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
              { label: 'Recipe Plan (15₾)', count: recipe, price: 15, color: 'bg-[#465940]/60' },
              { label: 'Full Plan (30₾)', count: full, price: 30, color: 'bg-[#465940]' },
            ].map((row) => {
              const rev = row.count * row.price;
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
              const price = PRICES[u.subscriptionStatus];
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
                      {price ? `${price}₾` : u.subscriptionStatus}
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
              { label: 'Recipe 15₾', count: recipe, color: 'bg-[#465940]/50' },
              { label: 'Full 30₾', count: full, color: 'bg-[#465940]' },
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
              { count: recipe, color: 'bg-[#465940]/50' },
              { count: full, color: 'bg-[#465940]' },
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
