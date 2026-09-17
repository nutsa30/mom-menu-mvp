'use client';

import { useEffect, useState } from 'react';
import RecipeModal from './RecipeModal';

const card = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm';

// "რამდენი დრო მაქვს?" — a dashboard shortcut onto the real, estimated Dish.
// prepTimeMinutes field (the same one behind feature 10's /recipes time filters).
// Self-fetching, today-independent (this isn't tied to any date/plan — it's "I want to
// cook something right now"). Only ever shows time buttons a real, age-appropriate dish
// actually satisfies — never a dead button.
export default function QuickTimePick({ child }: { child: any }) {
  const [availableTimes, setAvailableTimes] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipeModal, setRecipeModal] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!child) { setAvailableTimes([]); return; }
    fetch(`/api/quick-time-pick?childId=${child.id}`)
      .then((r) => r.json())
      .then((d) => setAvailableTimes(Array.isArray(d?.availableTimes) ? d.availableTimes : []))
      .catch(() => setAvailableTimes([]));
  }, [child?.id]);

  const pick = async (minutes: number) => {
    setPicked(minutes);
    setLoading(true);
    try {
      const res = await fetch(`/api/quick-time-pick?childId=${child.id}&maxMinutes=${minutes}`);
      const d = await res.json();
      setDishes(Array.isArray(d?.dishes) ? d.dishes : []);
    } catch {
      setDishes([]);
    }
    setLoading(false);
  };

  if (!child || availableTimes.length === 0) return null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-bold text-[#465940]/60 hover:text-[#465940] transition px-1"
      >
        რამდენი დრო მაქვს?
      </button>
    );
  }

  return (
    <div className={`${card} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-[#465940]">რამდენი დრო მაქვს?</p>
        <button onClick={() => { setOpen(false); setPicked(null); setDishes([]); }} className="text-[#465940]/50 hover:text-[#465940] text-sm">✕</button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {availableTimes.map((m) => (
          <button key={m} onClick={() => pick(m)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
              picked === m ? 'bg-[#465940] text-[#FDFBF0]' : 'bg-[#465940]/10 text-[#465940] hover:bg-[#465940]/20'
            }`}>
            {m} წუთამდე
          </button>
        ))}
      </div>

      {picked !== null && (
        <div className="mt-3">
          {loading ? (
            <p className="text-xs text-[#465940]/50">იტვირთება...</p>
          ) : dishes.length === 0 ? (
            <p className="text-xs text-[#465940]/60">ამ დროში შესაფერისი კერძი ვერ მოიძებნა.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {dishes.map((d: any) => (
                <button key={d.id} onClick={() => setRecipeModal(d)} className="flex-shrink-0 w-24 text-left group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#f0f8ee] group-hover:ring-2 group-hover:ring-[#465940]/40 transition">
                    {d.imageUrl ? <img src={d.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-[#465940]/10" />}
                  </div>
                  <p className="mt-1.5 text-[11px] font-bold text-[#465940] leading-snug line-clamp-2">{d.titleKa}</p>
                  <p className="text-[10px] text-[#465940]/50">~{d.prepTimeMinutes} წუთი</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <RecipeModal dish={recipeModal} onClose={() => setRecipeModal(null)} ageGroup={child?.ageGroup} textureStage={child?.textureStage} />
    </div>
  );
}
