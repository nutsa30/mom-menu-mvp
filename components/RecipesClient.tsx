'use client';

import { useState, useEffect } from 'react';

type Dish = {
  id: string;
  titleKa: string;
  titleEn: string;
  descriptionKa: string;
  descriptionEn: string;
  imageUrl: string | null;
  mealType: string;
  ageGroups: string[];
  allergens: string[];
  ingredientsKa: string[];
  ingredientsEn: string[];
  calories: number | null;
  proteinGrams: number | null;
  carbsGrams: number | null;
  fatGrams: number | null;
  fiberGrams: number | null;
  ironMg: number | null;
  calciumMg: number | null;
  zincMg: number | null;
  potassiumMg: number | null;
  magnesiumMg: number | null;
  phosphorusMg: number | null;
  sodiumMg: number | null;
  vitaminAmcg: number | null;
  vitaminCmg: number | null;
  vitaminDmcg: number | null;
  vitaminEmg: number | null;
  vitaminKmcg: number | null;
  vitaminB6mg: number | null;
  vitaminB12mcg: number | null;
  folateMcg: number | null;
  omega3Mg: number | null;
};

type Props = {
  dishes: Dish[];
  locale: 'ka' | 'en';
  canRead: boolean;
  isLoggedIn: boolean;
};

const MEAL_TYPES = [
  { key: 'ALL',       ka: 'ყველა',    en: 'All'       },
  { key: 'BREAKFAST', ka: 'საუზმე',   en: 'Breakfast' },
  { key: 'SNACK',     ka: 'სნექი',    en: 'Snack'     },
  { key: 'LUNCH',     ka: 'სადილი',   en: 'Lunch'     },
  { key: 'DINNER',    ka: 'ვახშამი',  en: 'Dinner'    },
];

const AGE_GROUPS = [
  { key: 'ALL',     ka: 'ყველა ასაკი', en: 'All ages' },
  { key: 'FROM_6',  ka: '6თვ+',        en: '6mo+'    },
  { key: 'FROM_9',  ka: '9თვ+',        en: '9mo+'    },
  { key: 'FROM_12', ka: '12თვ+',       en: '12mo+'   },
  { key: 'FROM_24', ka: '24თვ+',       en: '24mo+'   },
];

const AGE_ORDER = ['FROM_6', 'FROM_9', 'FROM_12', 'FROM_24'];

const ALLERGEN_LABELS: Record<string, { ka: string; en: string }> = {
  dairy:      { ka: 'რძე',       en: 'Dairy'      },
  egg:        { ka: 'კვერცხი',   en: 'Egg'        },
  gluten:     { ka: 'გლუტენი',   en: 'Gluten'     },
  peanut:     { ka: 'არაქისი',   en: 'Peanut'     },
  treeNuts:   { ka: 'კაკალი',    en: 'Tree nuts'  },
  soy:        { ka: 'სოია',      en: 'Soy'        },
  fish:       { ka: 'თევზი',     en: 'Fish'       },
  shellfish:  { ka: 'კიბო',      en: 'Shellfish'  },
  molluscs:   { ka: 'მოლუსკი',   en: 'Molluscs'   },
  sesame:     { ka: 'სეზამი',    en: 'Sesame'     },
  corn:       { ka: 'სიმინდი',   en: 'Corn'       },
  tomato:     { ka: 'პომიდვრი',  en: 'Tomato'     },
  strawberry: { ka: 'მარწყვი',   en: 'Strawberry' },
  citrus:     { ka: 'ციტრუსი',   en: 'Citrus'     },
  mustard:    { ka: 'მდოგვი',    en: 'Mustard'    },
  celery:     { ka: 'ნიახური',   en: 'Celery'     },
  sulphites:  { ka: 'სულფიტი',   en: 'Sulphites'  },
  lupin:      { ka: 'ლუპინი',    en: 'Lupin'      },
};

const MEAL_TYPE_LABEL: Record<string, { ka: string; en: string }> = {
  BREAKFAST: { ka: 'საუზმე',   en: 'Breakfast' },
  LUNCH:     { ka: 'სადილი',   en: 'Lunch'     },
  DINNER:    { ka: 'ვახშამი',  en: 'Dinner'    },
  SNACK:     { ka: 'სნექი',    en: 'Snack'     },
};

const MEAL_TYPE_COLOR: Record<string, string> = {
  BREAKFAST: 'bg-[#6F7A5C]/20 text-[#6F7A5C]',
  LUNCH:     'bg-[#6F7A5C]/20 text-[#6F7A5C]',
  DINNER:    'bg-[#F5F1E4]/10 text-[#6F7A5C]',
  SNACK:     'bg-[#F5F1E4]/10 text-[#6F7A5C]',
};


function parseSteps(text: string): string[] {
  const parts = text.split(/(?=\d+\.)/).map(s => s.replace(/^\d+\./, '').trim()).filter(Boolean);
  return parts.length > 1 ? parts : [text.trim()];
}

export default function RecipesClient({ dishes, locale, canRead, isLoggedIn }: Props) {
  const [mealFilter, setMealFilter] = useState('ALL');
  const [ageFilter, setAgeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Dish | null>(null);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const PAGE_SIZE = 21;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const t = (ka: string, en: string) => locale === 'ka' ? ka : en;
  const title = (d: Dish) => locale === 'ka' ? d.titleKa : d.titleEn;
  const desc = (d: Dish) => locale === 'ka' ? d.descriptionKa : d.descriptionEn;
  const ingredients = (d: Dish) => locale === 'ka' ? d.ingredientsKa : d.ingredientsEn;

  const filtered = dishes.filter((d) => {
    if (mealFilter !== 'ALL' && d.mealType !== mealFilter) return false;
    if (ageFilter !== 'ALL') {
      const selectedIdx = AGE_ORDER.indexOf(ageFilter);
      const suitable = d.ageGroups.some((ag) => AGE_ORDER.indexOf(ag) <= selectedIdx);
      if (!suitable) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      if (!d.titleKa.toLowerCase().includes(q) && !d.titleEn.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetPage = (fn: () => void) => () => { fn(); setPage(1); };

  return (
    <main className="min-h-screen bg-[#6F7A5C]">
      {/* Header */}
      <div className="border-b border-[#F5F1E4]/10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-black text-[#F5F1E4] mb-1">
            {t('რეცეპტები', 'Recipes')}
          </h1>
          <p className="text-[#F5F1E4]/50 text-sm">
            {dishes.length} {t('კერძი ბაზაში', 'recipes in our library')}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search bar */}
        <div className="relative mb-5">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F7A5C]/60" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('კერძის ძებნა...', 'Search recipes...')}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#6F7A5C]/20 focus:outline-none focus:border-[#6F7A5C] text-sm bg-[#F5F1E4] text-[#6F7A5C] shadow-sm"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6F7A5C]/60 hover:text-[#6F7A5C]/80 transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6">
          {/* Toggle button */}
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F5F1E4] text-[#6F7A5C] text-sm font-bold border border-[#6F7A5C]/20 hover:border-[#6F7A5C] transition mb-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
            </svg>
            {t('ფილტრი', 'Filters')}
            {(mealFilter !== 'ALL' || ageFilter !== 'ALL') && (
              <span className="w-2 h-2 rounded-full bg-[#6F7A5C] inline-block" />
            )}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Collapsible content */}
          {filtersOpen && (
            <div className="flex gap-4 sm:block bg-[#F5F1E4]/5 rounded-2xl p-4">
              {/* Meal type filter */}
              <div className="flex flex-col sm:flex-row gap-2 sm:flex-wrap sm:mb-3 flex-1">
                <p className="text-[10px] text-[#F5F1E4]/50 uppercase tracking-widest font-bold mb-1 sm:hidden">{t('ტიპი', 'Type')}</p>
                {MEAL_TYPES.map((m) => (
                  <button
                    key={m.key}
                    onClick={resetPage(() => setMealFilter(m.key))}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition text-left sm:text-center ${
                      mealFilter === m.key
                        ? 'bg-[#6F7A5C] text-[#F5F1E4]'
                        : 'bg-[#F5F1E4] text-[#6F7A5C]/80 border border-[#6F7A5C]/20 hover:border-[#6F7A5C]'
                    }`}
                  >
                    {locale === 'ka' ? m.ka : m.en}
                  </button>
                ))}
              </div>

              {/* Age group filter */}
              <div className="flex flex-col sm:flex-row gap-2 sm:flex-wrap flex-1">
                <p className="text-[10px] text-[#F5F1E4]/50 uppercase tracking-widest font-bold mb-1 sm:hidden">{t('ასაკი', 'Age')}</p>
                {AGE_GROUPS.map((a) => (
                  <button
                    key={a.key}
                    onClick={resetPage(() => setAgeFilter(a.key))}
                    className={`px-3 py-2 rounded-full text-xs font-bold transition text-left sm:text-center ${
                      ageFilter === a.key
                        ? 'bg-[#6F7A5C] text-[#F5F1E4]'
                        : 'bg-[#F5F1E4] text-[#6F7A5C]/70 border border-[#6F7A5C]/20 hover:border-[#6F7A5C]/40'
                    }`}
                  >
                    {locale === 'ka' ? a.ka : a.en}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-[#F5F1E4]/60">
            <div className="text-5xl mb-4"></div>
            <p className="font-semibold">{t('კერძი ვერ მოიძებნა', 'No recipes found')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((dish) => (
              <button
                key={dish.id}
                onClick={() => setSelected(dish)}
                className="text-left rounded-2xl border border-[#F5F1E4]/20 overflow-hidden hover:border-[#F5F1E4]/40 hover:-translate-y-0.5 transition-all group"
                style={{ background: '#6F7A5C' }}
              >
                <div className="relative h-44 overflow-hidden" style={{ background: '#3a4d35' }}>
                  {dish.imageUrl ? (
                    <img src={dish.imageUrl} alt={title(dish)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl"></div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F5F1E4]/20 text-[#F5F1E4]">
                    {MEAL_TYPE_LABEL[dish.mealType]?.[locale] ?? dish.mealType}
                  </span>
                  {!canRead && (
                    <div className="absolute top-3 right-3 w-7 h-7 bg-black/40 rounded-full flex items-center justify-center">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-[#F5F1E4] text-sm leading-snug mb-1 line-clamp-2">{title(dish)}</h3>
                  {canRead && desc(dish) && (
                    <p className="text-xs text-[#F5F1E4]/65 line-clamp-2 mb-2">{desc(dish)}</p>
                  )}
                  {!canRead && (
                    <p className="text-xs text-[#F5F1E4]/50 blur-[3px] select-none mb-2 line-clamp-2">
                      {desc(dish) || 'recipe details locked for free users'}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dish.ageGroups.map((ag) => {
                      const label = locale === 'ka'
                        ? { FROM_6: '6თვ+', FROM_9: '9თვ+', FROM_12: '12თვ+', FROM_24: '24თვ+' }[ag]
                        : { FROM_6: '6mo+', FROM_9: '9mo+', FROM_12: '12mo+', FROM_24: '24mo+' }[ag];
                      return (
                        <span key={ag} className="px-2 py-0.5 bg-[#F5F1E4]/15 text-[#F5F1E4] text-[10px] font-bold rounded-full">
                          {label ?? ag}
                        </span>
                      );
                    })}
                    {dish.calories && (
                      <span className="ml-auto text-[10px] text-[#F5F1E4]/50 font-medium">{dish.calories} kcal</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (() => {
          const visible = new Set([1, totalPages, page - 1, page, page + 1]);
          const sorted = Array.from(visible).filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
          const items: (number | null)[] = [];
          for (let i = 0; i < sorted.length; i++) {
            if (i > 0 && sorted[i] - sorted[i - 1] > 1) items.push(null);
            items.push(sorted[i]);
          }
          return (
            <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
              <button onClick={() => goToPage(page - 1)} disabled={page === 1}
                className="px-4 py-2 rounded-full text-sm font-bold border border-[#6F7A5C]/20 bg-[#F5F1E4] text-[#6F7A5C]/80 hover:border-[#6F7A5C] disabled:opacity-30 disabled:cursor-not-allowed transition">←</button>
              {items.map((p, i) =>
                p === null
                  ? <span key={`e${i}`} className="w-10 text-center text-[#F5F1E4]/60 text-sm select-none">…</span>
                  : <button key={p} onClick={() => goToPage(p)}
                      className={`w-10 h-10 rounded-full text-sm font-bold transition ${
                        p === page ? 'bg-[#6F7A5C] text-[#F5F1E4] shadow' : 'bg-[#F5F1E4] border border-[#6F7A5C]/20 text-[#6F7A5C]/80 hover:border-[#6F7A5C]'
                      }`}>{p}</button>
              )}
              <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}
                className="px-4 py-2 rounded-full text-sm font-bold border border-[#6F7A5C]/20 bg-[#F5F1E4] text-[#6F7A5C]/80 hover:border-[#6F7A5C] disabled:opacity-30 disabled:cursor-not-allowed transition">→</button>
            </div>
          );
        })()}
      </div>

      {/* Recipe modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#F5F1E4] w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-52 bg-[#fdf0ea] flex-shrink-0">
              {selected.imageUrl ? (
                <img src={selected.imageUrl} alt={title(selected)} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl"></div>
              )}
              <button onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-[#F5F1E4] transition">
                ✕
              </button>
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${MEAL_TYPE_COLOR[selected.mealType]}`}>
                {MEAL_TYPE_LABEL[selected.mealType]?.[locale] ?? selected.mealType}
              </span>
            </div>

            <div className="overflow-y-auto p-6 space-y-5">
              <div>
                <h2 className="text-xl font-black text-[#6F7A5C]">{title(selected)}</h2>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selected.ageGroups.map((ag) => {
                    const label = locale === 'ka'
                      ? { FROM_6: '6თვ+', FROM_9: '9თვ+', FROM_12: '12თვ+', FROM_24: '24თვ+' }[ag]
                      : { FROM_6: '6mo+', FROM_9: '9mo+', FROM_12: '12mo+', FROM_24: '24mo+' }[ag];
                    return <span key={ag} className="px-2.5 py-0.5 bg-[#fff3ee] text-[#6F7A5C] text-xs font-bold rounded-full">{label ?? ag}</span>;
                  })}
                </div>
              </div>

              {canRead ? (
                <>
                  {desc(selected) && (
                    <div>
                      <p className="text-sm font-bold text-[#6F7A5C] mb-2">{t('მომზადების წესი', 'Preparation')}</p>
                      <ol className="space-y-1.5">
                        {parseSteps(desc(selected)).map((step, i) => (
                          <li key={i} className="flex gap-2.5 text-sm text-[#6F7A5C] leading-snug">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3ee] text-[#6F7A5C] text-[11px] font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {ingredients(selected).length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-[#6F7A5C] mb-2">{t('ინგრედიენტები', 'Ingredients')}</p>
                      <ol className="space-y-1.5">
                        {ingredients(selected).map((ing, i) => (
                          <li key={i} className="flex gap-2.5 text-sm text-[#6F7A5C] leading-snug">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#6F7A5C]/10 text-[#6F7A5C]/70 text-[11px] font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {(() => {
                    const nutrients = [
                      { v: selected.calories,     label: t('კალორია','Calories'),       unit: 'kcal', color: 'bg-[#6F7A5C]/10 text-[#6F7A5C]' },
                      { v: selected.proteinGrams, label: t('ცილა','Protein'),            unit: 'g',    color: 'bg-[#6F7A5C]/10 text-[#6F7A5C]' },
                      { v: selected.carbsGrams,   label: t('ნახშირწყალი','Carbs'),       unit: 'g',    color: 'bg-[#6F7A5C]/10 text-[#6F7A5C]' },
                      { v: selected.fatGrams,     label: t('ცხიმი','Fat'),               unit: 'g',    color: 'bg-[#6F7A5C]/10 text-[#6F7A5C]' },
                      { v: selected.fiberGrams,   label: t('ბოჭკო','Fiber'),             unit: 'g',    color: 'bg-lime-50 text-lime-600' },
                      { v: selected.ironMg,       label: t('რკინა','Iron'),              unit: 'mg',   color: 'bg-[#6F7A5C] text-[#F5F1E4]' },
                      { v: selected.calciumMg,    label: t('კალციუმი','Calcium'),        unit: 'mg',   color: 'bg-[#6F7A5C]/10 text-[#6F7A5C]' },
                      { v: selected.zincMg,       label: t('თუთია','Zinc'),              unit: 'mg',   color: 'bg-[#6F7A5C] text-[#F5F1E4]' },
                      { v: selected.potassiumMg,  label: t('კალიუმი','Potassium'),       unit: 'mg',   color: 'bg-cyan-50 text-cyan-600' },
                      { v: selected.magnesiumMg,  label: t('მაგნიუმი','Magnesium'),      unit: 'mg',   color: 'bg-sky-50 text-sky-600' },
                      { v: selected.phosphorusMg, label: t('ფოსფორი','Phosphorus'),      unit: 'mg',   color: 'bg-indigo-50 text-indigo-600' },
                      { v: selected.sodiumMg,     label: t('ნატრიუმი','Sodium'),         unit: 'mg',   color: 'bg-[#6F7A5C]/5 text-[#6F7A5C]/80' },
                      { v: selected.vitaminAmcg,  label: t('A ვიტ.','Vit A'),            unit: 'mcg',  color: 'bg-orange-50 text-orange-600' },
                      { v: selected.vitaminCmg,   label: t('C ვიტ.','Vit C'),            unit: 'mg',   color: 'bg-yellow-50 text-yellow-600' },
                      { v: selected.vitaminDmcg,  label: t('D ვიტ.','Vit D'),            unit: 'mcg',  color: 'bg-amber-50 text-amber-600' },
                      { v: selected.vitaminEmg,   label: t('E ვიტ.','Vit E'),            unit: 'mg',   color: 'bg-[#6F7A5C]/10 text-[#6F7A5C]' },
                      { v: selected.vitaminKmcg,  label: t('K ვიტ.','Vit K'),            unit: 'mcg',  color: 'bg-emerald-50 text-emerald-600' },
                      { v: selected.vitaminB6mg,  label: t('B6 ვიტ.','Vit B6'),          unit: 'mg',   color: 'bg-violet-50 text-violet-600' },
                      { v: selected.vitaminB12mcg,label: t('B12 ვიტ.','Vit B12'),        unit: 'mcg',  color: 'bg-pink-50 text-pink-600' },
                      { v: selected.folateMcg,    label: t('ფოლატი','Folate'),            unit: 'mcg',  color: 'bg-rose-50 text-rose-500' },
                      { v: selected.omega3Mg,     label: 'Omega-3',                       unit: 'mg',   color: 'bg-[#6F7A5C]/10 text-[#6F7A5C]' },
                    ].filter(n => n.v);
                    if (!nutrients.length) return null;
                    return (
                      <div>
                        <p className="text-sm font-bold text-[#6F7A5C] mb-2">{t('კვებითი ღირებულება', 'Nutrition')}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {nutrients.map(({ v, label, unit, color }) => (
                            <div key={label} className={`${color.split(' ')[0]} rounded-xl p-3 text-center`}>
                              <p className={`text-base font-black ${color.split(' ')[1]}`}>{v}{unit}</p>
                              <p className="text-xs text-[#6F7A5C]/70">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {selected.allergens.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-[#6F7A5C] mb-2">{t('შეიცავს ალერგენებს', 'Contains allergens')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.allergens.map((a) => (
                          <span key={a} className="px-2.5 py-1 bg-[#6F7A5C] text-[#F5F1E4] text-xs font-bold rounded-full border border-[#F5F1E4]/30">
                            {ALLERGEN_LABELS[a]?.[locale] ?? a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl bg-[#6F7A5C] p-6 text-center">
                  <div className="w-12 h-12 bg-[#F5F1E4]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5F1E4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <p className="font-bold text-[#F5F1E4] mb-1">{t('სრული რეცეპტი დახურულია', 'Full recipe is locked')}</p>
                  <p className="text-sm text-[#F5F1E4]/70 mb-4">
                    {t('სრული ინგრედიენტებისა და კვებითი ღირებულების სანახავად გაიარე გამოწერა.', 'Subscribe to view full ingredients and nutritional info.')}
                  </p>
                  <a href={isLoggedIn ? '/#pricing' : '/signup'}
                    className="inline-block bg-[#F5F1E4] text-[#6F7A5C] font-bold text-sm px-6 py-3 rounded-full hover:opacity-90 transition">
                    {isLoggedIn ? t('გამოწერის გააქტიურება', 'Activate subscription') : t('რეგისტრაცია', 'Sign up free')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
