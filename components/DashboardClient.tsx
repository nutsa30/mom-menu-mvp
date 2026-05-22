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

const card = 'bg-white rounded-2xl border border-gray-100 shadow-sm';
const btn = 'px-4 py-2 rounded-full text-sm font-bold transition';

// ── Today Tab ──────────────────────────────────────────────────────────────
function TodayTab({ child, allDishes, planStart }: { child: any; allDishes: any[]; planStart: string }) {
  const todayStr = localToday();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [substituteFor, setSubstituteFor] = useState<string | null>(null);
  const [recipeModal, setRecipeModal] = useState<any | null>(null);

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
      <p className="text-gray-400 text-sm">შვილის მიმატება "შვილი" tab-ში.</p>
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
                  isSelected ? 'bg-[#ff7f50] text-white' :
                  isCurrentDay ? 'bg-[#fff1ec] text-[#ff7f50]' :
                  isPast ? 'bg-gray-50 text-gray-400' :
                  'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}>
                <span className="text-[10px] font-black uppercase tracking-wide">{KA_DAYS_SHORT[d.getDay()]}</span>
                <span className="text-lg font-black">{d.getDate()}</span>
                {isCurrentDay && !isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#ff7f50] mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day header */}
      <div className={`${card} p-4 flex items-center justify-between`}>
        <div>
          <p className="text-xs text-gray-400 font-medium" suppressHydrationWarning>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('ka-GE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h2 className="text-lg font-black text-gray-900 mt-0.5">{child.name}-ს კვება</h2>
        </div>
        {total > 0 && (
          <div className="text-right">
            <p className="text-2xl font-black text-[#ff7f50]">{eaten}/{total}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">ჭამა</p>
          </div>
        )}
      </div>

      {/* Meal cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[0,1,2,3].map(i => <div key={i} className={`${card} h-52 animate-pulse`} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MEAL_ORDER.map(mealType => {
            const log = logs.find(l => l.mealType === mealType);
            const dish = log?.dish;
            const ingredient = log?.ingredient;
            const isIngredient = !dish && !!ingredient;
            const imageUrl = dish?.imageUrl ?? ingredient?.imageUrl;
            const titleKa = dish?.titleKa ?? ingredient?.titleKa;
            const calories = dish?.calories ?? ingredient?.calories;
            const proteinGrams = dish?.proteinGrams ?? ingredient?.proteinGrams;
            return (
              <div key={mealType} className={`${card} overflow-hidden`}>
                <button
                  className="relative w-full h-36 bg-[#fef3ef] block text-left group"
                  onClick={() => dish && setRecipeModal(dish)}
                  disabled={!dish}
                >
                  {imageUrl
                    ? <img src={imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">{MEAL_ICON[mealType]}</div>}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-gray-700">
                    {MEAL_ICON[mealType]} {MEAL_LABEL[mealType]}
                  </span>
                  {log?.wasEaten && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">✓ ჭამა</span>
                  )}
                  {dish && (
                    <span className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition">
                      სრული →
                    </span>
                  )}
                </button>
                <div className="p-4">
                  {titleKa
                    ? <p className="font-bold text-gray-900 text-sm mb-1 leading-snug">{titleKa}</p>
                    : <p className="text-sm text-gray-400 mb-1 italic">კერძი ვერ მოიძებნა</p>}
                  {calories && <p className="text-xs text-gray-400 mb-3">{calories} kcal{proteinGrams ? ` · ${proteinGrams}g ცილა` : ''}</p>}
                  {log && selectedDate === todayStr && (
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => markEaten(log.id, !log.wasEaten)}
                        className={`${btn} text-xs ${log.wasEaten ? 'bg-green-100 text-green-700' : 'bg-[#ff7f50] text-white hover:bg-[#e86e40]'}`}>
                        {log.wasEaten ? '✓ ჭამა' : 'ჭამა'}
                      </button>
                      {!isIngredient && (
                        <button onClick={() => setSubstituteFor(log.id)}
                          className={`${btn} text-xs bg-gray-100 text-gray-600 hover:bg-gray-200`}>
                          სხვა კერძი
                        </button>
                      )}
                    </div>
                  )}
                  {log?.wasEaten && selectedDate !== todayStr && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold mt-1">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ჭამა
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Substitute modal */}
      {substituteFor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSubstituteFor(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-gray-900">სხვა კერძი — {MEAL_LABEL[subLog?.mealType ?? '']}</h3>
                <button onClick={() => setSubstituteFor(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>
              <p className="text-[11px] text-gray-400">დალაგებულია ვიტამინების მსგავსობის მიხედვით — ვიტამინების გეგმა არ ირღვევა</p>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {displayDishes.length === 0 && <p className="text-gray-400 text-sm text-center py-8">სხვა კერძი ვერ მოიძებნა</p>}
              {displayDishes.map((d: any) => (
                <button key={d.id} onClick={() => substitute(substituteFor, d.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-[#fef3ef] transition text-left border border-transparent hover:border-[#ff7f50]/20">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {d.imageUrl ? <img src={d.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{d.titleKa}</p>
                    {d.calories && <p className="text-xs text-gray-400">{d.calories} kcal{d.proteinGrams ? ` · ${d.proteinGrams}g ცილა` : ''}</p>}
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
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="relative h-48 bg-[#fdf0ea] flex-shrink-0">
              {recipeModal.imageUrl
                ? <img src={recipeModal.imageUrl} alt={recipeModal.titleKa} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>}
              <button onClick={() => setRecipeModal(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition">✕</button>
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90`}>
                {MEAL_ICON[recipeModal.mealType]} {MEAL_LABEL[recipeModal.mealType]}
              </span>
            </div>
            <div className="overflow-y-auto p-6 space-y-5">
              <h2 className="text-xl font-black text-[#7c3a1e]">{recipeModal.titleKa}</h2>
              {recipeModal.ingredientsKa?.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-[#ff7f50] mb-2">ინგრედიენტები</p>
                  <ul className="space-y-1.5">
                    {recipeModal.ingredientsKa.map((ing: string, i: number) => (
                      <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-black flex items-center justify-center mt-0.5">{i+1}</span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recipeModal.descriptionKa && (
                <div>
                  <p className="text-sm font-bold text-[#ff7f50] mb-2">მომზადების წესი</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{recipeModal.descriptionKa}</p>
                </div>
              )}
              {recipeModal.calories && (
                <div>
                  <p className="text-sm font-bold text-[#ff7f50] mb-2">კვებითი ღირებულება</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: recipeModal.calories, label: 'კალორია', unit: 'kcal', color: 'bg-orange-50 text-orange-600' },
                      { v: recipeModal.proteinGrams, label: 'ცილა', unit: 'g', color: 'bg-blue-50 text-blue-600' },
                      { v: recipeModal.carbsGrams, label: 'ნახშირწყ.', unit: 'g', color: 'bg-yellow-50 text-yellow-600' },
                      { v: recipeModal.fatGrams, label: 'ცხიმი', unit: 'g', color: 'bg-purple-50 text-purple-600' },
                      { v: recipeModal.ironMg, label: 'რკინა', unit: 'mg', color: 'bg-red-50 text-red-500' },
                      { v: recipeModal.calciumMg, label: 'კალციუმი', unit: 'mg', color: 'bg-green-50 text-green-600' },
                      { v: recipeModal.vitaminCmg, label: 'C ვიტ.', unit: 'mg', color: 'bg-orange-50 text-orange-500' },
                      { v: recipeModal.vitaminAmcg, label: 'A ვიტ.', unit: 'mcg', color: 'bg-amber-50 text-amber-600' },
                    ].filter(n => n.v).map(({ v, label, unit, color }) => (
                      <div key={label} className={`${color.split(' ')[0]} rounded-xl p-3 text-center`}>
                        <p className={`text-base font-black ${color.split(' ')[1]}`}>{v}{unit}</p>
                        <p className="text-xs text-gray-500">{label}</p>
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

// ── Shopping List Tab ────────────────────────────────────────────────────────
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
      <p className="text-gray-400 text-sm">შვილის მიმატება "შვილი" tab-ში.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-xl font-black text-gray-900">🛒 საყიდლების სია</h2>
            <p className="text-xs text-gray-400 mt-0.5">{child.name} · მომდევნო 7 დღის გეგმა</p>
          </div>
          <button onClick={regenerate} disabled={loading}
            className={`${btn} bg-[#ff7f50] text-white text-sm hover:bg-[#e86e40] disabled:opacity-60`}>
            {loading ? '⏳ იტვირთება...' : '🔄 განახლება'}
          </button>
        </div>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-sm text-red-600 font-semibold">შეცდომა: {apiError}</p>
          <p className="text-xs text-red-400 mt-1">სცადე "განახლება" ღილაკი</p>
        </div>
      )}

      {loading && (
        <div className={`${card} p-8 text-center`}>
          <div className="text-4xl mb-3 animate-bounce">🛒</div>
          <p className="text-sm text-gray-500">7 დღის კვების გეგმა მზადდება...</p>
        </div>
      )}

      {generated && !loading && (
        <>
          <div className={`${card} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-700">{ingredients.length - doneCount} დარჩენილი / {ingredients.length} სულ</p>
              {doneCount > 0 && (
                <button onClick={clearBought} className="text-xs text-gray-400 hover:text-gray-600 transition">გასუფთავება</button>
              )}
            </div>

            <div className="h-2 bg-gray-100 rounded-full mb-5 overflow-hidden">
              <div className="h-2 bg-[#ff7f50] rounded-full transition-all"
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
                      isDone ? 'bg-green-50 border border-green-100' : 'bg-[#fef8f5] border border-transparent'
                    }`}>

                    {/* Name — tap to +1 (quantified) or toggle (simple) */}
                    <button
                      className="flex-1 flex items-center gap-3 text-left min-w-0"
                      onClick={() => parsed ? adjust(item.display, 1, neededQty) : toggleSimple(item.display)}>
                      {!parsed && (
                        <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                          isDone ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        }`}>
                          {isDone && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                      )}
                      <span className={`text-sm font-medium truncate transition ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {item.display}
                      </span>
                    </button>

                    {/* Stepper for quantified items */}
                    {parsed ? (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => adjust(item.display, -1, neededQty)}
                          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center transition text-base leading-none">
                          −
                        </button>
                        <span className={`text-xs font-bold text-center leading-tight ${isDone ? 'text-green-600' : 'text-[#ff7f50]'}`}
                          style={{ minWidth: '52px' }}>
                          {boughtQty} / {parsed.qty}{parsed.unit ? ` ${parsed.unit}` : ''}
                        </span>
                        <button onClick={() => adjust(item.display, 1, neededQty)}
                          className={`w-7 h-7 rounded-full text-white font-bold flex items-center justify-center transition text-base leading-none ${
                            isDone ? 'bg-green-500 hover:bg-green-600' : 'bg-[#ff7f50] hover:bg-[#e86e40]'
                          }`}>
                          +
                        </button>
                      </div>
                    ) : (
                      item.amount && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          isDone ? 'bg-gray-100 text-gray-400' : 'bg-[#fff1ec] text-[#ff7f50]'
                        }`}>
                          {item.amount}
                        </span>
                      )
                    )}
                  </div>
                );
              })}

              {ingredients.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-6">ინგრედიენტები ვერ მოიძებნა</p>
              )}
            </div>
          </div>

          {doneCount === ingredients.length && ingredients.length > 0 && (
            <div className={`${card} p-6 text-center bg-green-50 border border-green-100`}>
              <p className="text-2xl mb-2">🎉</p>
              <p className="font-bold text-green-700">ყველაფერი შეძენილია!</p>
              <p className="text-sm text-green-600 mt-1">კვირის კვების გეგმა მზადაა.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Nutrition Tab ───────────────────────────────────────────────────────────
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
      <p className="text-gray-400 text-sm">შვილის მიმატება "შვილი" tab-ში.</p>
    </div>
  );

  const deficient = data?.analysis?.filter((a: any) => a.pct < 70) ?? [];

  const uniqueDays = data?.uniqueDays ?? 0;

  return (
    <div className="space-y-5">
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-black text-gray-900">კვებითი ბალანსი</h2>
          <div className="flex gap-2">
            {[7, 14, 30].map((d) => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${days === d ? 'bg-[#ff7f50] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {d} დღე
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">{child.name} · {uniqueDays} / {days} დღე შევსებულია</p>
      </div>

      {deficient.length > 0 && uniqueDays > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="font-bold text-amber-800 mb-2">⚠️ ნაკლები {days} დღეში</p>
          <div className="space-y-1">
            {deficient.map((a: any) => (
              <p key={a.key} className="text-sm text-amber-700">
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
                <span className="text-sm font-semibold text-gray-700">{NUTRIENT_LABELS[a.key]}</span>
                <span className="text-xs text-gray-500">{a.consumed} / {a.recommended} {NUTRIENT_UNIT[a.key]}</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${a.pct >= 100 ? 'bg-green-500' : a.pct >= 70 ? 'bg-[#ff7f50]' : 'bg-red-400'}`}
                  style={{ width: `${Math.min(100, a.pct)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5 text-right">{a.pct}%</p>
            </div>
          ))}
        </div>
      ) : null}

      {uniqueDays === 0 && !loading && (
        <div className={`${card} p-10 text-center`}>
          <p className="text-2xl mb-3">📊</p>
          <p className="font-bold text-gray-700 mb-1">ჯერ ჩანაწერი არ არის</p>
          <p className="text-sm text-gray-400">მონიშნე "დღის გეგმა" tab-ში "ჭამა" და აქ გამოჩნდება კვებითი ბალანსი.</p>
        </div>
      )}
    </div>
  );
}

// ── Tag Input component ─────────────────────────────────────────────────────
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
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7f50] text-sm" />
        <button type="button" onClick={add} className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-600 transition">+</button>
      </div>
    </div>
  );
}

// ── Child Tab ───────────────────────────────────────────────────────────────
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
          <h2 className="text-xl font-black text-gray-900">შვილები</h2>
          <button onClick={() => setNewChildMode(true)}
            className="bg-[#ff7f50] hover:bg-[#e86e40] text-white px-4 py-2 rounded-full text-sm font-bold transition">+ მიმატება</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {kids.map((c) => (
            <button key={c.id} onClick={() => setViewModal(c)}
              className="px-4 py-2 rounded-full text-sm font-bold transition bg-gray-100 text-gray-700 hover:bg-[#fff1ec] hover:text-[#ff7f50]">
              {c.name}
            </button>
          ))}
          {kids.length === 0 && <p className="text-gray-400 text-sm">ჯერ შვილი არ გაქვს დამატებული.</p>}
        </div>
      </div>

      {/* Add new child */}
      {newChildMode && (
        <div className={`${card} p-5`}>
          <h3 className="font-bold text-gray-800 mb-4">ახალი შვილის მიმატება</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">სახელი</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7f50] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">დაბადების თარიღი</label>
              <input type="date" value={newBirth} onChange={(e) => setNewBirth(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7f50] text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addChild} disabled={addingChild}
              className="bg-[#ff7f50] hover:bg-[#e86e40] text-white px-5 py-2.5 rounded-full text-sm font-bold transition disabled:opacity-60">
              {addingChild ? 'ემატება...' : 'დამატება'}
            </button>
            <button onClick={() => setNewChildMode(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-full text-sm font-bold transition">გაუქმება</button>
          </div>
        </div>
      )}

      {/* Edit form — only shown after clicking "რედაქტირება" in modal */}
      {selected && (
        <div className={`${card} p-5 space-y-5`}>
          <div className="flex items-center justify-between">
            <h3 className="font-black text-gray-900">{selected.name}-ს რედაქტირება</h3>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">სახელი</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7f50] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">დაბადების თარიღი</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7f50] text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🚨 ალერგიები</label>
            <TagInput tags={allergies} onChange={setAllergies} color="bg-red-100 text-red-700" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">😤 არ უყვარს</label>
            <TagInput tags={dislikes} onChange={setDislikes} color="bg-orange-100 text-orange-700" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">😋 უყვარს</label>
            <TagInput tags={likes} onChange={setLikes} color="bg-green-100 text-green-700" />
          </div>
          <button onClick={save} disabled={saving}
            className="w-full bg-[#ff7f50] hover:bg-[#e86e40] text-white py-3 rounded-full font-bold text-sm transition disabled:opacity-60">
            {saving ? 'ინახება...' : 'შენახვა'}
          </button>
        </div>
      )}

      {/* View modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setViewModal(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="bg-[#fff1ec] px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#ff7f50] font-bold uppercase tracking-wide mb-0.5">შვილის პროფილი</p>
                <h3 className="text-xl font-black text-gray-900">{viewModal.name}</h3>
              </div>
              <button onClick={() => setViewModal(null)} className="w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-gray-500 text-xl leading-none transition">×</button>
            </div>

            {/* Info rows */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">დაბადების თარიღი</p>
                <p className="text-sm font-bold text-gray-800">{fmtDate(viewModal.birthDate)}</p>
              </div>

              {viewModal.allergies?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">🚨 ალერგიები</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewModal.allergies.map((a: string) => (
                      <span key={a} className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewModal.dislikes?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">😤 არ უყვარს</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewModal.dislikes.map((d: string) => (
                      <span key={d} className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">{d}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewModal.likes?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">😋 უყვარს</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewModal.likes.map((l: string) => (
                      <span key={l} className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">{l}</span>
                    ))}
                  </div>
                </div>
              )}

              {!viewModal.allergies?.length && !viewModal.dislikes?.length && !viewModal.likes?.length && (
                <p className="text-sm text-gray-400 italic">დამატებითი ინფორმაცია არ არის შეყვანილი</p>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => openEdit(viewModal)}
                className="flex-1 bg-[#ff7f50] hover:bg-[#e86e40] text-white py-3 rounded-full font-bold text-sm transition">
                რედაქტირება
              </button>
              <button onClick={() => deleteChild(viewModal)} disabled={deleting}
                className="flex-1 border border-red-200 text-red-500 hover:bg-red-50 py-3 rounded-full font-bold text-sm transition disabled:opacity-60">
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
    if (!email.trim() || !email.includes('@')) { setEmailError('სწორი ელფოსტა შეიყვანე'); setEmailStatus('error'); return; }
    setEmailStatus('saving'); setEmailError('');
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const d = await res.json();
      setEmailError(d.error === 'email_taken' ? 'ეს ელფოსტა უკვე გამოიყენება' : 'შეცდომა. სცადე თავიდან.');
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

  const inp = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7f50] transition text-sm';

  return (
    <div className="space-y-5 max-w-lg">
      {/* Name */}
      <div className={`${card} p-6`}>
        <h2 className="font-black text-gray-900 mb-4">სახელი</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inp} />
        <button onClick={saveName} disabled={nameStatus === 'saving'}
          className="mt-3 bg-[#ff7f50] hover:bg-[#e86e40] text-white px-6 py-2.5 rounded-full text-sm font-bold transition disabled:opacity-60">
          {nameStatus === 'saving' ? 'ინახება...' : nameStatus === 'ok' ? '✓ შენახვა' : 'შენახვა'}
        </button>
      </div>

      {/* Email */}
      <div className={`${card} p-6`}>
        <h2 className="font-black text-gray-900 mb-4">ელფოსტა</h2>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} />
        {emailStatus === 'error' && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        <button onClick={saveEmail} disabled={emailStatus === 'saving'}
          className="mt-3 bg-[#ff7f50] hover:bg-[#e86e40] text-white px-6 py-2.5 rounded-full text-sm font-bold transition disabled:opacity-60">
          {emailStatus === 'saving' ? 'ინახება...' : emailStatus === 'ok' ? '✓ შენახვა' : 'შენახვა'}
        </button>
      </div>

      {/* Change password */}
      <div className={`${card} p-6`}>
        <h2 className="font-black text-gray-900 mb-4">პაროლის შეცვლა</h2>
        {pwStatus === 'ok' && <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">პაროლი შეიცვალა ✓</div>}
        <form onSubmit={changePassword} className="space-y-3">
          <input type="password" placeholder="მიმდინარე პაროლი" value={pwCur} onChange={(e) => setPwCur(e.target.value)} required className={inp} />
          <input type="password" placeholder="ახალი პაროლი" value={pwNew} onChange={(e) => setPwNew(e.target.value)} required minLength={6} className={inp} />
          <input type="password" placeholder="გაიმეოროს ახალი პაროლი" value={pwConf} onChange={(e) => setPwConf(e.target.value)} required className={inp} />
          {pwStatus === 'error' && <p className="text-red-500 text-sm">{pwError}</p>}
          <button type="submit" disabled={pwStatus === 'loading'}
            className="w-full bg-[#ff7f50] hover:bg-[#e86e40] text-white py-3 rounded-full font-bold text-sm transition disabled:opacity-60">
            {pwStatus === 'loading' ? 'იცვლება...' : 'პაროლის განახლება'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className={`${card} p-6`}>
        <h2 className="font-black text-gray-900 mb-3">ანგარიში</h2>
        <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">სტატუსი:</span> {user.subscriptionStatus}</p>
      </div>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────
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
      // Plan expired — start fresh
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
    <div className="min-h-screen bg-[#fef8f5] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <a href="/" className="text-xl font-black tracking-tight">
            <span style={{ color: '#2b1d18' }}>mo</span><span className="text-orange-500">M</span><span style={{ color: '#2b1d18' }}>eals</span>
          </a>
          {children.length > 1 && (
            <select value={activeChild?.id ?? ''} onChange={(e) => setActiveChild(children.find((c) => c.id === e.target.value) ?? null)}
              className="ml-4 text-sm border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-[#ff7f50]">
              {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {children.length === 1 && <span className="text-sm text-gray-500 ml-2">· {activeChild?.name}</span>}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-400">{user.subscriptionStatus}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#ff7f50] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user.name[0].toUpperCase()}
          </div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600 transition hidden sm:block">გამოსვლა</button>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="bg-white border-b border-gray-100 px-4 flex gap-1 sticky top-[65px] z-20">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-3.5 text-sm font-bold border-b-2 transition ${tab === t.key ? 'border-[#ff7f50] text-[#ff7f50]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <span className="sm:hidden">{t.icon}</span>
            <span className="hidden sm:inline">{t.icon} {t.label}</span>
          </button>
        ))}
        <button onClick={logout} className="ml-auto px-4 py-3.5 text-sm text-gray-400 hover:text-gray-600 sm:hidden">გამოსვლა</button>
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
