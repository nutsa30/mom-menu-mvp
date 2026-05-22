import { prisma } from '@/lib/prisma';

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

  const total = users.length;
  const free = users.filter((u) => u.subscriptionStatus === 'FREE').length;
  const recipe = users.filter((u) => u.subscriptionStatus === 'RECIPE_PLAN').length;
  const full = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN').length;
  const canceled = users.filter((u) => u.subscriptionStatus === 'CANCELED').length;
  const blocked = users.filter((u) => u.isBlocked).length;

  const conversionRate = total > 0 ? (((recipe + full) / total) * 100).toFixed(1) : '0';

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newThisMonth = users.filter((u) => new Date(u.createdAt) > thirtyDaysAgo).length;
  const activeThisMonth = users.filter(
    (u) => u.subscriptionStartedAt && new Date(u.subscriptionStartedAt) > thirtyDaysAgo
  ).length;

  const retentionRate =
    newThisMonth > 0 ? ((activeThisMonth / newThisMonth) * 100).toFixed(1) : '0';

  const stats = [
    { label: 'Total users', value: total, sub: `${newThisMonth} new this month`, color: 'text-[#241915]' },
    { label: 'Free', value: free, sub: `${((free / Math.max(total, 1)) * 100).toFixed(0)}% of users`, color: 'text-gray-500' },
    { label: 'Recipe plan (15₾)', value: recipe, sub: 'active', color: 'text-blue-600' },
    { label: 'Full plan (30₾)', value: full, sub: 'active', color: 'text-green-600' },
    { label: 'Canceled', value: canceled, sub: 'churned', color: 'text-red-500' },
    { label: 'Blocked', value: blocked, sub: 'accounts', color: 'text-orange-500' },
    { label: 'Conversion rate', value: `${conversionRate}%`, sub: 'free → paid', color: 'text-[#ff7f50]' },
    { label: 'Retention (30d)', value: `${retentionRate}%`, sub: 'new → subscribed', color: 'text-purple-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#241915]">Analytics</h1>
        <p className="mt-1 text-sm text-[#57423b]">Overview of users, subscriptions and content</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[20px] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#57423b]">{s.label}</p>
            <p className={`mt-2 text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs text-[#bbb]">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[20px] bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-[#241915]">Top 10 meals (by plan usage)</h2>
          <div className="space-y-3">
            {planItems.map((item, i) => {
              const dish = dishMap[item.dishId];
              if (!dish) return null;
              const max = planItems[0]._count.dishId;
              const pct = Math.round((item._count.dishId / max) * 100);
              return (
                <div key={item.dishId}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#241915]">
                      {i + 1}. {dish.titleEn}
                    </span>
                    <span className="text-[#57423b]">{item._count.dishId}×</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-[#fff1ec]">
                    <div
                      className="h-1.5 rounded-full bg-[#ff7f50]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {planItems.length === 0 && (
              <p className="text-sm text-[#bbb]">No plan data yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-[20px] bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-[#241915]">Recent registrations</h2>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.email} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#241915]">{u.name}</p>
                  <p className="text-xs text-[#57423b]">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-[#fff8f6] px-2 py-0.5 text-xs font-bold text-[#ff7f50]">
                    {u.subscriptionStatus}
                  </span>
                  <p className="mt-1 text-xs text-[#bbb]">{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-bold text-[#241915]">Subscription breakdown</h2>
          <div className="flex items-center gap-4 flex-wrap">
            {[
              { label: 'Free', count: free, color: 'bg-gray-300' },
              { label: 'Recipe 15₾', count: recipe, color: 'bg-blue-400' },
              { label: 'Full 30₾', count: full, color: 'bg-green-400' },
              { label: 'Canceled', count: canceled, color: 'bg-red-300' },
            ].map((seg) => (
              <div key={seg.label} className="flex items-center gap-2 text-sm">
                <span className={`h-3 w-3 rounded-full ${seg.color}`} />
                <span className="font-semibold text-[#241915]">{seg.label}</span>
                <span className="text-[#57423b]">{seg.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex h-6 w-full overflow-hidden rounded-full">
            {[
              { count: free, color: 'bg-gray-300' },
              { count: recipe, color: 'bg-blue-400' },
              { count: full, color: 'bg-green-400' },
              { count: canceled, color: 'bg-red-300' },
            ].filter((s) => s.count > 0).map((seg, i) => (
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
