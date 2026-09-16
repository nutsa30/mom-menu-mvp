'use client';

import { useEffect, useState } from 'react';

// Feature 5, "იგივე პროდუქტი — სხვანაირად": when a dish gets an explicit "არ მოეწონა",
// this doesn't assume the child dislikes every ingredient in it forever — it looks for
// other real dishes sharing an ingredient with the one just rejected (via
// /api/dish-alternatives, which reads Dish.ingredientsKa/En — real catalog data, never
// invented) and offers those as a quick tap-to-swap, right next to the existing "სხვა"
// (general substitute) option. Self-fetching and self-contained, same pattern as
// FavoriteDishes/TodayDigest, so it doesn't touch DashboardClient's existing state.
export default function SameIngredientAlternatives({
  childId,
  dishId,
  onPick,
}: {
  childId: string;
  dishId: string;
  onPick: (dish: any) => void;
}) {
  const [alternatives, setAlternatives] = useState<any[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setAlternatives(null);
    fetch(`/api/dish-alternatives?childId=${childId}&dishId=${dishId}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setAlternatives(Array.isArray(d) ? d : []); })
      .catch(() => { if (!cancelled) setAlternatives([]); });
    return () => { cancelled = true; };
  }, [childId, dishId]);

  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="text-[11px] font-bold text-[#465940]/60 mb-1.5">იგივე პროდუქტი — სხვანაირად?</p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {alternatives.map((d) => (
          <button
            key={d.id}
            onClick={() => onPick(d)}
            className="flex-shrink-0 w-20 text-left group"
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#f0f8ee] group-hover:ring-2 group-hover:ring-[#465940]/40 transition">
              {d.imageUrl ? <img src={d.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-[#465940]/10" />}
            </div>
            <p className="mt-1 text-[11px] font-bold text-[#465940] leading-snug line-clamp-2">{d.titleKa}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
