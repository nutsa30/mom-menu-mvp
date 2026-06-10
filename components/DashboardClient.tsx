'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Use local date (not UTC) to avoid timezone issues (e.g. Georgia is UTC+4)
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type Tab = 'today' | 'nutrition' | 'shopping' | 'child' | 'settings';

const MEAL_ORDER = ['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER'] as const;
const MEAL_LABEL: Record<string, string> = { BREAKFAST: 'საუზმე', SNACK: 'სნექი', LUNCH: 'სადილი', DINNER: 'ვახშამი' };
const MEAL_ICON: Record<string, string> = { BREAKFAST: '🌅', SNACK: '🍎', LUNCH: '🥗', DINNER: '🍲' };
const KA_DAYS_SHORT = ['კვ', 'ორშ', 'სამშ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ'];

const NUTRIENT_LABELS: Record<string, string> = {
  calories: 'კალორიები',
  proteinGrams: 'ცილა',
  carbsGrams: 'ნახშირწყლები',
  fatGrams: 'ცხიმი',
  fiberGrams: 'ბოჭკო',
  calciumMg: 'კალციუმი',
  ironMg: 'რკინა',
  zincMg: 'თუთია',
  potassiumMg: 'კალიუმი',
  magnesiumMg: 'მაგნიუმი',
  phosphorusMg: 'ფოსფორი',
  sodiumMg: 'ნატრიუმი',
  vitaminAmcg: 'A ვიტამინი',
  vitaminCmg: 'C ვიტამინი',
  vitaminDmcg: 'D ვიტამინი',
  vitaminEmg: 'E ვიტამინი',
  vitaminKmcg: 'K ვიტამინი',
  vitaminB6mg: 'B6 ვიტამინი',
  vitaminB12mcg: 'B12 ვიტამინი',
  folateMcg: 'ფოლატი',
};
const NUTRIENT_UNIT: Record<string, string> = {
  calories: 'kcal',
  proteinGrams: 'g', carbsGrams: 'g', fatGrams: 'g', fiberGrams: 'g',
  zincMg: 'mg', potassiumMg: 'mg', magnesiumMg: 'mg', phosphorusMg: 'mg',
  sodiumMg: 'mg', calciumMg: 'mg', ironMg: 'mg', vitaminCmg: 'mg',
  vitaminEmg: 'mg', vitaminB6mg: 'mg',
  vitaminAmcg: 'mcg', vitaminDmcg: 'mcg', vitaminKmcg: 'mcg',
  vitaminB12mcg: 'mcg', folateMcg: 'mcg',
};

const card = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm';
const btn = 'px-4 py-2 rounded-full text-sm font-bold transition';

// ── Today Tab ────────────────────────────────────────────────────────────
function TodayTab({ child, allDishes, planStart }: { child: any; allDishes: any[]; planStart: string }) {
  const todayStr = localToday();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [substituteFor, setSubstituteFor] = useState<string | null>(null);
  const [recipeModal, setRecipeModal] = useState<any | null>(null);
  const [seasonalData, setSeasonalData] = useState<any>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(planStart + 'T12:00:00');
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const [selectedDate, setSelectedDate] = useState(() =>
    weekDays.includes(todayStr) ? todayStr : weekDays[0]
  );

  useEffect(() => {
    const today = localToday();
    setSelectedDate(weekDays.includes(today) ? today : weekDays[0]);
  }, [planStart, child?.id]);

  const fetchLogs = useCallback(async (date: string) => {
    if (!child) return;
    setLoading(true);
    const res = await fetch(`/api/daily-log?childId=${child.id}&date=${date}`);
    const data = await res.json();
    setLogs(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [child?.id]);

  useEffect(() => {
    if (!child) return;
    fetch(`/api/seasonal-fruits?childId=${child.id}`)
      .then(r => r.json())
      .then(d => setSeasonalData(d))
      .catch(() => {});
  }, [child?.id]);

  useEffect(() => { fetchLogs(selectedDate); }, [fetchLogs, selectedDate]);

  const markEaten = async (logId: string, wasEaten: boolean) => {
    const res = await fetch(`/api/daily-log/${logId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wasEaten }),
    });
    const updated = await res.json();
    setLogs(prev => prev.map(l => l.id === logId ? updated : l));
  };

  const substitute = async (logId: string, dishId: string) => {
    const res = await fetch(`/api/daily-log/${logId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dishId, wasEaten: true }),
    });
    const updated = await res.json();
    setLogs(prev => prev.map(l => l.id === logId ? updated : l));
    setSubstituteFor(null);
    // Invalidate shopping list cache so it refreshes with new dish's ingredients
    localStorage.removeItem(`shopping_${child?.id}`);
  };

  const subLog = substituteFor ? logs.find(l => l.id === substituteFor) : null;
  const originalDish = subLog?.dish;

  const subCandidates = subLog
    ? allDishes.filter(d =>
        d.id !== originalDish?.id &&
        d.mealType === subLog.mealType &&
        d.ageGroups?.includes(child?.ageGroup) &&
        !d.allergens?.some((a: string) => child?.allergies?.includes(a))
      )
    : [];

  // Always sort by nutritional similarity to preserve the child's vitamin plan
  const displayDishes = originalDish
    ? [...subCandidates].sort((a, b) => {
        const keys = ['calories', 'proteinGrams', 'ironMg', 'calciumMg', 'vitaminCmg', 'vitaminAmcg', 'fiberGrams'];
        const score = (d: any) => keys.reduce((sum, k) => {
          const av = d[k] ?? 0, bv = originalDish[k] ?? 0;
          return sum + Math.abs(av - bv) / Math.max(av, bv, 1);
        }, 0);
        return score(a) - score(b);
      })
    : subCandidates;
  const eaten = logs.filter(l => l.wasEaten).length;
  const total = logs.length;

  if (!child) return (
    <div className={`${card} p-10 text-center`}>
      <p className="text-[#465940]/60 text-sm">შვილის მიმატება "შვილი" tab-ში.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Week selector */}
      <div className={`${card} p-4`}>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {weekDays.map(date => {
            const d = new Date(date + 'T12:00:00');
            const isCurrentDay = date === todayStr;
            const isSelected = date === selectedDate;
            const isPast = date < todayStr;
            return (
              <button key={date} onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center px-3 py-2 rounded-2xl transition flex-shrink-0 min-w-[52px] ${
                  isSelected ? 'bg-[#465940] text-[#FDFBF0]' :
                  isCurrentDay ? 'bg-[#465940] text-[#465940]' :
                  isPast ? 'bg-[#465940]/5 text-[#465940]/60' :
                  'bg-[#465940]/5 text-[#465940]/80 hover:bg-[#465940]/10'
                }`}>
                <span className="text-[10px] font-black uppercase tracking-wide">{KA_DAYS_SHORT[d.getDay()]}</span>
                <span className="text-lg font-black">{d.getDate()}</span>
                {isCurrentDay && !isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#465940] mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day header */}
      <div className={`${card} p-4 flex items-center justify-between`}>
        <div>
          <p className="text-xs text-[#465940]/60 font-medium" suppressHydrationWarning>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('ka-GE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h2 className="text-lg font-black text-[#465940] mt-0.5">{child.name}-ს კვება</h2>
        </div>
        {total > 0 && (
          <div className="text-right">
            <p className="text-2xl font-black text-[#465940]">{eaten}/{total}</p>
            <p className="text-[10px] text-[#465940]/60 uppercase tracking-wide">ჭამა</p>
          </div>
        )}
      </div>

      {/* Meal list – app-style with circular images */}
      {loading ? (
        <div className="space-y-3">
          {[0,1,2,3].map(i => (
            <div key={i} className={`${card} h-24 animate-pulse`} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {MEAL_ORDER.map(mealType => {
            const log = logs.find(l => l.mealType === mealType);
            const dish = log?.dish;
            const ingredient = log?.ingredient;
            const isIngredient = !dish && !!ingredient;
            const imageUrl = dish?.imageUrl ?? ingredient?.imageUrl;
            const titleKa = dish?.titleKa ?? ingredient?.titleKa;
            const calories = dish?.calories ?? ingredient?.calories;
            const proteinGrams = dish?.proteinGrams ?? ingredient?.proteinGrams;
            const eaten = log?.wasEaten;

            return (
              <div
                key={mealType}
                className={`${card} flex items-center gap-4 px-4 py-3.5 transition-all ${eaten ? 'border-[#465940]/30' : ''}`}
              >
                {/* Left – info */}
                <div className="flex-1 min-w-0">
                  {/* Meal type badge */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                      mealType === 'BREAKFAST' ? 'bg-[#FDFBF0]/20 text-[#FDFBF0]' :
                      mealType === 'LUNCH'     ? 'bg-[#FDFBF0]/20 text-[#465940]' :
                      mealType === 'SNACK'     ? 'bg-[#FDFBF0]/20 text-[#FDFBF0]' :
                                                 'bg-[#FDFBF0]/20 text-[#FDFBF0]'
                    }`}>
                      {MEAL_ICON[mealType]} {MEAL_LABEL[mealType]}
                    </span>
                    {eaten && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#465940]">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ჭამა
                      </span>
                    )}
                  </div>

                  {/* Dish name */}
                  {titleKa
                    ? <p className="font-bold text-[#465940] text-sm leading-snug mb-0.5 truncate">{titleKa}</p>
                    : <p className="text-sm text-[#465940]/60 italic mb-0.5">კერძი ვერ მოიძებნა</p>
                  }
                  {calories && (
                    <p className="text-[11px] text-[#465940]/60 mb-2.5">
                      {calories} kcal{proteinGrams ? ` · ${proteinGrams}g ცილა` : ''}
                    </p>
                  )}

                  {/* Actions – today only */}
                  {log && selectedDate === todayStr && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => markEaten(log.id, !log.wasEaten)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                          eaten ? 'bg-[#465940]/20 text-[#465940]' : 'bg-[#465940] text-[#FDFBF0] hover:bg-[#465940]'
                        }`}
                      >
                        {eaten ? '✓ ჭამა' : 'ჭამა'}
                      </button>
                      {!isIngredient && (
                        <button
                          onClick={() => setSubstituteFor(log.id)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940]/80 hover:bg-[#465940]/15 transition"
                        >
                          სხვა
                        </button>
                      )}
                      {dish && (
                        <button
                          onClick={() => setRecipeModal(dish)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940] text-[#465940] hover:bg-[#d4edda] transition"
                        >
                          რეცეპტი
                        </button>
                      )}
                    </div>
                  )}
                  {log?.wasEaten && selectedDate !== todayStr && !log && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#465940] font-semibold">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ჭამა
                    </span>
                  )}
                </div>

                {/* Right – circular image */}
                <button
                  className={`flex-shrink-0 w-[72px] h-[72px] rounded-full overflow-hidden bg-[#f0f8ee] transition ${dish ? 'hover:ring-2 hover:ring-[#465940]/40' : ''}`}
                  onClick={() => dish && setRecipeModal(dish)}
                  disabled={!dish}
                >
                  {imageUrl
                    ? <img src={imageUrl} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">{MEAL_ICON[mealType]}</div>
                  }
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Seasonal fruit suggestion */}
      {seasonalData?.fruits?.length > 0 && (
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{seasonalData.seasonIcon}</span>
            <div>
              <h3 className="font-black text-[#465940] text-sm">{seasonalData.seasonKa}ის სეზონური ხილი</h3>
              <p className="text-[10px] text-[#465940]/60">შეათავაზე ბავშვს დამატებით — ვიტამინებით მდიდარი</p>
            </div>
          </div>
          <div className="space-y-3">
            {seasonalData.fruits.map((f: any) => (
              <div key={f.id} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#465940]/10">
                  {f.imageUrl
                    ? <img src={f.imageUrl} alt={f.titleKa} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">🍎</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#465940] text-sm">{f.titleKa}</p>
                  {f.vitamins.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {f.vitamins.slice(0, 4).map((v: any) => (
                        <span key={v.label} className="text-[10px] bg-[#465940]/10 text-[#465940]/70 px-2 py-0.5 rounded-full font-semibold">
                          {v.label} {v.value}
                        </span>
                      ))}
                    </div>
                  )}
                  {f.benefitsKa?.length > 0 && (
                    <p className="text-[11px] text-[#465940]/60 mt-1">{f.benefitsKa.slice(0, 2).join(' · ')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Substitute modal */}
      {substituteFor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSubstituteFor(null)}>
          <div className="bg-[#FDFBF0] rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[#465940]/10">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-[#465940]">სხვა კერძი — {MEAL_LABEL[subLog?.mealType ?? '']}</h3>
                <button onClick={() => setSubstituteFor(null)} className="text-[#465940]/60 hover:text-[#465940]/80 text-2xl leading-none">×</button>
              </div>
              <p className="text-[11px] text-[#465940]/60">დალაგებულია ვიტამინების მსგავსობის მიხედვით — ვიტამინების გეგმა არ ირღვევა</p>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {displayDishes.length === 0 && <p className="text-[#465940]/60 text-sm text-center py-8">სხვა კერძი ვერ მოიძებნა</p>}
              {displayDishes.map((d: any) => (
                <button key={d.id} onClick={() => substitute(substituteFor, d.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-[#465940] transition text-left border border-transparent hover:border-[#465940]/20">
                  <div className="w-12 h-12 rounded-xl bg-[#465940]/10 overflow-hidden flex-shrink-0">
                    {d.imageUrl ? <img src={d.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#465940] text-sm truncate">{d.titleKa}</p>
                    {d.calories && <p className="text-xs text-[#465940]/60">{d.calories} kcal{d.proteinGrams ? ` · ${d.proteinGrams}g ცილა` : ''}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recipe modal */}
      {recipeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setRecipeModal(null)}>
          <div className="bg-[#FDFBF0] w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="relative h-48 bg-[#fdf0ea] flex-shrink-0">
              {recipeModal.imageUrl
                ? <img src={recipeModal.imageUrl} alt={recipeModal.titleKa} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>}
              <button onClick={() => setRecipeModal(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-[#FDFBF0] transition">✕</button>
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FDFBF0]/90`}>
                {MEAL_ICON[recipeModal.mealType]} {MEAL_LABEL[recipeModal.mealType]}
              </span>
            </div>
            <div className="overflow-y-auto p-6 space-y-5">
              <h2 className="text-xl font-black text-[#465940]">{recipeModal.titleKa}</h2>
              {recipeModal.ingredientsKa?.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-[#465940] mb-2">ინგრედიენტები</p>
                  <ul className="space-y-1.5">
                    {recipeModal.ingredientsKa.map((ing: string, i: number) => (
                      <li key={i} className="flex gap-2.5 text-sm text-[#465940]">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#465940]/10 text-[#465940]/70 text-[11px] font-black flex items-center justify-center mt-0.5">{i+1}</span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recipeModal.descriptionKa && (
                <div>
                  <p className="text-sm font-bold text-[#465940] mb-2">მომზადების წესი</p>
                  <p className="text-sm text-[#465940] leading-relaxed">{recipeModal.descriptionKa}</p>
                </div>
              )}
              {recipeModal.calories && (
                <div>
                  <p className="text-sm font-bold text-[#465940] mb-2">კვებითი ღირებულება</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: recipeModal.calories, label: 'კალორი', unit: 'kcal', color: 'bg-[#FDFBF0]/10 text-[#465940]' },
                      { v: recipeModal.proteinGrams, label: 'ცილა', unit: 'g', color: 'bg-[#FDFBF0]/10 text-[#465940]' },
                      { v: recipeModal.carbsGrams, label: 'ნახშ.', unit: 'g', color: 'bg-[#FDFBF0]/10 text-[#465940]' },
                      { v: recipeModal.fatGrams, label: 'ცხიმი', unit: 'g', color: 'bg-[#FDFBF0]/10 text-[#465940]' },
                      { v: recipeModal.ironMg, label: 'რკინა', unit: 'mg', color: 'bg-[#465940] text-[#FDFBF0]' },
                      { v: recipeModal.calciumMg, label: 'კალციუმი', unit: 'mg', color: 'bg-[#465940]/10 text-[#465940]' },
                      { v: recipeModal.vitaminCmg, label: 'C ვიტ.', unit: 'mg', color: 'bg-[#FDFBF0]/10 text-[#465940]' },
                      { v: recipeModal.vitaminAmcg, label: 'A ვიტ.', unit: 'mcg', color: 'bg-[#FDFBF0]/10 text-[#FDFBF0]' },
                    ].filter(n => n.v).map(({ v, label, unit, color }) => (
                      <div key={label} className={`${color.split(' ')[0]} rounded-xl p-3 text-center`}>
                        <p className={`text-base font-black ${color.split(' ')[1]}`}>{v}{unit}</p>
                        <p className="text-xs text-[#465940]/70">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shopping List Tab ──────────────────────────────────────────────────────
type IngItem = { display: string; amount: string };

// Parse "12 ც" → {qty:12, unit:"ც"}, "×3" → {qty:3, unit:""}, null if complex/empty
function parseAmount(amount: string): { qty: number; unit: string } | null {
  if (!amount || amount.includes('+')) return null;
  const xm = amount.match(/^×(\d+)$/);
  if (xm) return { qty: parseInt(xm[1]), unit: '' };
  const FRAC: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1/3, '⅔': 2/3 };
  const m = amount.match(/^([½¼¾⅓⅔]|\d+\.?\d*)\s+(.+)$/);
  if (m) return { qty: FRAC[m[1]] ?? parseFloat(m[1]), unit: m[2] };
  return null;
}

function ShoppingListTab({ child, planStart }: { child: any; planStart: string }) {
  const STORE_KEY = child ? `shopping_${child.id}` : null;

  const [ingredients, setIngredients] = useState<IngItem[]>([]);
  const [bought, setBought] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [apiError, setApiError] = useState('');

  const saveLocal = (ing: IngItem[], bt: Record<string, number>) => {
    if (!STORE_KEY) return;
    localStorage.setItem(STORE_KEY, JSON.stringify({ ingredients: ing, bought: bt }));
  };

  const isValidFormat = (ing: any): ing is IngItem[] =>
    Array.isArray(ing) && (ing.length === 0 || (typeof ing[0] === 'object' && 'display' in ing[0]));

  useEffect(() => {
    if (!child || !STORE_KEY) return;
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const ing = parsed?.ingredients;
        const bt = parsed?.bought;
        if (isValidFormat(ing)) {
          setIngredients(ing);
          setBought(typeof bt === 'object' && bt !== null && !Array.isArray(bt) ? bt : {});
          setGenerated(true);
        } else {
          localStorage.removeItem(STORE_KEY);
        }
      } catch { localStorage.removeItem(STORE_KEY); }
    }
    fetch(`/api/shopping-list?childId=${child.id}&planStart=${planStart}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setApiError(data.error); return; }
        if (isValidFormat(data.ingredients)) {
          const ing: IngItem[] = data.ingredients;
          setIngredients(ing);
          setGenerated(true);
          setApiError('');
          setBought(prev => {
            const names = new Set(ing.map((i: IngItem) => i.display));
            const next = Object.fromEntries(Object.entries(prev).filter(([k]) => names.has(k)));
            saveLocal(ing, next);
            return next;
          });
        }
      })
      .catch(() => setApiError('კავშირის შეცდომა'));
  }, [child?.id, planStart]);

  const regenerate = async () => {
    if (!child || !STORE_KEY) return;
    setLoading(true);
    setBought({});
    setApiError('');
    localStorage.removeItem(STORE_KEY);
    const res = await fetch(`/api/shopping-list?childId=${child.id}&planStart=${planStart}`);
    const data = await res.json();
    if (data.error) { setApiError(data.error); setLoading(false); return; }
    const ing: IngItem[] = isValidFormat(data.ingredients) ? data.ingredients : [];
    setIngredients(ing);
    setGenerated(true);
    setLoading(false);
    saveLocal(ing, {});
  };

  const adjust = (display: string, delta: number, max: number) => {
    setBought(prev => {
      const cur = prev[display] ?? 0;
      const next = { ...prev, [display]: Math.max(0, delta > 0 ? Math.min(max, cur + delta) : cur + delta) };
      saveLocal(ingredients, next);
      return next;
    });
  };

  const toggleSimple = (display: string) => {
    setBought(prev => {
      const next = { ...prev, [display]: (prev[display] ?? 0) >= 1 ? 0 : 1 };
      saveLocal(ingredients, next);
      return next;
    });
  };

  const doneCount = ingredients.filter(item => {
    const p = parseAmount(item.amount);
    return (bought[item.display] ?? 0) >= (p ? p.qty : 1);
  }).length;

  const clearBought = () => { setBought({}); saveLocal(ingredients, {}); };

  if (!child) return (
    <div className={`${card} p-10 text-center`}>
      <p className="text-[#465940]/60 text-sm">შვილის მიმატება "შვილი" tab-ში.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-xl font-black text-[#465940]">🛒 საყიდლების სია</h2>
            <p className="text-xs text-[#465940]/60 mt-0.5">{child.name} · მომდევნო 7 დღის გეგმა</p>
          </div>
          <button onClick={regenerate} disabled={loading}
            className={`${btn} bg-[#465940] text-[#FDFBF0] text-sm hover:bg-[#465940] disabled:opacity-60`}>
            {loading ? '⏳ იტვირთება...' : '🔄 განახლება'}
          </button>
        </div>
      </div>

      {apiError && (
        <div className="bg-[#465940] border border-[#FDFBF0]/30 rounded-2xl p-4 text-center">
          <p className="text-sm text-[#FDFBF0] font-semibold">შეცდომა: {apiError}</p>
          <p className="text-xs text-[#FDFBF0]/70 mt-1">სცადე "განახლება" ღილაკი</p>
        </div>
      )}

      {loading && (
        <div className={`${card} p-8 text-center`}>
          <div className="text-4xl mb-3 animate-bounce">🛒</div>
          <p className="text-sm text-[#465940]/70">7 დღის კვების გეგმა მზადდება...</p>
        </div>
      )}

      {generated && !loading && (
        <>
          <div className={`${card} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-[#465940]">{ingredients.length - doneCount} დარჩენილი / {ingredients.length} სულ</p>
              {doneCount > 0 && (
                <button onClick={clearBought} className="text-xs text-[#465940]/60 hover:text-[#465940]/80 transition">გასუფთავება</button>
              )}
            </div>

            <div className="h-2 bg-[#465940]/10 rounded-full mb-5 overflow-hidden">
              <div className="h-2 bg-[#465940] rounded-full transition-all"
                style={{ width: ingredients.length ? `${(doneCount / ingredients.length) * 100}%` : '0%' }} />
            </div>

            <div className="space-y-2">
              {ingredients.map((item) => {
                const parsed = parseAmount(item.amount);
                const boughtQty = bought[item.display] ?? 0;
                const neededQty = parsed ? parsed.qty : 1;
                const isDone = boughtQty >= neededQty;

                return (
                  <div key={item.display}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      isDone ? 'bg-[#465940]/10 border border-[#465940]/30' : 'bg-[#465940] border border-transparent'
                    }`}>

                    {/* Name – tap to +1 (quantified) or toggle (simple) */}
                    <button
                      className="flex-1 flex items-center gap-3 text-left min-w-0"
                      onClick={() => parsed ? adjust(item.display, 1, neededQty) : toggleSimple(item.display)}>
                      {!parsed && (
                        <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                          isDone ? 'bg-[#465940] border-[#465940]' : 'border-[#465940]/30'
                        }`}>
                          {isDone && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                      )}
                      <span className={`text-sm font-medium truncate transition ${isDone ? 'line-through text-[#465940]/60' : 'text-[#465940]'}`}>
                        {item.display}
                      </span>
                    </button>

                    {/* Stepper for quantified items */}
                    {parsed ? (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => adjust(item.display, -1, neededQty)}
                          className="w-7 h-7 rounded-full bg-[#465940]/10 hover:bg-[#465940]/15 text-[#465940]/80 font-bold flex items-center justify-center transition text-base leading-none">
                          −
                        </button>
                        <span className={`text-xs font-bold text-center leading-tight ${isDone ? 'text-[#465940]' : 'text-[#465940]'}`}
                          style={{ minWidth: '52px' }}>
                          {boughtQty} / {parsed.qty}{parsed.unit ? ` ${parsed.unit}` : ''}
                        </span>
                        <button onClick={() => adjust(item.display, 1, neededQty)}
                          className={`w-7 h-7 rounded-full text-[#FDFBF0] font-bold flex items-center justify-center transition text-base leading-none ${
                            isDone ? 'bg-[#465940] hover:bg-[#465940]/80' : 'bg-[#465940] hover:bg-[#465940]'
                          }`}>
                          +
                        </button>
                      </div>
                    ) : (
                      item.amount && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          isDone ? 'bg-[#465940]/10 text-[#465940]/60' : 'bg-[#465940] text-[#465940]'
                        }`}>
                          {item.amount}
                        </span>
                      )
                    )}
                  </div>
                );
              })}

              {ingredients.length === 0 && (
                <p className="text-center text-[#465940]/60 text-sm py-6">ინგრედიენტები ვერ მოიძებნა</p>
              )}
            </div>
          </div>

          {doneCount === ingredients.length && ingredients.length > 0 && (
            <div className={`${card} p-6 text-center bg-[#465940]/10 border border-[#465940]/30`}>
              <p className="text-2xl mb-2">🎉</p>
              <p className="font-bold text-[#465940]">ყველაფერი შეძენილი!</p>
              <p className="text-sm text-[#465940] mt-1">კვირის კვების გეგმა მზადაა.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Nutrition Tab ────────────────────────────────────────────────────────────
function NutritionTab({ child }: { child: any }) {
  const [data, setData] = useState<any>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    if (!child) return;
    setLoading(true);
    const res = await fetch(`/api/nutrition?childId=${child.id}&days=${days}`);
    const d = await res.json();
    setData(d);
    setLoading(false);
  }, [child?.id, days]);

  useEffect(() => { fetch_(); }, [fetch_]);

  if (!child) return (
    <div className={`${card} p-10 text-center`}>
      <p className="text-[#465940]/60 text-sm">შვილის მიმატება "შვილი" tab-ში.</p>
    </div>
  );

  const deficient = data?.analysis?.filter((a: any) => a.pct < 70) ?? [];

  const uniqueDays = data?.uniqueDays ?? 0;

  return (
    <div className="space-y-5">
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-black text-[#465940]">კვებითი ბალანსი</h2>
          <div className="flex gap-2">
            {[7, 14, 30].map((d) => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${days === d ? 'bg-[#465940] text-[#FDFBF0]' : 'bg-[#465940]/10 text-[#465940]/80 hover:bg-[#465940]/15'}`}>
                {d} დღე
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-[#465940]/60 mt-1">{child.name} · {uniqueDays} / {days} დღე შევსებული</p>
      </div>

      {deficient.length > 0 && uniqueDays > 0 && (
        <div className="bg-[#FDFBF0]/10 border border-[#FDFBF0]/20 rounded-2xl p-5">
          <p className="font-bold text-[#FDFBF0] mb-2">⚠️ ნაკლები {days} დღეში</p>
          <div className="space-y-1">
            {deficient.map((a: any) => (
              <p key={a.key} className="text-sm text-[#FDFBF0]/80">
                • <strong>{NUTRIENT_LABELS[a.key]}</strong>: {a.consumed} / {a.recommended} {NUTRIENT_UNIT[a.key]} ({a.pct}%)
              </p>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className={`${card} h-64 animate-pulse`} />
      ) : data?.analysis ? (
        <div className={`${card} p-5 space-y-4`}>
          {data.analysis.map((a: any) => (
            <div key={a.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-[#465940]">{NUTRIENT_LABELS[a.key]}</span>
                <span className="text-xs text-[#465940]/70">{a.consumed} / {a.recommended} {NUTRIENT_UNIT[a.key]}</span>
              </div>
              <div className="h-2.5 bg-[#465940]/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${a.pct >= 100 ? 'bg-[#465940]' : a.pct >= 70 ? 'bg-[#465940]' : 'bg-[#FDFBF0]/40'}`}
                  style={{ width: `${Math.min(100, a.pct)}%` }}
                />
              </div>
              <p className="text-xs text-[#465940]/60 mt-0.5 text-right">{a.pct}%</p>
            </div>
          ))}
        </div>
      ) : null}

      {uniqueDays === 0 && !loading && (
        <div className={`${card} p-10 text-center`}>
          <p className="text-2xl mb-3">📊</p>
          <p className="font-bold text-[#465940] mb-1">ჯერ ჩანაწერი არ არის</p>
          <p className="text-sm text-[#465940]/60">მონიშნე "დღის გეგმა" tab-ში "ჭამა" ერთხელ მაინც რომ გამოჩნდეს კვებითი ბალანსი.</p>
        </div>
      )}
    </div>
  );
}

// ── Tag Input component ──────────────────────────────────────────────────────
function TagInput({ tags, onChange, color }: { tags: string[]; onChange: (t: string[]) => void; color: string }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim().toLowerCase();
    if (!v || tags.includes(v)) return;
    onChange([...tags, v]);
    setInput('');
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t) => (
          <span key={t} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${color}`}>
            {t}
            <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} className="opacity-60 hover:opacity-100 ml-1">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="დაამატე და Enter..."
          className="flex-1 px-3 py-2 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm" />
        <button type="button" onClick={add} className="px-3 py-2 rounded-xl bg-[#465940]/10 hover:bg-[#465940]/15 text-sm font-bold text-[#465940]/80 transition">+</button>
      </div>
    </div>
  );
}

// ── Child Tab ────────────────────────────────────────────────────────────────
function ChildTab({ children: kids, userId, onUpdate, onDelete }: {
  children: any[]; userId: string; onUpdate: (c: any) => void; onDelete: (id: string) => void;
}) {
  const [viewModal, setViewModal] = useState<any | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newChildMode, setNewChildMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBirth, setNewBirth] = useState('');
  const [addingChild, setAddingChild] = useState(false);

  const openEdit = (child: any) => {
    setViewModal(null);
    setSelected(child);
    setName(child.name);
    setBirthDate(child.birthDate ? new Date(child.birthDate).toISOString().split('T')[0] : '');
    setAllergies(child.allergies ?? []);
    setDislikes(child.dislikes ?? []);
    setLikes(child.likes ?? []);
  };

  const deleteChild = async (child: any) => {
    setDeleting(true);
    await fetch(`/api/children/${child.id}`, { method: 'DELETE' });
    onDelete(child.id);
    setViewModal(null);
    if (selected?.id === child.id) setSelected(null);
    setDeleting(false);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/children/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, birthDate, allergies, dislikes, likes }),
    });
    const updated = await res.json();
    setSaving(false);
    if (updated.id) {
      // Clear plan + shopping caches so a fresh plan generates with new preferences
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`planStart_${updated.id}`, today);
      localStorage.removeItem(`shopping_${updated.id}`);
      onUpdate(updated);
      setSelected(null);
    }
  };

  const addChild = async () => {
    if (!newName || !newBirth) return;
    setAddingChild(true);
    const res = await fetch('/api/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name: newName, birthDate: newBirth }),
    });
    const child = await res.json();
    setAddingChild(false);
    if (child.id) { onUpdate(child); setNewChildMode(false); setNewName(''); setNewBirth(''); }
  };

  const fmtDate = (bd: any) => bd
    ? new Date(bd).toLocaleDateString('ka-GE', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="space-y-5">
      {/* Child pills */}
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-[#465940]">შვილები</h2>
          <button onClick={() => setNewChildMode(true)}
            className="bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] px-4 py-2 rounded-full text-sm font-bold transition">+ მიმატება</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {kids.map((c) => (
            <button key={c.id} onClick={() => setViewModal(c)}
              className="px-4 py-2 rounded-full text-sm font-bold transition bg-[#465940]/10 text-[#465940] hover:bg-[#465940] hover:text-[#FDFBF0]">
              {c.name}
            </button>
          ))}
          {kids.length === 0 && <p className="text-[#465940]/60 text-sm">ჯერ შვილი არ გაქვს დამატებული.</p>}
        </div>
      </div>

      {/* Add new child */}
      {newChildMode && (
        <div className={`${card} p-5`}>
          <h3 className="font-bold text-[#465940] mb-4">ახალი შვილის მიმატება</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-[#465940] mb-1.5">სახელი</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#465940] mb-1.5">დაბადების თარიღი</label>
              <input type="date" value={newBirth} onChange={(e) => setNewBirth(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addChild} disabled={addingChild}
              className="bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] px-5 py-2.5 rounded-full text-sm font-bold transition disabled:opacity-60">
              {addingChild ? 'ემატება...' : 'დამატება'}
            </button>
            <button onClick={() => setNewChildMode(false)}
              className="bg-[#465940]/10 hover:bg-[#465940]/15 text-[#465940] px-5 py-2.5 rounded-full text-sm font-bold transition">გაუქმება</button>
          </div>
        </div>
      )}

      {/* Edit form – only shown after clicking "რედაქტირება" in modal */}
      {selected && (
        <div className={`${card} p-5 space-y-5`}>
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[#465940]">{selected.name}-ს რედაქტირება</h3>
            <button onClick={() => setSelected(null)} className="text-[#465940]/60 hover:text-[#465940]/80 text-2xl leading-none">×</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#465940] mb-1.5">სახელი</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#465940] mb-1.5">დაბადების თარიღი</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#465940] mb-2">🚨 ალერგიები</label>
            <TagInput tags={allergies} onChange={setAllergies} color="bg-[#FDFBF0]/10 text-[#465940]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#465940] mb-2">😤 არ უყვარს</label>
            <TagInput tags={dislikes} onChange={setDislikes} color="bg-[#FDFBF0]/10 text-[#465940]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#465940] mb-2">😋 უყვარს</label>
            <TagInput tags={likes} onChange={setLikes} color="bg-[#465940]/20 text-[#465940]" />
          </div>
          <button onClick={save} disabled={saving}
            className="w-full bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] py-3 rounded-full font-bold text-sm transition disabled:opacity-60">
            {saving ? 'ინახება...' : 'შენახვა'}
          </button>
        </div>
      )}

      {/* View modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setViewModal(null)}>
          <div className="bg-[#FDFBF0] rounded-3xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="bg-[#465940] px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#FDFBF0]/70 font-bold uppercase tracking-wide mb-0.5">შვილის პროფილი</p>
                <h3 className="text-xl font-black text-[#FDFBF0]">{viewModal.name}</h3>
              </div>
              <button onClick={() => setViewModal(null)} className="w-8 h-8 rounded-full bg-[#FDFBF0]/20 hover:bg-[#FDFBF0]/30 flex items-center justify-center text-[#FDFBF0] text-xl leading-none transition">×</button>
            </div>

            {/* Info rows */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-xs text-[#465940]/60 font-semibold uppercase tracking-wide mb-1">დაბადების თარიღი</p>
                <p className="text-sm font-bold text-[#465940]">{fmtDate(viewModal.birthDate)}</p>
              </div>

              {viewModal.allergies?.length > 0 && (
                <div>
                  <p className="text-xs text-[#465940]/60 font-semibold uppercase tracking-wide mb-2">🚨 ალერგიები</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewModal.allergies.map((a: string) => (
                      <span key={a} className="px-3 py-1 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940]">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewModal.dislikes?.length > 0 && (
                <div>
                  <p className="text-xs text-[#465940]/60 font-semibold uppercase tracking-wide mb-2">😤 არ უყვარს</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewModal.dislikes.map((d: string) => (
                      <span key={d} className="px-3 py-1 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940]">{d}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewModal.likes?.length > 0 && (
                <div>
                  <p className="text-xs text-[#465940]/60 font-semibold uppercase tracking-wide mb-2">😋 უყვარს</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewModal.likes.map((l: string) => (
                      <span key={l} className="px-3 py-1 rounded-full text-xs font-bold bg-[#465940]/20 text-[#465940]">{l}</span>
                    ))}
                  </div>
                </div>
              )}

              {!viewModal.allergies?.length && !viewModal.dislikes?.length && !viewModal.likes?.length && (
                <p className="text-sm text-[#465940]/60 italic">დამატებითი ინფორმაცია არ არის შეყვანილი</p>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => openEdit(viewModal)}
                className="flex-1 bg-[#465940] hover:bg-[#465940]/80 text-[#FDFBF0] py-3 rounded-full font-bold text-sm transition">
                რედაქტირება
              </button>
              <button onClick={() => deleteChild(viewModal)} disabled={deleting}
                className="flex-1 border border-[#465940]/30 text-[#465940] hover:bg-[#465940]/10 py-3 rounded-full font-bold text-sm transition disabled:opacity-60">
                {deleting ? 'იშლება...' : 'წაშლა'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Settings Tab ────────────────────────────────────────────────────────────
function SettingsTab({ user }: { user: any }) {
  const [name, setName] = useState(user.name);
  const [nameStatus, setNameStatus] = useState<'idle' | 'saving' | 'ok'>('idle');
  const [email, setEmail] = useState(user.email);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');
  const [pwCur, setPwCur] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConf, setPwConf] = useState('');
  const [pwStatus, setPwStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [pwError, setPwError] = useState('');

  const saveName = async () => {
    setNameStatus('saving');
    await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setNameStatus('ok');
    setTimeout(() => setNameStatus('idle'), 2000);
  };

  const saveEmail = async () => {
    if (!email.trim() || !email.includes('@')) { setEmailError('სწორი ელფასტა შეიყვანე'); setEmailStatus('error'); return; }
    setEmailStatus('saving'); setEmailError('');
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const d = await res.json();
      setEmailError(d.error === 'email_taken' ? 'ეს ელფასტა უკვე გამოიყენება' : 'შეცდომა. სცადე თავიდან.');
      setEmailStatus('error');
    } else {
      setEmailStatus('ok');
      setTimeout(() => setEmailStatus('idle'), 2000);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwNew !== pwConf) { setPwError('პაროლები არ ემთხვევა'); setPwStatus('error'); return; }
    if (pwNew.length < 6) { setPwError('მინიმუმ 6 სიმბოლო'); setPwStatus('error'); return; }
    setPwStatus('loading'); setPwError('');
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwCur, newPassword: pwNew }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPwError(data.error === 'wrong_password' ? 'არასწორი პაროლი' : 'შეცდომა. სცადე თავიდან.');
      setPwStatus('error');
    } else {
      setPwStatus('ok');
      setPwCur(''); setPwNew(''); setPwConf('');
    }
  };

  const inp = 'w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm';

  return (
    <div className="space-y-5 max-w-lg">
      {/* Name */}
      <div className={`${card} p-6`}>
        <h2 className="font-black text-[#465940] mb-4">სახელი</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inp} />
        <button onClick={saveName} disabled={nameStatus === 'saving'}
          className="mt-3 bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] px-6 py-2.5 rounded-full text-sm font-bold transition disabled:opacity-60">
          {nameStatus === 'saving' ? 'ინახება...' : nameStatus === 'ok' ? '✓ შენახვა' : 'შენახვა'}
        </button>
      </div>

      {/* Email */}
      <div className={`${card} p-6`}>
        <h2 className="font-black text-[#465940] mb-4">ელფასტა</h2>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} />
        {emailStatus === 'error' && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        <button onClick={saveEmail} disabled={emailStatus === 'saving'}
          className="mt-3 bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] px-6 py-2.5 rounded-full text-sm font-bold transition disabled:opacity-60">
          {emailStatus === 'saving' ? 'ინახება...' : emailStatus === 'ok' ? '✓ შენახვა' : 'შენახვა'}
        </button>
      </div>

      {/* Change password */}
      <div className={`${card} p-6`}>
        <h2 className="font-black text-[#465940] mb-4">პაროლის შეცვლა</h2>
        {pwStatus === 'ok' && <div className="mb-4 rounded-xl bg-[#465940]/10 px-4 py-3 text-sm font-semibold text-[#465940]">პაროლი შეიცვალა ✓</div>}
        <form onSubmit={changePassword} className="space-y-3">
          <input type="password" placeholder="მიმდინარე პაროლი" value={pwCur} onChange={(e) => setPwCur(e.target.value)} required className={inp} />
          <input type="password" placeholder="ახალი პაროლი" value={pwNew} onChange={(e) => setPwNew(e.target.value)} required minLength={6} className={inp} />
          <input type="password" placeholder="გაიმეორე ახალი პაროლი" value={pwConf} onChange={(e) => setPwConf(e.target.value)} required className={inp} />
          {pwStatus === 'error' && <p className="text-red-500 text-sm">{pwError}</p>}
          <button type="submit" disabled={pwStatus === 'loading'}
            className="w-full bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] py-3 rounded-full font-bold text-sm transition disabled:opacity-60">
            {pwStatus === 'loading' ? 'იცვლება...' : 'პაროლის განახლება'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className={`${card} p-6`}>
        <h2 className="font-black text-[#465940] mb-3">ანგარიში</h2>
        <p className="text-sm text-[#465940]/70"><span className="font-semibold text-[#465940]">სტატუსი:</span> {user.subscriptionStatus}</p>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardClient({ user }: { user: any }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('today');
  const [children, setChildren] = useState<any[]>(user.children ?? []);
  const [activeChild, setActiveChild] = useState<any>(user.children?.[0] ?? null);
  const [allDishes, setAllDishes] = useState<any[]>([]);
  const [planStart, setPlanStart] = useState(localToday());

  useEffect(() => {
    fetch('/api/meals').then((r) => r.json()).then((d) => {
      setAllDishes(Array.isArray(d) ? d : (d.meals ?? []));
    });
  }, []);

  // Manage fixed 7-day plan window per child; auto-renew when expired
  useEffect(() => {
    if (!activeChild) return;
    const today = localToday();
    const key = `planStart_${activeChild.id}`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, today);
      setPlanStart(today);
      return;
    }
    const end = new Date(stored + 'T12:00:00');
    end.setDate(end.getDate() + 7);
    if (end.toISOString().split('T')[0] <= today) {
      // Plan expired – start fresh
      localStorage.setItem(key, today);
      localStorage.removeItem(`shopping_${activeChild.id}`);
      setPlanStart(today);
    } else {
      setPlanStart(stored);
    }
  }, [activeChild?.id]);

  const onChildUpdate = (updated: any) => {
    setChildren((prev) => {
      const exists = prev.find((c) => c.id === updated.id);
      if (exists) return prev.map((c) => (c.id === updated.id ? updated : c));
      return [...prev, updated];
    });
    setActiveChild(updated);
  };

  const onChildDelete = (id: string) => {
    setChildren((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeChild?.id === id) setActiveChild(next[0] ?? null);
      return next;
    });
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const isFullPlan = user.subscriptionStatus === 'FULL_PLAN';

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'today', label: 'დღის გეგმა', icon: '📋' },
    { key: 'nutrition', label: 'კვება', icon: '📊' },
    ...(isFullPlan ? [{ key: 'shopping' as Tab, label: 'საყიდლები', icon: '🛒' }] : []),
    { key: 'child', label: 'შვილი', icon: '👶' },
    { key: 'settings', label: 'პარამეტრები', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-[#465940] flex flex-col pb-16">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#465940] to-[#465940] px-5 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <a href="/" className="font-black leading-tight">
            <div className="text-base text-[#FDFBF0]" style={{ lineHeight: 1 }}>mom<span className="text-[#FDFBF0]/50">♥</span></div>
            <div className="text-base text-[#FDFBF0]" style={{ lineHeight: 1 }}>menu</div>
          </a>
          {children.length > 1 && (
            <select
              value={activeChild?.id ?? ''}
              onChange={(e) => setActiveChild(children.find((c) => c.id === e.target.value) ?? null)}
              className="text-sm border border-[#FDFBF0]/30 bg-[#FDFBF0]/20 text-[#FDFBF0] rounded-full px-3 py-1.5 focus:outline-none"
            >
              {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {children.length === 1 && (
            <span className="text-sm font-semibold text-[#FDFBF0]/80">· {activeChild?.name}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#FDFBF0]">{user.name}</p>
            <p className="text-xs text-[#FDFBF0]/60">{user.subscriptionStatus}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#FDFBF0]/25 flex items-center justify-center text-[#FDFBF0] font-bold text-sm flex-shrink-0 ring-2 ring-[#FDFBF0]/30">
            {user.name[0].toUpperCase()}
          </div>
          <button onClick={logout} className="text-xs text-[#FDFBF0]/70 hover:text-[#FDFBF0] transition hidden sm:block">
            გამოსვლა
          </button>
        </div>
      </header>

      {/* Bottom tab bar – fixed, all screen sizes */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FDFBF0]/95 backdrop-blur border-t border-[#465940]/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex max-w-4xl mx-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${tab === t.key ? 'text-[#465940]' : 'text-[#465940]/60 hover:text-[#465940]/80'}`}>
              <span className="text-xl">{t.icon}</span>
              <span className="text-[10px] font-bold tracking-wide">{t.label}</span>
            </button>
          ))}
          <button onClick={logout}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[#465940]/60 hover:text-[#465940]/80 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            <span className="text-[10px] font-bold">გასვლა</span>
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
        {tab === 'today' && <TodayTab child={activeChild} allDishes={allDishes} planStart={planStart} />}
        {tab === 'nutrition' && <NutritionTab child={activeChild} />}
        {tab === 'shopping' && <ShoppingListTab child={activeChild} planStart={planStart} />}
        {tab === 'child' && <ChildTab children={children} userId={user.id} onUpdate={onChildUpdate} onDelete={onChildDelete} />}
        {tab === 'settings' && <SettingsTab user={user} />}
      </main>
    </div>
  );
}
