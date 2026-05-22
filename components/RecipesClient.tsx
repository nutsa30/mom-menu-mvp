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
  { key: 'ALL',       ka: 'ყველა',   en: 'All'       },
  { key: 'BREAKFAST', ka: 'საუზმე',  en: 'Breakfast' },
  { key: 'SNACK',     ka: 'სნექი',   en: 'Snack'     },
  { key: 'LUNCH',     ka: 'სადილი',  en: 'Lunch'     },
  { key: 'DINNER',    ka: 'ვახშამი', en: 'Dinner'    },
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
  dairy:      { ka: 'რძე',      en: 'Dairy'      },
  egg:        { ka: 'კვერცხი',  en: 'Egg'        },
  gluten:     { ka: 'გლუტენი',  en: 'Gluten'     },
  peanut:     { ka: 'არაქისი',  en: 'Peanut'     },
  treeNuts:   { ka: 'კაკალი',   en: 'Tree nuts'  },
  soy:        { ka: 'სოია',     en: 'Soy'        },
  fish:       { ka: 'თევზი',    en: 'Fish'       },
  shellfish:  { ka: 'კიბო',     en: 'Shellfish'  },
  molluscs:   { ka: 'მოლუსკი',  en: 'Molluscs'   },
  sesame:     { ka: 'სეზამი',   en: 'Sesame'     },
  corn:       { ka: 'სიმინდი',  en: 'Corn'       },
  tomato:     { ka: 'პომიდვრი', en: 'Tomato'     },
  strawberry: { ka: 'მარწყვი',  en: 'Strawberry' },
  citrus:     { ka: 'ციტრუსი',  en: 'Citrus'     },
  mustard:    { ka: 'მდოგვი',   en: 'Mustard'    },
  celery:     { ka: 'ნიახური',  en: 'Celery'     },
  sulphites:  { ka: 'სულფიტი',  en: 'Sulphites'  },
  lupin:      { ka: 'ლუპინი',   en: 'Lupin'      },
};

const MEAL_TYPE_LABEL: Record<string, { ka: string; en: string }> = {
  BREAKFAST: { ka: 'საუზმე',  en: 'Breakfast' },
  LUNCH:     { ka: 'სადილი',  en: 'Lunch'     },
  DINNER:    { ka: 'ვახშამი', en: 'Dinner'    },
  SNACK:     { ka: 'სნექი',   en: 'Snack'     },
};

const MEAL_TYPE_COLOR: Record<string, string> = {
  BREAKFAST: 'bg-orange-100 text-orange-700',
  LUNCH:     'bg-green-100 text-green-700',
  DINNER:    'bg-blue-100 text-blue-700',
  SNACK:     'bg-yellow-100 text-yellow-700',
};

const MEAL_TYPE_ICON: Record<string, string> = {
  BREAKFAST: '🌅', LUNCH: '🥗', DINNER: '🍲', SNACK: '🍎',
};

function parseSteps(text: string): string[] {
  // Split on numbered patterns like "1." "2." etc. at word boundaries
  const parts = text.split(/(?=\d+\.)/).map(s => s.replace(/^\d+\./, '').trim()).filter(Boolean);
  return parts.length > 1 ? parts : [text.trim()];
}

export default function RecipesClient({ dishes, locale, canRead, isLoggedIn }: Props) {
  const [mealFilter, setMealFilter] = useState('ALL');
  const [ageFilter, setAgeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Dish | null>(null);
  const [page, setPage] = useState(1);
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
    <main className="min-h-screen bg-[#fff8f6]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-black text-gray-900 mb-1">
            {t('რეცეპტები', 'Recipes')}
          </h1>
          <p className="text-gray-400 text-sm">
            {dishes.length} {t('კერძი ბაზაში', 'recipes in our library')}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search bar */}
        <div className="relative mb-5">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('კერძის ძებნა...', 'Search recipes...')}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7f50] text-sm bg-white shadow-sm"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Meal type filter */}
        <div className="flex gap-2 flex-wrap mb-4">
          {MEAL_TYPES.map((m) => (
            <button
              key={m.key}
              onClick={resetPage(() => setMealFilter(m.key))}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                mealFilter === m.key
                  ? 'bg-[#ff7f50] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#ff7f50]'
              }`}
            >
              {m.key !== 'ALL' && MEAL_TYPE_ICON[m.key] + ' '}
              {locale === 'ka' ? m.ka : m.en}
            </button>
          ))}
        </div>

        {/* Age group filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {AGE_GROUPS.map((a) => (
            <button
              key={a.key}
              onClick={resetPage(() => setAgeFilter(a.key))}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                ageFilter === a.key
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
              }`}
            >
              {locale === 'ka' ? a.ka : a.en}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="font-semibold">{t('კერძი ვერ მოიძებნა', 'No recipes found')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((dish) => (
              <button
                key={dish.id}
                onClick={() => setSelected(dish)}
                className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                {/* Image */}
                <div className="relative h-44 bg-[#fdf0ea] overflow-hidden">
                  {dish.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt={title(dish)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
                  )}
                  {/* Meal type badge */}
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${MEAL_TYPE_COLOR[dish.mealType]}`}>
                    {MEAL_TYPE_ICON[dish.mealType]} {MEAL_TYPE_LABEL[dish.mealType]?.[locale] ?? dish.mealType}
                  </span>
                  {!canRead && (
                    <div className="absolute top-3 right-3 w-7 h-7 bg-black/40 rounded-full flex items-center justify-center">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-[#7c3a1e] text-sm leading-snug mb-1 line-clamp-2">{title(dish)}</h3>
                  {canRead && desc(dish) && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{desc(dish)}</p>
                  )}
                  {!canRead && (
                    <p className="text-xs text-gray-400 blur-[3px] select-none mb-2 line-clamp-2">
                      {desc(dish) || 'recipe details locked for free users'}
                    </p>
                  )}

                  {/* Age groups */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dish.ageGroups.map((ag) => {
                      const label = locale === 'ka'
                        ? { FROM_6: '6თვ+', FROM_9: '9თვ+', FROM_12: '12თვ+', FROM_24: '24თვ+' }[ag]
                        : { FROM_6: '6mo+', FROM_9: '9mo+', FROM_12: '12mo+', FROM_24: '24mo+' }[ag];
                      return (
                        <span key={ag} className="px-2 py-0.5 bg-[#fff3ee] text-[#ff7f50] text-[10px] font-bold rounded-full">
                          {label ?? ag}
                        </span>
                      );
                    })}
                    {dish.calories && (
                      <span className="ml-auto text-[10px] text-gray-400 font-medium">{dish.calories} kcal</span>
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
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-full text-sm font-bold border border-gray-200 bg-white text-gray-600 hover:border-[#ff7f50] hover:text-[#ff7f50] disabled:opacity-30 disabled:cursor-not-allowed transition"
              >←</button>
              {items.map((p, i) =>
                p === null
                  ? <span key={`e${i}`} className="w-10 text-center text-gray-400 text-sm select-none">…</span>
                  : <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-10 h-10 rounded-full text-sm font-bold transition ${
                        p === page
                          ? 'bg-[#ff7f50] text-white shadow'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-[#ff7f50] hover:text-[#ff7f50]'
                      }`}
                    >{p}</button>
              )}
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-full text-sm font-bold border border-gray-200 bg-white text-gray-600 hover:border-[#ff7f50] hover:text-[#ff7f50] disabled:opacity-30 disabled:cursor-not-allowed transition"
              >→</button>
            </div>
          );
        })()}
      </div>

      {/* Recipe modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal image */}
            <div className="relative h-52 bg-[#fdf0ea] flex-shrink-0">
              {selected.imageUrl ? (
                <img src={selected.imageUrl} alt={title(selected)} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
              )}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition"
              >
                ✕
              </button>
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${MEAL_TYPE_COLOR[selected.mealType]}`}>
                {MEAL_TYPE_ICON[selected.mealType]} {MEAL_TYPE_LABEL[selected.mealType]?.[locale] ?? selected.mealType}
              </span>
            </div>

            {/* Modal content */}
            <div className="overflow-y-auto p-6 space-y-5">
              <div>
                <h2 className="text-xl font-black text-[#7c3a1e]">{title(selected)}</h2>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selected.ageGroups.map((ag) => {
                    const label = locale === 'ka'
                      ? { FROM_6: '6თვ+', FROM_9: '9თვ+', FROM_12: '12თვ+', FROM_24: '24თვ+' }[ag]
                      : { FROM_6: '6mo+', FROM_9: '9mo+', FROM_12: '12mo+', FROM_24: '24mo+' }[ag];
                    return (
                      <span key={ag} className="px-2.5 py-0.5 bg-[#fff3ee] text-[#ff7f50] text-xs font-bold rounded-full">{label ?? ag}</span>
                    );
                  })}
                </div>
              </div>

              {canRead ? (
                <>
                  {/* Preparation steps */}
                  {desc(selected) && (
                    <div>
                      <p className="text-sm font-bold text-[#ff7f50] mb-2">
                        {t('მომზადების წესი', 'Preparation')}
                      </p>
                      <ol className="space-y-1.5">
                        {parseSteps(desc(selected)).map((step, i) => (
                          <li key={i} className="flex gap-2.5 text-sm text-gray-700 leading-snug">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3ee] text-[#ff7f50] text-[11px] font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Ingredients */}
                  {ingredients(selected).length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-[#ff7f50] mb-2">
                        {t('ინგრედიენტები', 'Ingredients')}
                      </p>
                      <ol className="space-y-1.5">
                        {ingredients(selected).map((ing, i) => (
                          <li key={i} className="flex gap-2.5 text-sm text-gray-700 leading-snug">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Nutrition */}
                  {(() => {
                    const nutrients = [
                      { v: selected.calories,    label: t('კალორია','Calories'),    unit: 'kcal', color: 'bg-orange-50 text-orange-600' },
                      { v: selected.proteinGrams,label: t('ცილა','Protein'),        unit: 'g',    color: 'bg-blue-50 text-blue-600' },
                      { v: selected.carbsGrams,  label: t('ნახშირწყალი','Carbs'),  unit: 'g',    color: 'bg-yellow-50 text-yellow-600' },
                      { v: selected.fatGrams,    label: t('ცხიმი','Fat'),           unit: 'g',    color: 'bg-purple-50 text-purple-600' },
                      { v: selected.fiberGrams,  label: t('ბოჭკო','Fiber'),         unit: 'g',    color: 'bg-lime-50 text-lime-600' },
                      { v: selected.ironMg,      label: t('რკინა','Iron'),           unit: 'mg',   color: 'bg-red-50 text-red-500' },
                      { v: selected.calciumMg,   label: t('კალციუმი','Calcium'),    unit: 'mg',   color: 'bg-green-50 text-green-600' },
                      { v: selected.zincMg,      label: t('თუთია','Zinc'),           unit: 'mg',   color: 'bg-teal-50 text-teal-600' },
                      { v: selected.potassiumMg, label: t('კალიუმი','Potassium'),   unit: 'mg',   color: 'bg-cyan-50 text-cyan-600' },
                      { v: selected.magnesiumMg, label: t('მაგნიუმი','Magnesium'),  unit: 'mg',   color: 'bg-sky-50 text-sky-600' },
                      { v: selected.phosphorusMg,label: t('ფოსფორი','Phosphorus'),  unit: 'mg',   color: 'bg-indigo-50 text-indigo-600' },
                      { v: selected.sodiumMg,    label: t('ნატრიუმი','Sodium'),     unit: 'mg',   color: 'bg-gray-50 text-gray-600' },
                      { v: selected.vitaminAmcg, label: t('A ვიტ.','Vit A'),        unit: 'mcg',  color: 'bg-amber-50 text-amber-600' },
                      { v: selected.vitaminCmg,  label: t('C ვიტ.','Vit C'),        unit: 'mg',   color: 'bg-orange-50 text-orange-500' },
                      { v: selected.vitaminDmcg, label: t('D ვიტ.','Vit D'),        unit: 'mcg',  color: 'bg-yellow-50 text-yellow-500' },
                      { v: selected.vitaminEmg,  label: t('E ვიტ.','Vit E'),        unit: 'mg',   color: 'bg-green-50 text-green-500' },
                      { v: selected.vitaminKmcg, label: t('K ვიტ.','Vit K'),        unit: 'mcg',  color: 'bg-emerald-50 text-emerald-600' },
                      { v: selected.vitaminB6mg, label: t('B6 ვიტ.','Vit B6'),      unit: 'mg',   color: 'bg-violet-50 text-violet-600' },
                      { v: selected.vitaminB12mcg,label: t('B12 ვიტ.','Vit B12'),   unit: 'mcg',  color: 'bg-pink-50 text-pink-600' },
                      { v: selected.folateMcg,   label: t('ფოლატი','Folate'),       unit: 'mcg',  color: 'bg-rose-50 text-rose-500' },
                      { v: selected.omega3Mg,    label: 'Omega-3',                  unit: 'mg',   color: 'bg-blue-50 text-blue-500' },
                    ].filter(n => n.v);
                    if (!nutrients.length) return null;
                    return (
                      <div>
                        <p className="text-sm font-bold text-[#ff7f50] mb-2">{t('კვებითი ღირებულება', 'Nutrition')}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {nutrients.map(({ v, label, unit, color }) => (
                            <div key={label} className={`${color.split(' ')[0]} rounded-xl p-3 text-center`}>
                              <p className={`text-base font-black ${color.split(' ')[1]}`}>{v}{unit}</p>
                              <p className="text-xs text-gray-500">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Allergens */}
                  {selected.allergens.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-[#ff7f50] mb-2">
                        {t('შეიცავს ალერგენებს', 'Contains allergens')}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.allergens.map((a) => (
                          <span key={a} className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">
                            ⚠ {ALLERGEN_LABELS[a]?.[locale] ?? a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Locked state */
                <div className="rounded-2xl bg-[#fff8f6] border border-[#ffe5d9] p-6 text-center">
                  <div className="w-12 h-12 bg-[#ff7f50]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff7f50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <p className="font-bold text-gray-800 mb-1">
                    {t('სრული რეცეპტი დახურულია', 'Full recipe is locked')}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {t(
                      'სრული ინგრედიენტების და კვებითი ღირებულების სანახავად გაიარე გამოწერა.',
                      'Subscribe to view full ingredients and nutritional info.'
                    )}
                  </p>
                  <a
                    href={isLoggedIn ? '/#pricing' : '/signup'}
                    className="inline-block bg-[#ff7f50] text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#e86e40] transition"
                  >
                    {isLoggedIn
                      ? t('გამოწერის გააქტიურება', 'Activate subscription')
                      : t('რეგისტრაცია', 'Sign up free')}
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
