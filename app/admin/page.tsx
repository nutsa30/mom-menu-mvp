import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { adminDict, getAdminLocale } from '@/lib/adminI18n';

const typeColor: Record<string, string> = {
  BREAKFAST: 'bg-orange-100 text-orange-700',
  LUNCH: 'bg-green-100 text-green-700',
  DINNER: 'bg-blue-100 text-blue-700',
  SNACK: 'bg-yellow-100 text-yellow-700',
};

export default async function AdminDashboard({ searchParams }: { searchParams: { lang?: string } }) {
  const locale = getAdminLocale(searchParams.lang);
  const d = adminDict[locale];

  const ageLabel: Record<string, string> = locale === 'ka'
    ? { FROM_6: '6თვ+', FROM_9: '9თვ+', FROM_12: '12თვ+', FROM_24: '24თვ+' }
    : { FROM_6: '6mo+', FROM_9: '9mo+', FROM_12: '12mo+', FROM_24: '24mo+' };

  const withLang = (href: string) => locale === 'en' ? `${href}?lang=en` : href;

  const session = await getSession();
  const [totalUsers, activeSubs, totalDishes, recentDishes] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionStatus: { in: ['RECIPE_PLAN', 'FULL_PLAN'] } } }),
    prisma.dish.count(),
    prisma.dish.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{d.systemOverview}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {d.welcomeBack} {session?.name ?? 'admin'}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">{session?.name ?? 'Admin'}</p>
            <p className="text-xs text-gray-400">{d.systemController}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ff7f50] flex items-center justify-center text-white font-bold text-sm">
            {(session?.name ?? 'A')[0].toUpperCase()}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { label: d.totalUsers, value: totalUsers, bg: 'bg-red-50', ic: 'text-red-400', icon: 'user' },
          { label: d.activeSubs, value: activeSubs, bg: 'bg-green-50', ic: 'text-green-500', icon: 'monitor' },
          { label: d.mealsAdded, value: totalDishes, bg: 'bg-orange-50', ic: 'text-orange-400', icon: 'send' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between mb-4">
              <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center ${s.ic}`}>
                {s.icon === 'user' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
                {s.icon === 'monitor' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
                {s.icon === 'send' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>}
              </div>
              <span className="text-xs text-gray-400">{d.allTime}</span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className="text-3xl font-black text-gray-900">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Recent Meals Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{d.recentMeals}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{d.manageMealsDesc}</p>
          </div>
          <a href={withLang('/admin/meals')} className="text-sm text-[#ff7f50] font-semibold hover:underline">{d.viewAll}</a>
        </div>
        <table className="w-full">
          <thead className="bg-[#fdf6f3]">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{d.mealTitle}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{d.type}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{d.ageGroups}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{d.status}</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{d.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentDishes.map((dish) => (
              <tr key={dish.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {dish.imageUrl
                        ? <img src={dish.imageUrl} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{locale === 'ka' ? dish.titleKa : dish.titleEn}</p>
                      <p className="text-xs text-gray-400">{locale === 'ka' ? dish.titleEn : dish.titleKa}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${typeColor[dish.mealType]}`}>
                    {dish.mealType}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {dish.ageGroups.map((g) => ageLabel[g] ?? g).join(', ')}
                </td>
                <td className="px-4 py-4">
                  <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    {d.published}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <a href={withLang(`/admin/meals/${dish.id}`)} className="text-gray-400 hover:text-[#ff7f50] transition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </a>
                </td>
              </tr>
            ))}
            {recentDishes.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                {d.noMeals} <a href={withLang('/admin/meals/new')} className="text-[#ff7f50] font-semibold hover:underline">{d.addFirst}</a>
              </td></tr>
            )}
          </tbody>
        </table>
        <div className="px-6 py-4 border-t border-gray-50 text-center">
          <a href={withLang('/admin/meals')} className="text-sm text-[#ff7f50] font-semibold hover:underline">{d.viewAllMeals}</a>
        </div>
      </div>
    </div>
  );
}
