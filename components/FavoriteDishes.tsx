'use client';

import { useEffect, useState } from 'react';
import RecipeModal from './RecipeModal';

const card = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm';

// "ჩემი ბავშვის საყვარელი კერძები ❤️" — built entirely from /api/favorite-dishes, which
// itself is just a read over the existing "ჭამა"/"არ მოეწონა" data (DailyLog.wasEaten +
// DishVote) — no separate favorites-tracking system here, just a small always-visible
// summary of what that data already says.
export default function FavoriteDishes({ child }: { child: any }) {
  const [dishes, setDishes] = useState<any[] | null>(null);
  const [recipeModal, setRecipeModal] = useState<any | null>(null);

  useEffect(() => {
    if (!child) { setDishes(null); return; }
    setDishes(null);
    fetch(`/api/favorite-dishes?childId=${child.id}`)
      .then((r) => r.json())
      .then((d) => setDishes(Array.isArray(d) ? d : []))
      .catch(() => setDishes([]));
  }, [child?.id]);

  if (!child || dishes === null) return null;

  return (
    <div className={`${card} p-5`}>
      <h3 className="font-black text-[#465940] text-sm mb-3">{child.name}-ის საყვარელი კერძები ❤️</h3>

      {dishes.length === 0 ? (
        <p className="text-sm text-[#465940]/60">
          ჯერ ცოტა მონაცემია ❤️ რაც უფრო ხშირად გამოიყენებ Mommenu-ს, მით უკეთ გაიცნობთ ერთმანეთს.
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {dishes.map((d) => (
            <button key={d.id} onClick={() => setRecipeModal(d)}
              className="flex-shrink-0 w-24 text-left group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#f0f8ee] group-hover:ring-2 group-hover:ring-[#465940]/40 transition">
                {d.imageUrl ? <img src={d.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-[#465940]/10" />}
              </div>
              <p className="mt-1.5 text-xs font-bold text-[#465940] leading-snug line-clamp-2">{d.titleKa}</p>
            </button>
          ))}
        </div>
      )}

      <RecipeModal dish={recipeModal} onClose={() => setRecipeModal(null)} />
    </div>
  );
}
