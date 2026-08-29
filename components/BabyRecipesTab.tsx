'use client';

import { useState, useEffect, useCallback } from 'react';

const MEAL_LABEL: Record<string, string> = {
  BREAKFAST: 'საუზმე', LUNCH: 'სადილი', SNACK: 'სნექი', DINNER: 'ვახშამი',
};

// Filter bar above the recipe list — "ALL" plus every meal type that exists on Dish.
const MEAL_FILTERS: { key: string; label: string }[] = [
  { key: 'ALL', label: 'ყველა' },
  { key: 'BREAKFAST', label: 'საუზმე' },
  { key: 'LUNCH', label: 'სადილი' },
  { key: 'DINNER', label: 'ვახშამი' },
  { key: 'SNACK', label: 'სნექი' },
];

type Dish = {
  id: string; titleKa: string; titleEn: string; imageUrl: string | null;
  ingredientsKa: string[]; mealType: string;
};

// No structured texture field on Dish exists yet, so BLW-mode filtering goes by title
// keywords: soup/stew-style dishes are always shown (a soup isn't something you "bite"
// either way, so it's exempted), everything else that reads as puree/porridge/cream is
// hidden — BLW mode is specifically for once a baby is ready for handheld, bite-able
// food, not spoon-fed mush.
const SOUP_KEYWORDS = ['სუპი', 'ოსპი', 'ბოსტნეულით'];
const PUREE_KEYWORDS = ['პიურე', 'ფაფა', 'კრემი'];
function isPureeStyle(titleKa: string): boolean {
  if (SOUP_KEYWORDS.some(k => titleKa.includes(k))) return false;
  return PUREE_KEYWORDS.some(k => titleKa.includes(k));
}

function DishCard({ dish }: { dish: Dish }) {
  return (
    <a href={`/meals/${dish.id}`} className="flex items-center gap-3 rounded-xl border-2 border-[#465940]/10 bg-white p-3 hover:border-[#465940]/25 transition">
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#465940]/5">
        {dish.imageUrl
          ? <img src={dish.imageUrl} alt={dish.titleKa} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl"></div>
        }
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#465940]/10 text-[#465940]">
          {MEAL_LABEL[dish.mealType] ?? dish.mealType}
        </span>
        <p className="font-bold text-[#465940] text-sm mt-1 leading-snug truncate">{dish.titleKa}</p>
        <p className="text-[11px] text-[#465940]/50 mt-0.5 truncate">
          {dish.ingredientsKa.map(i => i.split(' - ')[0]).join(', ')}
        </p>
      </div>
    </a>
  );
}

export default function BabyRecipesTab({ child, isFullPlan }: { child: any; isFullPlan: boolean }) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [safeCount, setSafeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [blwMode, setBlwMode] = useState(false);
  const [search, setSearch] = useState('');
  const [mealFilter, setMealFilter] = useState('ALL');

  useEffect(() => {
    const stored = localStorage.getItem(`blw_${child.id}`);
    if (stored === 'true') setBlwMode(true);
  }, [child.id]);

  const fetchAllowed = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/baby-meal-suggestions/allowed-dishes?childId=${child.id}`);
    const data = await res.json();
    setDishes(data.dishes ?? []);
    setSafeCount(data.safeCount ?? 0);
    setLoading(false);
  }, [child.id]);

  useEffect(() => { if (isFullPlan) fetchAllowed(); }, [fetchAllowed, isFullPlan]);

  if (!isFullPlan) return (
    <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-10 text-center">
      <div className="w-16 h-16 rounded-full bg-[#465940] flex items-center justify-center text-3xl mx-auto mb-5"></div>
      <h2 className="text-xl font-black text-[#465940] mb-2">რეცეპტები დაბლოკილია</h2>
      <p className="text-[#465940]/70 text-sm mb-6 max-w-sm mx-auto">გასინჯული ინგრედიენტების მიხედვით რეცეპტების შეთავაზება ხელმისაწვდომია მხოლოდ სრული პაკეტით.</p>
      <a href="/subscription" className="inline-flex items-center justify-center rounded-full bg-[#465940] px-8 py-3 font-semibold text-[#FDFBF0] shadow-lg hover:scale-105 transition">
        პაკეტის განახლება
      </a>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-5">
        <h2 className="text-xl font-black text-[#465940]">რეცეპტები</h2>
        <p className="text-xs text-[#465940]/60 mt-0.5">
          {child.name} · {safeCount} გასინჯული ინგრედიენტიდან შედგენილი რეცეპტები
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-[76px] rounded-xl bg-[#465940]/10 animate-pulse" />)}</div>
      ) : safeCount === 0 ? (
        <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-10 text-center">
          <p className="text-4xl mb-3"></p>
          <p className="font-bold text-[#465940] mb-1">ჯერ ცარიელია</p>
          <p className="text-sm text-[#465940]/60 max-w-xs mx-auto">
            რეცეპტი გამოჩნდება მხოლოდ მაშინ, როცა შემადგენელი ინგრედიენტები ცალ-ცალკე იქნება გასინჯული — დაიწყე "პირველი საკვები" ტაბიდან.
          </p>
        </div>
      ) : dishes.length === 0 ? (
        <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-10 text-center">
          <p className="text-4xl mb-3"></p>
          <p className="font-bold text-[#465940] mb-1">ჯერ რეცეპტი არ არის</p>
          <p className="text-sm text-[#465940]/60">გასინჯე მეტი ინგრედიენტი — რეცეპტები თანდათან გამოჩნდება</p>
        </div>
      ) : (() => {
        const byBlw = blwMode ? dishes.filter(d => !isPureeStyle(d.titleKa)) : dishes;

        if (byBlw.length === 0) {
          return (
            <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-10 text-center">
              <p className="text-4xl mb-3"></p>
              <p className="font-bold text-[#465940] mb-1">ჯერ BLW-ზე შესაფერისი რეცეპტი არ არის</p>
              <p className="text-sm text-[#465940]/60">გასინჯული ინგრედიენტებით შედგენილი კერძები ჯერ პიურის ტიპისაა — ხელში დასაჭერი ვარიანტები თანდათან გამოჩნდება</p>
            </div>
          );
        }

        const byMeal = mealFilter === 'ALL' ? byBlw : byBlw.filter(d => d.mealType === mealFilter);
        const q = search.trim().toLowerCase();
        const visible = q
          ? byMeal.filter(d => d.titleKa.toLowerCase().includes(q) || d.ingredientsKa.some(i => i.toLowerCase().includes(q)))
          : byMeal;

        return (
          <>
            <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-4 space-y-3">
              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#465940]/40"
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ძებნა რეცეპტის ან ინგრედიენტის სახელით..."
                  className="w-full pl-9 pr-9 py-2.5 rounded-full border border-[#465940]/15 text-sm text-[#465940] bg-white focus:outline-none focus:border-[#465940] transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#465940]/40 hover:text-[#465940] transition text-lg leading-none"
                    aria-label="გასუფთავება"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1">
                {MEAL_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setMealFilter(f.key)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                      mealFilter === f.key ? 'bg-[#465940] text-[#FDFBF0]' : 'bg-[#465940]/10 text-[#465940]/70 hover:bg-[#465940]/20'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-10 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-bold text-[#465940] mb-1">ვერაფერი მოიძებნა</p>
                <p className="text-sm text-[#465940]/60">სცადე სხვა საძიებო სიტყვა ან ფილტრი</p>
              </div>
            ) : (
              <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-4 space-y-2">
                {visible.map(d => <DishCard key={d.id} dish={d} />)}
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
