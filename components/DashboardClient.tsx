'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FirstFoodsTab from './FirstFoodsTab';
import BabyRecipesTab from './BabyRecipesTab';

// Use local date (not UTC) to avoid timezone issues (e.g. Georgia is UTC+4)
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Exact calendar-month count, not a day-average approximation.
function ageInMonths(birthDate: string | Date): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months--;
  return Math.max(0, months);
}

type Tab = 'today' | 'firstfoods' | 'recipes' | 'nutrition' | 'shopping' | 'child' | 'settings';

const MEAL_ORDER = ['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER'] as const;
const MEAL_LABEL: Record<string, string> = { BREAKFAST: 'საუზმე', SNACK: 'სნექი', LUNCH: 'სადილი', DINNER: 'ვახშამი' };
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

// ── Introduction Banner (6-9mo) ──────────────────────────────────────────
function IntroductionBanner({ childId, childName }: { childId: string; childName: string }) {
  const [intro, setIntro] = useState<any | null>(undefined);

  useEffect(() => {
    fetch(`/api/food-introduction?childId=${childId}`)
      .then(r => r.json())
      .then(data => {
        const active = Array.isArray(data) ? data.find((i: any) => i.status === 'INTRODUCING') : null;
        setIntro(active ?? null);
      })
      .catch(() => setIntro(null));
  }, [childId]);

  if (intro === undefined) return null;

  const daysSince = intro ? Math.floor((Date.now() - new Date(intro.startedAt).getTime()) / 86400000) : 0;
  const readyForNext = daysSince >= 3;

  // Suggested first foods for 6-9mo
  const FIRST_FOODS = ['გოგრა', 'კარტოფილი', 'სტაფილო', 'ბრინჯის ფაფა', 'შვრია', 'ვაშლი', 'მსხალი', 'ბანანი', 'ბოლოქი'];
  const tried = new Set<string>();

  return (
    <div className={`${card} p-4 border-2 border-[#465940]/30`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl"></span>
        <div>
          <p className="font-black text-[#465940] text-sm">პირველი საკვების გაცნობა</p>
          <p className="text-[10px] text-[#465940]/60">ყოველ ახალ პროდუქტს 3 დღე მიეცი — შემდეგ გადავიდე შემდეგზე</p>
        </div>
      </div>

      {intro ? (
        <div className={`rounded-xl p-3 ${readyForNext ? 'bg-green-50 border border-green-200' : 'bg-[#465940]/5'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-[#465940] text-sm">ახლა: <span className="text-[#465940]">{intro.foodName}</span></p>
              <p className="text-xs text-[#465940]/60 mt-0.5">
                {daysSince} დღე · {readyForNext ? 'მზადაა შემდეგ პროდუქტზე გადასასვლელად!' : `კიდევ ${3 - daysSince} დღე`}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${
              readyForNext ? 'bg-green-500 text-white' : 'bg-[#465940]/15 text-[#465940]'
            }`}>{daysSince}/3</div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs text-[#465940]/70 mb-2">შემდეგი შეარჩიე და "შვილი" ჩანართში დაამატე:</p>
          <div className="flex flex-wrap gap-1.5">
            {FIRST_FOODS.map(f => (
              <span key={f} className="text-xs bg-[#465940]/10 text-[#465940] px-2.5 py-1 rounded-full font-semibold">{f}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Today Tab ────────────────────────────────────────────────────────────
function TodayTab({ child, allDishes, planStart, isFullPlan }: { child: any; allDishes: any[]; planStart: string; isFullPlan: boolean }) {
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
  const isToday = selectedDate === todayStr;
  const isFutureDay = selectedDate > todayStr;

  useEffect(() => {
    const today = localToday();
    setSelectedDate(weekDays.includes(today) ? today : weekDays[0]);
  }, [planStart, child?.id]);

  const fetchLogs = useCallback(async (date: string) => {
    if (!child || !isFullPlan) return;
    setLoading(true);
    const res = await fetch(`/api/daily-log?childId=${child.id}&date=${date}`);
    const data = await res.json();
    setLogs(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [child?.id, isFullPlan]);

  useEffect(() => {
    if (!child) return;
    fetch(`/api/seasonal-fruits?childId=${child.id}`)
      .then(r => r.json())
      .then(d => setSeasonalData(d))
      .catch(() => {});
  }, [child?.id]);

  useEffect(() => { fetchLogs(selectedDate); }, [fetchLogs, selectedDate]);

  // Pre-generate all 7 days sequentially to avoid exhausting Neon connection pool
  useEffect(() => {
    if (!child || !isFullPlan) return;
    let cancelled = false;
    const prefetch = async () => {
      for (const date of weekDays) {
        if (cancelled) break;
        try { await fetch(`/api/daily-log?childId=${child.id}&date=${date}`); } catch {}
      }
    };
    prefetch();
    return () => { cancelled = true; };
  }, [child?.id, planStart, isFullPlan]);

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

  if (!isFullPlan) return (
    <div className={`${card} p-10 text-center`}>
      <div className="w-16 h-16 rounded-full bg-[#465940] flex items-center justify-center text-3xl mx-auto mb-5"></div>
      <h2 className="text-xl font-black text-[#465940] mb-2">დღის კვების გეგმა დაბლოკილია</h2>
      <p className="text-[#465940]/70 text-sm mb-6 max-w-sm mx-auto">ყოველდღიური კვების გეგმის ავტომატური გენერაცია ხელმისაწვდომია მხოლოდ სრული პაკეტით.</p>
      <a href="/subscription" className="inline-flex items-center justify-center rounded-full bg-[#465940] px-8 py-3 font-semibold text-[#FDFBF0] shadow-lg hover:scale-105 transition">
        პაკეტის განახლება
      </a>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Week selector */}
      <div className={`${card} p-4`}>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekDays.map(date => {
            const d = new Date(date + 'T12:00:00');
            const isCurrentDay = date === todayStr;
            const isSelected = date === selectedDate;
            const isPast = date < todayStr;
            return (
              <button key={date} onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center px-1 py-2 rounded-2xl transition ${
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
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#465940]/10 text-[#465940]">
                      {MEAL_LABEL[mealType]}
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

                  {/* Actions — only today is fully interactive */}
                  {log && !isFutureDay && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => isToday && markEaten(log.id, !log.wasEaten)}
                        disabled={!isToday}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${!isToday ? 'cursor-default' : ''} ${
                          eaten
                            ? 'bg-[#465940] text-[#FDFBF0] hover:bg-[#465940]/80'
                            : 'bg-[#465940]/10 text-[#465940] hover:bg-[#465940] hover:text-[#FDFBF0]'
                        }`}
                      >
                        {eaten ? '✓ ჭამა' : 'ჭამა'}
                      </button>
                      {!isIngredient && isToday && (
                        <button
                          onClick={() => setSubstituteFor(log.id)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940] hover:bg-[#465940] hover:text-[#FDFBF0] transition"
                        >
                          სხვა
                        </button>
                      )}
                      {dish && isToday && (
                        <button
                          onClick={() => setRecipeModal(dish)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940] hover:bg-[#465940] hover:text-[#FDFBF0] transition"
                        >
                          რეცეპტი
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Right – circular image */}
                <button
                  className={`flex-shrink-0 w-[72px] h-[72px] rounded-full overflow-hidden bg-[#f0f8ee] transition ${dish && isToday ? 'hover:ring-2 hover:ring-[#465940]/40' : ''}`}
                  onClick={() => dish && isToday && setRecipeModal(dish)}
                  disabled={!dish || !isToday}
                >
                  {imageUrl
                    ? <img src={imageUrl} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full bg-[#465940]/10" />
                  }
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Introduction mode — only for 6-9 month olds */}
      {child.ageGroup === 'FROM_6' && (
        <IntroductionBanner childId={child.id} childName={child.name} />
      )}

      {/* Seasonal fruit suggestion */}
      {seasonalData?.fruits?.length > 0 && (
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{seasonalData.seasonIcon}</span>
            <div>
              <h3 className="font-black text-[#465940] text-sm">{SEASON_GENITIVE_KA[seasonalData.seasonKa] ?? seasonalData.seasonKa} სეზონური ხილი</h3>
              <p className="text-[10px] text-[#465940]/60">შეათავაზე ბავშვს დამატებით — ვიტამინებით მდიდარი</p>
            </div>
          </div>
          <div className="space-y-3">
            {seasonalData.fruits.map((f: any) => (
              <div key={f.id} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#465940]/10">
                  {f.imageUrl
                    ? <img src={f.imageUrl} alt={f.titleKa} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg"></div>}
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
                  className="group w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-[#465940] transition text-left border border-transparent hover:border-[#465940]">
                  <div className="w-12 h-12 rounded-xl bg-[#465940]/10 overflow-hidden flex-shrink-0">
                    {d.imageUrl ? <img src={d.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xl"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#465940] group-hover:text-[#FDFBF0] text-sm truncate transition-colors">{d.titleKa}</p>
                    {d.calories && <p className="text-xs text-[#465940]/60 group-hover:text-[#FDFBF0]/70 transition-colors">{d.calories} kcal{d.proteinGrams ? ` · ${d.proteinGrams}g ცილა` : ''}</p>}
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
                : <div className="w-full h-full flex items-center justify-center text-6xl"></div>}
              <button onClick={() => setRecipeModal(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-[#FDFBF0] transition">✕</button>
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FDFBF0]/90`}>
                {MEAL_LABEL[recipeModal.mealType]}
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

function ShoppingListTab({ child, planStart }: { child: any; planStart: string }) {
  const STORE_KEY = child ? `shopping_${child.id}` : null;

  const [ingredients, setIngredients] = useState<IngItem[]>([]);
  const [bought, setBought] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [apiError, setApiError] = useState('');

  const saveLocal = (ing: IngItem[], bt: Record<string, boolean>) => {
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

  const toggle = (display: string) => {
    setBought(prev => {
      const next = { ...prev, [display]: !prev[display] };
      saveLocal(ingredients, next);
      return next;
    });
  };

  const doneCount = ingredients.filter(item => bought[item.display]).length;

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
            <h2 className="text-xl font-black text-[#465940]">საყიდლების სია</h2>
            <p className="text-xs text-[#465940]/60 mt-0.5">{child.name} · მომდევნო 7 დღის გეგმა</p>
          </div>
          <button onClick={regenerate} disabled={loading}
            className={`${btn} bg-[#465940] text-[#FDFBF0] text-sm hover:bg-[#465940] disabled:opacity-60`}>
            {loading ? '⏳ იტვირთება...' : 'განახლება'}
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
          <div className="text-4xl mb-3 animate-bounce"></div>
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
                const isDone = !!bought[item.display];

                return (
                  <div key={item.display}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      isDone ? 'bg-[#465940]/10 border border-[#465940]/30' : 'bg-[#465940] border border-transparent'
                    }`}>

                    <button
                      className="flex-1 flex items-center gap-3 text-left min-w-0"
                      onClick={() => toggle(item.display)}>
                      <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                        isDone ? 'bg-[#465940] border-[#465940]' : 'border-[#FDFBF0]/60'
                      }`}>
                        {isDone && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </span>
                      <span className={`text-sm font-medium truncate transition ${isDone ? 'line-through text-[#465940]/60' : 'text-[#FDFBF0]'}`}>
                        {item.display}
                      </span>
                    </button>
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
              <p className="text-2xl mb-2"></p>
              <p className="font-bold text-[#465940]">ყველაფერი შეძენილი!</p>
              <p className="text-sm text-[#465940] mt-1">კვირის კვების გეგმა მზადაა.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// WHO/AAP daily requirements by ageGroup
const AGE_REQUIREMENTS: Record<string, { label: string; values: { nutrient: string; amount: string; note?: string }[] }> = {
  FROM_6: {
    label: '6–8 თვე',
    values: [
      { nutrient: 'კალორია', amount: '600–800 kcal' },
      { nutrient: 'რკინა', amount: '11 მგ', note: 'ყველაზე მნიშვნელოვანი' },
      { nutrient: 'ცილა', amount: '9.1 გ' },
      { nutrient: 'კალციუმი', amount: '200 მგ' },
      { nutrient: 'D ვიტამინი', amount: '10 მკგ' },
      { nutrient: 'C ვიტამინი', amount: '40 მგ' },
      { nutrient: 'A ვიტამინი', amount: '400 მკგ' },
      { nutrient: 'ბოჭკო', amount: '—', note: 'ჯერ არ სჭირდება' },
    ],
  },
  FROM_9: {
    label: '9–11 თვე',
    values: [
      { nutrient: 'კალორია', amount: '700–900 kcal' },
      { nutrient: 'რკინა', amount: '11 მგ', note: 'კვლავ კრიტიკული' },
      { nutrient: 'ცილა', amount: '11 გ' },
      { nutrient: 'კალციუმი', amount: '260 მგ' },
      { nutrient: 'D ვიტამინი', amount: '10 მკგ' },
      { nutrient: 'C ვიტამინი', amount: '50 მგ' },
      { nutrient: 'A ვიტამინი', amount: '500 მკგ' },
      { nutrient: 'ომეგა-3', amount: '500 მგ' },
    ],
  },
  FROM_12: {
    label: '1–2 წელი',
    values: [
      { nutrient: 'კალორია', amount: '1000–1400 kcal' },
      { nutrient: 'რკინა', amount: '7 მგ' },
      { nutrient: 'ცილა', amount: '13 გ' },
      { nutrient: 'კალციუმი', amount: '700 მგ' },
      { nutrient: 'D ვიტამინი', amount: '15 მკგ' },
      { nutrient: 'C ვიტამინი', amount: '15 მგ' },
      { nutrient: 'A ვიტამინი', amount: '300 მკგ' },
      { nutrient: 'ბოჭკო', amount: '19 გ' },
    ],
  },
  FROM_24: {
    label: '2–3 წელი',
    values: [
      { nutrient: 'კალორია', amount: '1000–1400 kcal' },
      { nutrient: 'რკინა', amount: '7 მგ' },
      { nutrient: 'ცილა', amount: '13 გ' },
      { nutrient: 'კალციუმი', amount: '700 მგ' },
      { nutrient: 'D ვიტამინი', amount: '15 მკგ' },
      { nutrient: 'C ვიტამინი', amount: '15 მგ' },
      { nutrient: 'A ვიტამინი', amount: '300 მკგ' },
      { nutrient: 'ბოჭკო', amount: '19 გ' },
    ],
  },
};

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
                  className="h-full rounded-full transition-all duration-500 bg-[#465940]"
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
          <p className="text-2xl mb-3"></p>
          <p className="font-bold text-[#465940] mb-1">ჯერ ჩანაწერი არ არის</p>
          <p className="text-sm text-[#465940]/60">მონიშნე "დღის გეგმა" tab-ში "ჭამა" ერთხელ მაინც რომ გამოჩნდეს კვებითი ბალანსი.</p>
        </div>
      )}

      {/* Age-specific requirements */}
      {AGE_REQUIREMENTS[child.ageGroup] && (
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl"></span>
            <div>
              <h3 className="font-black text-[#465940] text-sm">დღიური ნორმა — {AGE_REQUIREMENTS[child.ageGroup].label}</h3>
              <p className="text-[10px] text-[#465940]/60">WHO / AAP რეკომენდაციების მიხედვით</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {AGE_REQUIREMENTS[child.ageGroup].values.map(v => (
              <div key={v.nutrient} className="bg-[#465940]/5 rounded-xl p-3">
                <p className="text-xs font-bold text-[#465940]">{v.nutrient}</p>
                <p className="text-sm font-black text-[#465940] mt-0.5">{v.amount}</p>
                {v.note && <p className="text-[10px] text-[#465940]/60 mt-0.5">{v.note}</p>}
              </div>
            ))}
          </div>
          {child.milkType && child.milkType !== 'NONE' && !child.milkStopped && (
            <div className="mt-3 p-3 rounded-xl bg-[#465940]/10 flex items-center gap-2">
              <span></span>
              <p className="text-xs text-[#465940]/80 font-medium">
                {child.milkType === 'BREAST' ? 'დედის რძე' : child.milkType === 'FORMULA' ? 'ფორმულა' : 'დედის რძე + ფორმულა'} — ავსებს ვიტამინების ნაწილს
              </p>
            </div>
          )}
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
          className="flex-1 px-3 py-2 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm settings-input" />
        <button type="button" onClick={add} className="px-3 py-2 rounded-xl bg-[#465940]/10 hover:bg-[#465940]/15 text-sm font-bold text-[#465940]/80 transition">+</button>
      </div>
    </div>
  );
}

const MILK_OPTIONS = [
  { value: 'BREAST',  label: 'დედის რძე' },
  { value: 'FORMULA', label: 'ფორმულა' },
  { value: 'BOTH',    label: 'ორივე' },
  { value: 'NONE',    label: 'მხოლოდ მყარი' },
];

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
  const [milkType, setMilkType] = useState('BREAST');
  const [milkStopped, setMilkStopped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newChildMode, setNewChildMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBirth, setNewBirth] = useState('');
  const [newAllergies, setNewAllergies] = useState<string[]>([]);
  const [newDislikes, setNewDislikes] = useState<string[]>([]);
  const [newLikes, setNewLikes] = useState<string[]>([]);
  const [addingChild, setAddingChild] = useState(false);
  const [newBirthError, setNewBirthError] = useState('');

  // Food introduction state
  const [introductions, setIntroductions] = useState<any[]>([]);
  const [introChild, setIntroChild] = useState<any | null>(null);
  const [newFood, setNewFood] = useState('');
  const [addingFood, setAddingFood] = useState(false);
  const [introLoading, setIntroLoading] = useState(false);

  const loadIntroductions = async (child: any) => {
    setIntroChild(child);
    setIntroLoading(true);
    const res = await fetch(`/api/food-introduction?childId=${child.id}`);
    const data = await res.json();
    setIntroductions(Array.isArray(data) ? data : []);
    setIntroLoading(false);
  };

  const addFood = async () => {
    if (!newFood.trim() || !introChild) return;
    setAddingFood(true);
    const res = await fetch('/api/food-introduction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId: introChild.id, foodName: newFood.trim() }),
    });
    const item = await res.json();
    if (item.id) {
      setIntroductions(prev => [item, ...prev.filter(i => i.status !== 'INTRODUCING')]);
      setNewFood('');
    }
    setAddingFood(false);
  };

  const updateFoodStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/food-introduction?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    setIntroductions(prev => prev.map(i => i.id === id ? updated : i));
  };

  const deleteFood = async (id: string) => {
    await fetch(`/api/food-introduction?id=${id}`, { method: 'DELETE' });
    setIntroductions(prev => prev.filter(i => i.id !== id));
  };

  // Days since introduction started
  const daysSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const openEdit = (child: any) => {
    setViewModal(null);
    setSelected(child);
    setName(child.name);
    setBirthDate(child.birthDate ? new Date(child.birthDate).toISOString().split('T')[0] : '');
    setAllergies(child.allergies ?? []);
    setDislikes(child.dislikes ?? []);
    setLikes(child.likes ?? []);
    setMilkType(child.milkType ?? 'BREAST');
    setMilkStopped(child.milkStopped ?? false);
    loadIntroductions(child);
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
      body: JSON.stringify({ name, birthDate, allergies, dislikes, likes, milkType, milkStopped }),
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
    setNewBirthError('');
    const birth = new Date(newBirth);
    const now = new Date();
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (now.getDate() < birth.getDate()) months--;
    if (months < 6) {
      setNewBirthError('საიტის კონტენტი დაწყებულია 6 თვის ასაკიდან — უფრო პატარა ბავშვის დამატება ჯერ ვერ იქნება შესაძლებელი.');
      return;
    }
    setAddingChild(true);
    const res = await fetch('/api/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name: newName, birthDate: newBirth, allergies: newAllergies, dislikes: newDislikes, likes: newLikes }),
    });
    const child = await res.json();
    setAddingChild(false);
    if (child.id) {
      onUpdate(child);
      setNewChildMode(false);
      setNewName(''); setNewBirth(''); setNewBirthError('');
      setNewAllergies([]); setNewDislikes([]); setNewLikes([]);
    } else if (child.message) {
      setNewBirthError(child.message);
    }
  };

  const fmtDate = (bd: any) => bd
    ? new Date(bd).toLocaleDateString('ka-GE', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const getAge = (bd: any): string => {
    if (!bd) return '';
    const birth = new Date(bd);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (now.getDate() < birth.getDate()) months--;
    if (months < 0) { years--; months += 12; }
    if (years === 0) return `${months} თვე`;
    if (months === 0) return `${years} წელი`;
    return `${years} წელი ${months} თვე`;
  };

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
          {kids.length === 0 && <p className="text-[#465940]/60 text-sm">ჯერ შვილი არ გყავს დამატებული.</p>}
        </div>
      </div>

      {/* Add new child */}
      {newChildMode && (
        <div className={`${card} p-5 space-y-4`}>
          <h3 className="font-bold text-[#465940]">ახალი შვილის მიმატება</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#465940] mb-1.5">სახელი</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm settings-input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#465940] mb-1.5">დაბადების თარიღი</label>
              <input type="date" value={newBirth} onChange={(e) => { setNewBirth(e.target.value); setNewBirthError(''); }}
                className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm settings-input" />
            </div>
          </div>
          {newBirthError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{newBirthError}</p>
          )}
          <div>
            <label className="block text-sm font-semibold text-[#465940] mb-2">ალერგიები</label>
            <TagInput tags={newAllergies} onChange={setNewAllergies} color="bg-red-100 text-red-700" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#465940] mb-2">არ უყვარს</label>
            <TagInput tags={newDislikes} onChange={setNewDislikes} color="bg-[#465940]/10 text-[#465940]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#465940] mb-2">უყვარს</label>
            <TagInput tags={newLikes} onChange={setNewLikes} color="bg-[#465940]/20 text-[#465940]" />
          </div>
          <div className="flex gap-2">
            <button onClick={addChild} disabled={addingChild}
              className="bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] px-5 py-2.5 rounded-full text-sm font-bold transition disabled:opacity-60">
              {addingChild ? 'ემატება...' : 'დამატება'}
            </button>
            <button onClick={() => { setNewChildMode(false); setNewName(''); setNewBirth(''); setNewAllergies([]); setNewDislikes([]); setNewLikes([]); }}
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
                className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm settings-input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#465940] mb-1.5">დაბადების თარიღი</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm settings-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#465940] mb-2">ალერგიები</label>
            <TagInput tags={allergies} onChange={setAllergies} color="bg-[#FDFBF0]/10 text-[#465940]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#465940] mb-2">არ უყვარს</label>
            <TagInput tags={dislikes} onChange={setDislikes} color="bg-[#FDFBF0]/10 text-[#465940]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#465940] mb-2">უყვარს</label>
            <TagInput tags={likes} onChange={setLikes} color="bg-[#465940]/20 text-[#465940]" />
          </div>

          {/* Milk tracking */}
          <div className="border-t border-[#465940]/10 pt-4">
            <label className="block text-sm font-semibold text-[#465940] mb-3">რძის კვება</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {MILK_OPTIONS.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => { setMilkType(opt.value); setMilkStopped(opt.value === 'NONE'); }}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition text-left ${
                    milkType === opt.value
                      ? 'border-[#465940] bg-[#465940] text-[#FDFBF0]'
                      : 'border-[#465940]/15 text-[#465940]/70 hover:border-[#465940]/30'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
            {milkType !== 'NONE' && (
              <label className="flex items-center gap-3 cursor-pointer">
                <button type="button"
                  onClick={() => setMilkStopped(!milkStopped)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${milkStopped ? 'bg-[#465940]' : 'bg-[#465940]/20'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-[#FDFBF0] shadow transition ${milkStopped ? 'translate-x-4.5' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-[#465940]/70">სრულად მყარ კვებაზე გადასვლა</span>
              </label>
            )}
          </div>

          <button onClick={save} disabled={saving}
            className="w-full bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] py-3 rounded-full font-bold text-sm transition disabled:opacity-60">
            {saving ? 'ინახება...' : 'შენახვა'}
          </button>
        </div>
      )}

      {/* Food Introduction Tracker */}
      {selected && introChild?.id === selected.id && (
        <div className={`${card} p-5 space-y-4`}>
          <div>
            <h3 className="font-black text-[#465940] mb-0.5">ახალი პროდუქტების გაცნობა</h3>
            <p className="text-xs text-[#465940]/60">გასინჯეთ ახალი პროდუქტი? დაამატეთ — 3 დღე დააკვირდით, შემდეგ მომდევნოზე გადახვიდეთ</p>
          </div>

          {/* Active introduction */}
          {introductions.filter(i => i.status === 'INTRODUCING').map(item => {
            const days = daysSince(item.startedAt);
            const safe = days >= 3;
            return (
              <div key={item.id} className={`rounded-2xl p-4 border-2 ${safe ? 'border-green-300 bg-green-50' : 'border-[#465940]/20 bg-[#465940]/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-black text-[#465940]">{item.foodName}</p>
                    <p className="text-xs text-[#465940]/60">{days} დღე გავიდა · {safe ? '3 დღე შესრულდა' : `${3 - days} დღე დარჩა`}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black ${safe ? 'bg-green-100 text-green-700' : 'bg-[#465940]/10 text-[#465940]'}`}>
                    {days}/3
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => updateFoodStatus(item.id, 'SAFE')}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-500 text-white transition">
                    ✓ ალერგია არ არის
                  </button>
                  <button onClick={() => updateFoodStatus(item.id, 'ALLERGIC')}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-600 transition">
                    ალერგია აქვს
                  </button>
                  <button onClick={() => deleteFood(item.id)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940]/60 transition">
                    წაშლა
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add new food */}
          <div className="flex gap-2">
            <input value={newFood} onChange={e => setNewFood(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addFood()}
              placeholder="ახალი პროდუქტი (მაგ. გოგრა)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#465940]/20 text-sm bg-white focus:outline-none focus:border-[#465940] settings-input" />
            <button onClick={addFood} disabled={addingFood || !newFood.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#465940] text-[#FDFBF0] text-sm font-bold disabled:opacity-50 transition">
              {addingFood ? '...' : '+ დაწყება'}
            </button>
          </div>

          {/* History */}
          {introductions.filter(i => i.status !== 'INTRODUCING').length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#465940]/60 mb-2 uppercase tracking-wide">ისტორია</p>
              <div className="space-y-1.5">
                {introLoading && <p className="text-xs text-[#465940]/50">იტვირთება...</p>}
                {introductions.filter(i => i.status !== 'INTRODUCING').map(item => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#465940]/5">
                    <div className="flex items-center gap-2">
                      <span>{item.status === 'SAFE' ? '' : ''}</span>
                      <span className="text-sm font-semibold text-[#465940]">{item.foodName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'SAFE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {item.status === 'SAFE' ? 'უსაფრთხო' : 'ალერგია'}
                      </span>
                      <button onClick={() => deleteFood(item.id)} className="text-[#465940]/30 hover:text-[#465940]/60 text-xs">×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                {viewModal.birthDate && (
                  <p className="text-sm text-[#FDFBF0]/80 font-semibold mt-0.5">{getAge(viewModal.birthDate)}</p>
                )}
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
                  <p className="text-xs text-[#465940]/60 font-semibold uppercase tracking-wide mb-2">ალერგიები</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewModal.allergies.map((a: string) => (
                      <span key={a} className="px-3 py-1 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940]">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewModal.dislikes?.length > 0 && (
                <div>
                  <p className="text-xs text-[#465940]/60 font-semibold uppercase tracking-wide mb-2">არ უყვარს</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewModal.dislikes.map((d: string) => (
                      <span key={d} className="px-3 py-1 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940]">{d}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewModal.likes?.length > 0 && (
                <div>
                  <p className="text-xs text-[#465940]/60 font-semibold uppercase tracking-wide mb-2">უყვარს</p>
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
function AllergiesSection({ child }: { child: any }) {
  const [allergic, setAllergic] = useState<{ id: string; ingredient: { nameKa: string } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearingId, setClearingId] = useState<string | null>(null);

  const fetchAllergic = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/baby-ingredients?childId=${child.id}`);
    const data = await res.json();
    const items = Array.isArray(data)
      ? data.filter((i: any) => i.status?.allergic).map((i: any) => ({ id: i.status.id, ingredient: { nameKa: i.nameKa } }))
      : [];
    setAllergic(items);
    setLoading(false);
  }, [child.id]);

  useEffect(() => { fetchAllergic(); }, [fetchAllergic]);

  const clear = async (statusId: string) => {
    if (!confirm('დარწმუნებული ხარ, რომ ალერგია მოეხსნას? ინგრედიენტი ისევ დაუსინჯავად ჩაითვლება.')) return;
    setClearingId(statusId);
    await fetch(`/api/baby-ingredient-status/${statusId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tried: false, liked: null, disliked: null, ateWell: null, refused: null, allergic: false }),
    });
    setClearingId(null);
    fetchAllergic();
  };

  return (
    <div className={`${card} p-6`}>
      <h2 className="font-black text-[#465940] mb-1">ალერგიები</h2>
      <p className="text-sm text-[#465940]/60 mb-4">{child.name}-ზე მონიშნული ალერგიები. მოხსნა მხოლოდ აქედან შეიძლება.</p>
      {loading ? (
        <p className="text-sm text-[#465940]/50">იტვირთება...</p>
      ) : allergic.length === 0 ? (
        <p className="text-sm text-[#465940]/50">მონიშნული ალერგია არ არის.</p>
      ) : (
        <div className="space-y-2">
          {allergic.map(a => (
            <div key={a.id} className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-2.5">
              <span className="text-sm font-semibold text-red-700">{a.ingredient.nameKa}</span>
              <button onClick={() => clear(a.id)} disabled={clearingId === a.id}
                className="text-xs font-bold text-red-600 hover:text-red-800 transition disabled:opacity-50">
                {clearingId === a.id ? '...' : 'აღარ აქვს ალერგია'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ user, activeChild }: { user: any; activeChild?: any }) {
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

  const [deleting, setDeleting] = useState(false);
  const deleteAccount = async () => {
    if (!confirm('ანგარიშის წაშლა საბოლოოა და ვერ გაუქმდება — შვილების, კვების გეგმებისა და გამოწერის ჩათვლით ყველაფერი წაიშლება. იმავე ელფოსტით ხელახლა რეგისტრაცია შესაძლებელია, მაგრამ თუ 7-დღიანი უფასო ტესტი უკვე გამოყენებულია, მეორედ აღარ მიეცემა. დარწმუნებული ხარ?')) return;
    if (!confirm('ბოლო შეკითხვა — ნამდვილად გსურს ანგარიშის წაშლა?')) return;
    setDeleting(true);
    const res = await fetch('/api/account/delete', { method: 'POST' });
    if (res.ok) {
      window.location.href = '/?lang=ka';
    } else {
      setDeleting(false);
      alert('შეცდომა. სცადე თავიდან.');
    }
  };

  const inp = 'w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm bg-white settings-input';

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
        <p className="text-sm text-[#465940]/70 mb-4"><span className="font-semibold text-[#465940]">სტატუსი:</span> {user.subscriptionStatus}</p>
        {user.lsSubscriptionId ? (
          <ManageSubscriptionButton />
        ) : (user.subscriptionStatus === 'FULL_PLAN' || user.subscriptionStatus === 'RECIPE_PLAN') ? (
          <CancelBogSubscriptionButton
            subscriptionCanceledAt={user.subscriptionCanceledAt}
            subscriptionRenewsAt={user.subscriptionRenewsAt}
          />
        ) : null}
      </div>

      {activeChild && <AllergiesSection child={activeChild} />}

      {/* Danger zone */}
      <div className={`${card} p-6 border-2 border-red-200`}>
        <h2 className="font-black text-red-600 mb-2">ანგარიშის წაშლა</h2>
        <p className="text-sm text-[#465940]/70 mb-4">
          ანგარიშის წაშლა საბოლოოდ შლის შვილების პროფილებს, კვების გეგმებსა და ისტორიას. თუ აქტიური გამოწერა გაქვს, ისიც გაუქმდება — შემდგომი ჩამოჭრა აღარ მოხდება. იმავე ელფოსტით ხელახლა რეგისტრაცია შემდეგაც შესაძლებელია — თუმცა თუ ამ ელფოსტამ უკვე გამოიყენა 7-დღიანი უფასო ტესტ-პერიოდი, ხელახლა რეგისტრაციისას მეორედ აღარ მიეცემა: პაკეტზე გამოწერისთანავე თანხა ეგრევე ჩამოეჭრება, 7-დღიანი ტესტის გარეშე.
        </p>
        <button onClick={deleteAccount} disabled={deleting}
          className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2.5 rounded-full text-sm font-bold transition disabled:opacity-60">
          {deleting ? 'იშლება...' : 'ანგარიშის წაშლა'}
        </button>
      </div>
    </div>
  );
}

// Legacy Lemon Squeezy path — kept only for any pre-existing lsSubscriptionId accounts;
// current subscribers all go through BOG and CancelBogSubscriptionButton below.
function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openPortal = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/subscription/portal');
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError('ვერ მოხერხდა გახსნა, სცადეთ მოგვიანებით');
    } catch {
      setError('ვერ მოხერხდა გახსნა, სცადეთ მოგვიანებით');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={openPortal} disabled={loading}
        className="bg-[#465940]/10 hover:bg-[#465940]/15 text-[#465940] px-5 py-2.5 rounded-full text-sm font-bold transition disabled:opacity-60">
        {loading ? 'იხსნება...' : 'გამოწერის მართვა / გაუქმება'}
      </button>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}

// Real, working cancel path for BOG subscribers. Cancelling stops future billing but
// keeps access through subscriptionRenewsAt (the period already paid for) — the
// bog-renew cron downgrades to CANCELED itself once that date actually arrives.
function CancelBogSubscriptionButton({ subscriptionCanceledAt, subscriptionRenewsAt }: {
  subscriptionCanceledAt: string | Date | null;
  subscriptionRenewsAt: string | Date | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canceledAt, setCanceledAt] = useState(subscriptionCanceledAt);
  const [accessUntil, setAccessUntil] = useState(subscriptionRenewsAt);

  const cancel = async () => {
    if (!confirm('დარწმუნებული ხართ, რომ გსურთ გამოწერის გაუქმება? წვდომა დარჩება ბოლომდე გადახდილი პერიოდის ვადამდე, შემდეგ აღარ განახლდება.')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/subscription/cancel', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setCanceledAt(new Date().toISOString());
        if (data.accessUntil) setAccessUntil(data.accessUntil);
        return;
      }
      setError('ვერ მოხერხდა გაუქმება, სცადეთ მოგვიანებით ან მოგვწერეთ info@mommenu.ge-ზე.');
    } catch {
      setError('ვერ მოხერხდა გაუქმება, სცადეთ მოგვიანებით.');
    } finally {
      setLoading(false);
    }
  };

  if (canceledAt) {
    return (
      <div className="rounded-xl bg-[#465940]/10 px-4 py-3 text-sm text-[#465940]">
        გამოწერა გაუქმებულია — წვდომა გექნებათ {accessUntil ? new Date(accessUntil).toLocaleDateString('ka-GE') : 'მიმდინარე პერიოდის ბოლომდე'}, შემდეგ აღარ განახლდება და აღარ ჩამოგეჭრებათ თანხა.
      </div>
    );
  }

  return (
    <div>
      <button onClick={cancel} disabled={loading}
        className="bg-[#465940]/10 hover:bg-[#465940]/15 text-[#465940] px-5 py-2.5 rounded-full text-sm font-bold transition disabled:opacity-60">
        {loading ? 'უქმდება...' : 'გამოწერის გაუქმება'}
      </button>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}

// Georgian genitive isn't just "+ის" — ზამთარი (winter) is irregular
// (ზამთრის, not ზამთარის), and ზაფხული/გაზაფხული already end in "ი" so
// appending "ის" doubled it ("ზაფხულიის"). Spelled out explicitly instead.
const SEASON_GENITIVE_KA: Record<string, string> = {
  'ზაფხული': 'ზაფხულის',
  'გაზაფხული': 'გაზაფხულის',
  'შემოდგომა': 'შემოდგომის',
  'ზამთარი': 'ზამთრის',
};

const MONTHS_KA = [
  'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
  'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი',
];

function TrialBanner({ trialEndsAt }: { trialEndsAt: string | Date | null | undefined }) {
  if (!trialEndsAt) return null;
  const end = new Date(trialEndsAt);
  const daysLeft = Math.ceil((end.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (daysLeft <= 0) return null;

  // Intl.toLocaleDateString('ka-GE', ...) silently falls back to English month
  // names in this Node/ICU build — format manually instead (mirrors lib/email.ts).
  const dateLabel = `${end.getDate()} ${MONTHS_KA[end.getMonth()]}`;

  return (
    <div className="mb-4 rounded-2xl bg-[#FDFBF0] border border-[#FDFBF0]/40 px-4 py-3 flex items-center gap-2 text-sm text-[#465940] shadow-sm">
      <span className="text-lg">🎁</span>
      <span>
        <span className="font-bold">უფასო ტესტ-პერიოდში ხართ</span> — დარჩენილია {daysLeft} დღე. პირველი ჩამოჭრა მოხდება {dateLabel}-ს, თუ ამ დრომდე არ გააუქმებთ გამოწერას.
      </span>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardClient({ user }: { user: any }) {
  const router = useRouter();
  const firstChild = user.children?.[0];
  const defaultTab: Tab = !firstChild
    ? 'today'
    : ageInMonths(firstChild.birthDate) < 6
    ? 'child'
    : (firstChild.ageGroup === 'FROM_6' || firstChild.ageGroup === 'FROM_9') ? 'firstfoods' : 'today';
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [children, setChildren] = useState<any[]>(user.children ?? []);
  const [activeChild, setActiveChild] = useState<any>(firstChild ?? null);
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

  // Auto-switch tab when active child changes age group
  useEffect(() => {
    if (!activeChild) return;
    if (ageInMonths(activeChild.birthDate) < 6) {
      if (tab !== 'child' && tab !== 'settings') setTab('child');
      return;
    }
    const young = activeChild.ageGroup === 'FROM_6' || activeChild.ageGroup === 'FROM_9';
    if (young && tab === 'today') setTab('firstfoods');
    if (!young && (tab === 'firstfoods' || tab === 'recipes')) setTab('today');
    if (young && tab === 'nutrition') setTab('firstfoods');
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
  const isYoungBaby = activeChild?.ageGroup === 'FROM_6' || activeChild?.ageGroup === 'FROM_9';

  // Site content (first-foods, recipes, meal plans, everything) starts at 6 months — a
  // child younger than that has nothing to show yet, regardless of subscription.
  const isTooYoung = !!activeChild && ageInMonths(activeChild.birthDate) < 6;

  const tabs: { key: Tab; label: string }[] = isTooYoung
    ? [{ key: 'child', label: 'შვილი' }, { key: 'settings', label: 'პარამეტრები' }]
    : [
        ...(isYoungBaby
          ? [{ key: 'firstfoods' as Tab, label: 'პირველი საკვები' }, { key: 'recipes' as Tab, label: 'რეცეპტები' }]
          : [{ key: 'today' as Tab, label: 'დღის გეგმა' }]
        ),
        // Vitamin/nutrition tracking isn't meaningful while feeding is still first-taste
        // ingredient-by-ingredient introduction — it becomes relevant once real meals start.
        ...(isYoungBaby ? [] : [{ key: 'nutrition' as Tab, label: 'კვება' }]),
        ...(isFullPlan && !isYoungBaby ? [{ key: 'shopping' as Tab, label: 'საყიდლები' }] : []),
        { key: 'child', label: 'შვილი' },
        { key: 'settings', label: 'პარამეტრები' },
      ];

  return (
    <div className="min-h-screen bg-[#465940] flex flex-col pb-16">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#465940] to-[#465940] px-5 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-3">
          <a href="/" className="inline-flex rounded-xl p-1" style={{ background: '#FDFBF0' }}>
            <img src="/mommenu-logo.png" alt="mom menu" className="h-9 w-auto" />
          </a>
          {children.length > 1 && (
            <select
              value={activeChild?.id ?? ''}
              onChange={(e) => setActiveChild(children.find((c) => c.id === e.target.value) ?? null)}
              className="text-sm border border-[#FDFBF0]/30 bg-[#FDFBF0]/20 text-[#FDFBF0] rounded-full px-3 py-1.5 focus:outline-none"
            >
              {children.map((c) => <option key={c.id} value={c.id} style={{ color: '#465940', background: '#FDFBF0' }}>{c.name}</option>)}
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
        <TrialBanner trialEndsAt={user.trialEndsAt} />
        {isTooYoung && (
          <div className="mb-4 rounded-2xl bg-[#FDFBF0] border border-[#465940]/10 p-5 text-center">
            <p className="text-3xl mb-2"></p>
            <p className="font-bold text-[#465940] mb-1">{activeChild.name} ჯერ 6 თვის არ არის</p>
            <p className="text-sm text-[#465940]/60">
              საიტის კონტენტი (პირველი საკვები, რეცეპტები, კვების გეგმა) გაიხსნება, როცა {activeChild.name} 6 თვის გახდება. მანამდე შვილის პროფილი და ანგარიშის პარამეტრები ხელმისაწვდომია.
            </p>
          </div>
        )}
        {tab === 'firstfoods' && activeChild && <FirstFoodsTab child={activeChild} isFullPlan={isFullPlan} />}
        {tab === 'recipes' && activeChild && <BabyRecipesTab child={activeChild} isFullPlan={isFullPlan} />}
        {tab === 'today' && <TodayTab child={activeChild} allDishes={allDishes} planStart={planStart} isFullPlan={isFullPlan} />}
        {tab === 'nutrition' && <NutritionTab child={activeChild} />}
        {tab === 'shopping' && <ShoppingListTab child={activeChild} planStart={planStart} />}
        {tab === 'child' && <ChildTab children={children} userId={user.id} onUpdate={onChildUpdate} onDelete={onChildDelete} />}
        {tab === 'settings' && <SettingsTab user={user} activeChild={isYoungBaby ? activeChild : null} />}
      </main>
    </div>
  );
}
