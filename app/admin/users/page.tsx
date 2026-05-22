import { prisma } from '@/lib/prisma';
import { BlockUserButton, ToggleAdminButton, GiftSubscriptionButton } from '@/components/AdminUserActions';
import { adminDict, getAdminLocale, type AdminLocale } from '@/lib/adminI18n';
import UsersFilterBar from '@/components/UsersFilterBar';

const subBadge: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-500',
  RECIPE_PLAN: 'bg-blue-100 text-blue-700',
  FULL_PLAN: 'bg-green-100 text-green-700',
  CANCELED: 'bg-red-100 text-red-500',
};

function UserTable({ users, subLabel, locale }: { users: any[]; subLabel: Record<string, string>; locale: AdminLocale }) {
  if (users.length === 0) {
    return <p className="text-center py-12 text-gray-400 text-sm">მომხარებელი არ არის</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead className="bg-[#fdf6f3]">
          <tr>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">სახელი</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">გეგმა</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">პრომოკოდი</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">შვილები</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">რეგ. თარიღი</th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">მოქმედება</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map((user) => (
            <tr key={user.id} className={`hover:bg-gray-50 transition ${user.isBlocked ? 'opacity-50' : ''}`}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#ff7f50]/20 flex items-center justify-center text-[#ff7f50] font-bold text-xs flex-shrink-0">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    {user.role === 'ADMIN' && <span className="text-[10px] font-bold text-[#ff7f50]">ADMIN</span>}
                    {user.isBlocked && <span className="text-[10px] font-bold text-red-500">{locale === 'ka' ? 'დაბლოკილი' : 'BLOCKED'}</span>}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-500">{user.email}</td>
              <td className="px-4 py-4">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${subBadge[user.subscriptionStatus]}`}>
                  {subLabel[user.subscriptionStatus] ?? user.subscriptionStatus}
                </span>
              </td>
              <td className="px-4 py-4">
                {user.promoCode ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs bg-orange-50 text-[#ff7f50] border border-orange-100 px-2 py-0.5 rounded font-bold w-fit">
                      {user.promoCode.code}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {user.promoCode.planType === 'RECIPE_PLAN' ? '15₾' : '30₾'}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-300 text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-4 text-sm text-gray-500">{user._count.children}</td>
              <td className="px-4 py-4 text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2 flex-wrap">
                  <GiftSubscriptionButton userId={user.id} currentStatus={user.subscriptionStatus} isGifted={user.isGifted} />
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

  const [users, promoCodes] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        isBlocked: true, isGifted: true, subscriptionStatus: true,
        subscriptionStartedAt: true, createdAt: true,
        promoCode: { select: { id: true, code: true, planType: true } },
        _count: { select: { children: true } },
      },
    }),
    prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, code: true, planType: true } }),
  ]);

  const total = users.length;
  const recipePlan = users.filter((u) => u.subscriptionStatus === 'RECIPE_PLAN').length;
  const fullPlan = users.filter((u) => u.subscriptionStatus === 'FULL_PLAN').length;
  const blocked = users.filter((u) => u.isBlocked).length;
  const promoRecipe = users.filter((u) => u.promoCode?.planType === 'RECIPE_PLAN' && u.subscriptionStatus === 'RECIPE_PLAN').length;
  const promoFull = users.filter((u) => u.promoCode?.planType === 'FULL_PLAN' && u.subscriptionStatus === 'FULL_PLAN').length;

  const subLabel: Record<string, string> = {
    FREE: 'Free',
    RECIPE_PLAN: d.recipePlan,
    FULL_PLAN: d.fullPlan,
    CANCELED: locale === 'ka' ? 'გაუქმებული' : 'Canceled',
  };

  // Filter logic
  let filteredUsers = users;
  if (activeTab === 'promo15') filteredUsers = filteredUsers.filter((u) => u.promoCode?.planType === 'RECIPE_PLAN' && u.subscriptionStatus === 'RECIPE_PLAN');
  else if (activeTab === 'promo30') filteredUsers = filteredUsers.filter((u) => u.promoCode?.planType === 'FULL_PLAN' && u.subscriptionStatus === 'FULL_PLAN');
  if (activePromo) filteredUsers = filteredUsers.filter((u) => u.promoCode?.id === activePromo);

  const counts = { all: total, promo15: promoRecipe, promo30: promoFull };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">{d.userStatsTitle}</h1>
        <p className="text-gray-400 text-sm mt-1">{total} {d.totalRegistered}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: d.totalUsers, value: total, color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: d.recipePlan, value: recipePlan, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: d.fullPlan, value: fullPlan, color: 'text-green-700', bg: 'bg-green-50' },
          { label: d.blocked, value: blocked, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`inline-block px-2 py-0.5 rounded-lg ${s.bg} mb-3`}>
              <p className={`text-xs font-semibold ${s.color}`}>{s.label}</p>
            </div>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <UsersFilterBar
        counts={counts}
        promoCodes={promoCodes as any}
        activeTab={activeTab}
        activePromo={activePromo}
        locale={locale}
      />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <UserTable users={filteredUsers} subLabel={subLabel} locale={locale} />
      </div>
    </div>
  );
}
