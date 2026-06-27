import { prisma } from '@/lib/prisma';
import { BlockUserButton, ToggleAdminButton, GiftSubscriptionButton } from '@/components/AdminUserActions';
import { adminDict, getAdminLocale, type AdminLocale } from '@/lib/adminI18n';
import UsersFilterBar from '@/components/UsersFilterBar';

const subBadge: Record<string, string> = {
  FREE: 'bg-[#465940]/10 text-[#465940]/70',
  RECIPE_PLAN: 'bg-[#FDFBF0]/10 text-[#465940]',
  FULL_PLAN: 'bg-[#465940]/20 text-[#465940]',
  CANCELED: 'bg-[#465940]/10 text-[#FDFBF0]',
};

function UserTable({ users, subLabel, locale }: { users: any[]; subLabel: Record<string, string>; locale: AdminLocale }) {
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
                  {subLabel[user.subscriptionStatus] ?? user.subscriptionStatus}
                </span>
              </td>
              <td className="px-4 py-4">
                {user.promoCode ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs bg-[#465940]/10 text-[#465940] border border-[#465940]/30 px-2 py-0.5 rounded font-bold w-fit">
                      {user.promoCode.code}
                    </span>
                    <span className="text-[10px] text-[#465940]/60">
                      {user.promoCode.planType === 'RECIPE_PLAN' ? '15₾' : '30₾'}
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl font-black text-[#465940]">{d.userStatsTitle}</h1>
        <p className="text-[#465940]/60 text-sm mt-1">{total} {d.totalRegistered}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
        {[
          { label: d.totalUsers, value: total, color: 'text-[#465940]', bg: 'bg-[#465940]/5' },
          { label: d.recipePlan, value: recipePlan, color: 'text-[#465940]', bg: 'bg-[#FDFBF0]/10' },
          { label: d.fullPlan, value: fullPlan, color: 'text-[#465940]', bg: 'bg-[#465940]/10' },
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

      <UsersFilterBar
        counts={counts}
        promoCodes={promoCodes as any}
        activeTab={activeTab}
        activePromo={activePromo}
        locale={locale}
      />

      {/* Table */}
      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
        <UserTable users={filteredUsers} subLabel={subLabel} locale={locale} />
      </div>
    </div>
  );
}
