'use client';

import { useState, useMemo } from 'react';
import DeleteDishButton from './DeleteDishButton';

const TYPE_COLOR: Record<string, string> = {
  BREAKFAST: 'bg-[#465940]/20 text-[#465940]',
  LUNCH: 'bg-[#465940]/20 text-[#465940]',
  DINNER: 'bg-[#FDFBF0]/10 text-[#465940]',
  SNACK: 'bg-[#FDFBF0]/10 text-[#465940]',
};

const MEAL_LABELS: Record<string, { ka: string; en: string }> = {
  ALL:       { ka: 'ყველა',   en: 'All' },
  BREAKFAST: { ka: 'საუზმე',  en: 'Breakfast' },
  LUNCH:     { ka: 'სადილი',  en: 'Lunch' },
  DINNER:    { ka: 'ვახშამი', en: 'Dinner' },
  SNACK:     { ka: 'სნექი',   en: 'Snack' },
};

type Props = {
  dishes: any[];
  locale: string;
  labels: { view: string; meal: string; type: string; ageGroups: string; actions: string };
  ageLabel: Record<string, string>;
};

export default function DishesAdminList({ dishes, locale, labels, ageLabel }: Props) {
  const withLang = (href: string) => locale === 'en' ? `${href}?lang=en` : href;
  const [search, setSearch] = useState('');
  const [mealFilter, setMealFilter] = useState('ALL');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return dishes.filter((d) => {
      if (mealFilter !== 'ALL' && d.mealType !== mealFilter) return false;
      if (!q) return true;
      return (
        d.titleKa.toLowerCase().includes(q) ||
        d.titleEn.toLowerCase().includes(q)
      );
    });
  }, [dishes, search, mealFilter]);

  return (
    <div className="space-y-4">
      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#465940]/60" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === 'ka' ? 'კერძის ძებნა...' : 'Search dish...'}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm bg-[#FDFBF0]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.keys(MEAL_LABELS).map((key) => (
            <button
              key={key}
              onClick={() => setMealFilter(key)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap
                ${mealFilter === key
                  ? 'bg-[#465940] text-[#FDFBF0]'
                  : 'bg-[#FDFBF0] border border-[#465940]/20 text-[#465940]/80 hover:border-[#465940] hover:text-[#FDFBF0]'}`}
            >
              {MEAL_LABELS[key][locale as 'ka' | 'en'] ?? MEAL_LABELS[key].en}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#465940]/60">{filtered.length} კერძი</p>

      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-[#465940]">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#465940]/60 uppercase tracking-wide">{labels.meal}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#465940]/60 uppercase tracking-wide">{labels.type}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#465940]/60 uppercase tracking-wide">{labels.ageGroups}</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-[#465940]/60 uppercase tracking-wide">{labels.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#465940]/5">
            {filtered.map((dish) => (
              <tr key={dish.id} className="hover:bg-[#465940]/5 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#465940]/10 overflow-hidden flex-shrink-0">
                      {dish.imageUrl
                        ? <img src={dish.imageUrl} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#465940]">{locale === 'ka' ? dish.titleKa : dish.titleEn}</p>
                      <p className="text-xs text-[#465940]/60">{locale === 'ka' ? dish.titleEn : dish.titleKa}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${TYPE_COLOR[dish.mealType]}`}>
                    {MEAL_LABELS[dish.mealType]?.[locale as 'ka' | 'en'] ?? dish.mealType}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-[#465940]/70">
                  {dish.ageGroups.map((g: string) => ageLabel[g] ?? g).join(', ')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <a href={withLang(`/admin/meals/${dish.id}/view`)} className="text-[#465940]/60 hover:text-[#465940] transition text-xs font-medium">
                      {labels.view}
                    </a>
                    <a href={withLang(`/admin/meals/${dish.id}`)} className="text-[#465940]/60 hover:text-[#FDFBF0] transition">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </a>
                    <DeleteDishButton id={dish.id} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-[#465940]/60 text-sm">
                {locale === 'ka' ? 'კერძი ვერ მოიძებნა' : 'No dishes found'}
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
