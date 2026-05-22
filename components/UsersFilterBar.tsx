'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type PromoCode = { id: string; code: string; planType: string };

const TABS = [
  { key: 'all', label: 'ყველა' },
  { key: 'promo15', label: '15₾ პრომო' },
  { key: 'promo30', label: '30₾ პრომო' },
];

export default function UsersFilterBar({
  counts,
  promoCodes,
  activeTab,
  activePromo,
  locale,
}: {
  counts: Record<string, number>;
  promoCodes: PromoCode[];
  activeTab: string;
  activePromo: string;
  locale: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildUrl = (tab: string, promo: string) => {
    const p = new URLSearchParams();
    if (locale === 'en') p.set('lang', 'en');
    p.set('tab', tab);
    if (promo) p.set('promo', promo);
    return `${pathname}?${p.toString()}`;
  };

  const handleTabClick = (tab: string) => {
    router.push(buildUrl(tab, tab === 'all' ? '' : activePromo));
  };

  const handlePromoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(buildUrl(activeTab, e.target.value));
  };

  const visibleCodes =
    activeTab === 'promo15'
      ? promoCodes.filter((c) => c.planType === 'RECIPE_PLAN')
      : activeTab === 'promo30'
      ? promoCodes.filter((c) => c.planType === 'FULL_PLAN')
      : promoCodes;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-[#ff7f50] text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-[#ff7f50] hover:text-[#ff7f50]'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'}`}>
              {counts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Promo select */}
      {visibleCodes.length > 0 && (
        <select
          value={activePromo}
          onChange={handlePromoChange}
          className="border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-600 focus:outline-none focus:border-[#ff7f50] bg-white cursor-pointer"
        >
          <option value="">ყველა კოდი</option>
          {visibleCodes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
