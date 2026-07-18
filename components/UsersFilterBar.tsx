'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type PromoCode = { id: string; code: string; planType: string };

const TABS = [
  { key: 'all', label: 'ყველა' },
  { key: 'promo15', label: '15₾ პრომო' },
  { key: 'promo30', label: '30₾ პრომო' },
  { key: 'gifted', label: '🎁 გაჩუქებული' },
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
                ? 'bg-[#465940] text-[#FDFBF0]'
                : 'bg-[#FDFBF0] border border-[#465940]/20 text-[#465940]/70 hover:bg-[#465940] hover:border-[#465940] hover:text-[#FDFBF0]'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-[#FDFBF0]/20' : 'bg-[#465940]/10'}`}>
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
          className="border border-[#465940]/20 rounded-full px-4 py-2 text-sm font-semibold text-[#465940]/80 focus:outline-none focus:border-[#465940] bg-[#FDFBF0] cursor-pointer"
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
