'use client';

import { useEffect, useMemo, useState } from 'react';
import RecipeModal from './RecipeModal';

const MEAL_LABEL: Record<string, string> = { BREAKFAST: 'საუზმე', SNACK: 'სნექი', LUNCH: 'სადილი', DINNER: 'ვახშამი' };
const card = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm';

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}

// "რა მაქვს სახლში?" — finds dishes from the SAME catalog "დღის გეგმა" already loaded
// (allDishes, fetched once in DashboardClient from /api/meals — no separate product/
// recipe list is introduced here), matched against products the parent has on hand.
// Opening a match uses the shared RecipeModal, and marking one "ვჭამე" replaces a slot
// in TODAY's real plan through the exact same PATCH /api/daily-log/[id] endpoint the
// existing "სხვა" substitute action already uses — so the plan, the vote, and the
// vitamin/nutrient totals (/api/nutrition, which just sums wasEaten DailyLog rows) all
// update through the one pathway that already exists, nothing parallel.
export default function AtHomeTab({ child, allDishes }: { child: any; allDishes: any[] }) {
  const todayStr = localToday();

  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [recipeModal, setRecipeModal] = useState<any | null>(null);
  const [replacing, setReplacing] = useState<any | null>(null);
  const [confirmedMsg, setConfirmedMsg] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (!child) return;
    setLoadingLogs(true);
    const res = await fetch(`/api/daily-log?childId=${child.id}&date=${todayStr}`);
    const data = await res.json();
    setLogs(Array.isArray(data) ? data : []);
    setLoadingLogs(false);
  };

  useEffect(() => { fetchLogs(); }, [child?.id]);

  // Ingredient autocomplete drawn from the same dish catalog — not a second product list.
  const allIngredients = useMemo(() => {
    const set = new Set<string>();
    for (const d of allDishes) {
      for (const ing of d.ingredientsKa || []) set.add(ing);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ka'));
  }, [allDishes]);

  const suggestions = useMemo(() => {
    const q = norm(inputValue);
    if (!q) return [];
    const already = new Set(pantryItems.map(norm));
    return allIngredients.filter((ing) => norm(ing).includes(q) && !already.has(norm(ing))).slice(0, 8);
  }, [inputValue, allIngredients, pantryItems]);

  const addItem = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    setPantryItems((prev) => (prev.some((p) => norm(p) === norm(v)) ? prev : [...prev, v]));
    setInputValue('');
  };
  const removeItem = (v: string) => setPantryItems((prev) => prev.filter((p) => p !== v));

  // Same age/allergy gate the existing "სხვა" substitute list applies (subCandidates in
  // TodayTab), plus the same likes/dislikes signal pickDish() (the server auto-fill
  // algorithm) already scores on — not a second, independent preference source.
  const matches = useMemo(() => {
    if (!child || pantryItems.length === 0) return [];
    const pantryTerms = pantryItems.map(norm);

    const scored = allDishes
      .filter((d: any) =>
        d.ageGroups?.includes(child.ageGroup) &&
        !d.allergens?.some((a: string) => child.allergies?.includes(a))
      )
      .map((d: any) => {
        const ingredients: string[] = d.ingredientsKa || [];
        if (!ingredients.length) return null;
        const matchedIngredients = ingredients.filter((ing) => {
          const ni = norm(ing);
          return pantryTerms.some((p) => ni.includes(p) || p.includes(ni));
        });
        if (matchedIngredients.length === 0) return null;
        const coverage = matchedIngredients.length / ingredients.length;

        let bonus = 0;
        const text = [d.titleKa, ...ingredients].join(' ').toLowerCase();
        if (child.likes?.length && child.likes.some((l: string) => text.includes(l.toLowerCase()))) bonus += 0.15;
        if (child.dislikes?.length && child.dislikes.some((l: string) => text.includes(l.toLowerCase()))) bonus -= 0.3;

        return { dish: d, matchedIngredients, coverage, score: coverage + bonus };
      })
      .filter(Boolean) as { dish: any; matchedIngredients: string[]; coverage: number; score: number }[];

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 20);
  }, [allDishes, pantryItems, child]);

  // Only today's slots whose meal type matches the dish — the same same-mealType rule
  // the existing "სხვა" substitute list enforces, so a breakfast dish can't land in dinner.
  const slotsForDish = (dish: any) => logs.filter((l) => l.mealType === dish.mealType);

  const markEatenInSlot = async (logId: string, dishId: string) => {
    const res = await fetch(`/api/daily-log/${logId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dishId, wasEaten: true }),
    });
    const updated = await res.json();
    setLogs((prev) => prev.map((l) => (l.id === logId ? updated : l)));
    // Same cache-invalidation the existing substitute() does — shopping list must reflect
    // the new dish's ingredients too.
    localStorage.removeItem(`shopping_${child?.id}`);
    setReplacing(null);
    setConfirmedMsg(`დღის გეგმა განახლდა — ${MEAL_LABEL[updated.mealType]} ახლა არის „${updated.dish?.titleKa}“`);
    window.setTimeout(() => setConfirmedMsg(null), 4500);
  };

  const toggleDislike = async (dishId: string) => {
    await fetch('/api/dish-votes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId: child.id, dishId, liked: false }),
    });
    setConfirmedMsg('აღინიშნა როგორც არ მოწონებული — მომავალში ნაკლებად შემოგთავაზდება');
    window.setTimeout(() => setConfirmedMsg(null), 4500);
  };

  if (!child) {
    return (
      <div className={`${card} p-10 text-center`}>
        <p className="text-[#465940]/60 text-sm">შვილის მიმატება „შვილი“ ჩანართში.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className={`${card} p-5`}>
        <h2 className="font-black text-[#465940] text-lg mb-1">რა მაქვს სახლში?</h2>
        <p className="text-sm text-[#465940]/60 mb-4">
          ჩამოწერე რა პროდუქტები გაქვს — და {child.name}-სთვის შესაფერის კერძებს გიპოვით.
        </p>

        <div className="relative">
          <div className="flex flex-wrap gap-2 items-center border border-[#465940]/15 rounded-2xl px-3 py-2 focus-within:border-[#465940] transition">
            {pantryItems.map((item) => (
              <span key={item} className="flex items-center gap-1.5 bg-[#465940]/10 text-[#465940] text-sm font-semibold px-3 py-1 rounded-full">
                {item}
                <button onClick={() => removeItem(item)} className="text-[#465940]/50 hover:text-[#465940] leading-none">×</button>
              </span>
            ))}
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(inputValue); } }}
              placeholder={pantryItems.length ? 'დაამატე კიდევ...' : 'მაგ: ბროწეული, ქათმის ხორცი, ბრინჯი...'}
              className="flex-1 min-w-[140px] py-1 text-sm text-[#465940] bg-transparent focus:outline-none"
            />
          </div>
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-[#FDFBF0] border border-[#465940]/15 rounded-2xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {suggestions.map((s) => (
                <button key={s} onClick={() => addItem(s)}
                  className="w-full text-left px-4 py-2 text-sm text-[#465940] hover:bg-[#465940]/10 transition">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmedMsg && (
        <div className="rounded-2xl bg-[#465940] text-[#FDFBF0] px-4 py-3 text-sm font-semibold text-center">
          {confirmedMsg}
        </div>
      )}

      {pantryItems.length === 0 ? (
        <div className={`${card} p-10 text-center`}>
          <p className="text-[#465940]/60 text-sm">დაამატე პროდუქტები, რომ დაგინახო შესაფერისი კერძები.</p>
        </div>
      ) : matches.length === 0 ? (
        <div className={`${card} p-10 text-center`}>
          <p className="text-[#465940]/60 text-sm">ამ პროდუქტებით შესაფერისი კერძი ვერ მოიძებნა.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map(({ dish, matchedIngredients, coverage }) => (
            <div key={dish.id} className={`${card} p-4`}>
              <div className="flex items-center gap-3">
                <button onClick={() => setRecipeModal(dish)}
                  className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-[#f0f8ee] hover:ring-2 hover:ring-[#465940]/40 transition">
                  {dish.imageUrl ? <img src={dish.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-[#465940]/10" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#465940]/10 text-[#465940]">
                      {MEAL_LABEL[dish.mealType]}
                    </span>
                    <span className="text-[10px] font-bold text-[#465940]/60">{Math.round(coverage * 100)}% შენს ხელთ არსებულით</span>
                  </div>
                  <p className="font-bold text-[#465940] text-sm truncate">{dish.titleKa}</p>
                  <p className="text-[11px] text-[#465940]/60 truncate">გაქვს: {matchedIngredients.join(', ')}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button onClick={() => setReplacing(dish)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940] text-[#FDFBF0] hover:bg-[#465940]/80 transition">
                  ვჭამე
                </button>
                <button onClick={() => toggleDislike(dish.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940] hover:bg-red-500 hover:text-white transition">
                  არ მომეწონა
                </button>
                <button onClick={() => setRecipeModal(dish)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940] hover:bg-[#465940] hover:text-[#FDFBF0] transition">
                  რეცეპტი
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slot picker — replaces today's matching-mealType meal with this dish, through the
          exact same PATCH endpoint (and therefore the exact same eaten/vote/vitamin side
          effects) as the existing "სხვა" substitute action. */}
      {replacing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setReplacing(null)}>
          <div className="bg-[#FDFBF0] rounded-3xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-[#465940]/10">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-[#465940]">„{replacing.titleKa}“ — რომელი მიღება ჩანაცვლდეს?</h3>
                <button onClick={() => setReplacing(null)} className="text-[#465940]/60 hover:text-[#465940]/80 text-2xl leading-none">×</button>
              </div>
              <p className="text-[11px] text-[#465940]/60">დღევანდელი გეგმიდან ჩანაცვლდება არჩეული მიღება ამ კერძით</p>
            </div>
            <div className="p-4 space-y-2">
              {loadingLogs ? (
                <p className="text-center text-sm text-[#465940]/60 py-6">იტვირთება...</p>
              ) : slotsForDish(replacing).length === 0 ? (
                <p className="text-center text-sm text-[#465940]/60 py-6">
                  დღეს {child.name}-ის გეგმაში {MEAL_LABEL[replacing.mealType]} არ გვხვდება.
                </p>
              ) : (
                slotsForDish(replacing).map((log) => (
                  <button key={log.id} onClick={() => markEatenInSlot(log.id, replacing.id)}
                    className="group w-full flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-[#465940] transition text-left border border-transparent hover:border-[#465940]">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#465940]/60 group-hover:text-[#FDFBF0]/70">
                        {MEAL_LABEL[log.mealType]}
                      </span>
                      <p className="font-bold text-[#465940] group-hover:text-[#FDFBF0] text-sm transition-colors">
                        {log.dish ? `ახლა: ${log.dish.titleKa}` : 'ჯერ არაფერია დაგეგმილი'}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#465940] group-hover:text-[#FDFBF0]">აირჩიე →</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <RecipeModal dish={recipeModal} onClose={() => setRecipeModal(null)} />
    </div>
  );
}
