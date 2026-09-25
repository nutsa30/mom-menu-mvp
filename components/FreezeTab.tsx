'use client';

import { useMemo, useState } from 'react';
import RecipeModal from './RecipeModal';

const MEAL_LABEL: Record<string, string> = { BREAKFAST: 'საუზმე', SNACK: 'სნექი', LUNCH: 'სადილი', DINNER: 'ვახშამი' };
const card = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm';

// "გაყინვა" — dishes suited to shaping ahead (meatballs, cutlets, schnitzel) and freezing
// raw, so a busy day just means pulling one out and cooking it straight from frozen. Reads
// isFreezable/freezeInstructionsKa off the SAME allDishes catalog "დღის გეგმა" and "რა მაქვს
// სახლში?" already load (no separate fetch) — nothing here changes the dish's own displayed
// prepTimeMinutes or description; freezing is purely optional extra guidance for parents who
// want to batch-prep ahead.
export default function FreezeTab({ child, allDishes }: { child: any; allDishes: any[] }) {
  const [recipeModal, setRecipeModal] = useState<any | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const freezableDishes = useMemo(() => {
    if (!child) return [];
    return allDishes
      .filter((d: any) =>
        d.isFreezable &&
        d.freezeInstructionsKa &&
        d.ageGroups?.includes(child.ageGroup) &&
        !d.allergens?.some((a: string) => child.allergies?.includes(a))
      )
      .sort((a: any, b: any) => a.titleKa.localeCompare(b.titleKa, 'ka'));
  }, [allDishes, child]);

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
        <h2 className="font-black text-[#465940] text-lg mb-1">გაყინვა — წინასწარ მოამზადე</h2>
        <p className="text-sm text-[#465940]/60">
          ეს კერძები შეგიძლია ნედლად ჩამოაყალიბო და საყინულეში შეინახო — მერე, როცა {child.name}-ის კვების გეგმაში მოვა, პირდაპირ გაყინულიდან მოამზადო. სურვილისამებრ — არავითარი ვალდებულება არ არის, ჩვეულებრივადაც შეგიძლია მოამზადო.
        </p>
      </div>

      {freezableDishes.length === 0 ? (
        <div className={`${card} p-10 text-center`}>
          <p className="text-[#465940]/60 text-sm">{child.name}-ის ასაკისთვის ამ ტიპის კერძი ჯერ არ გვაქვს.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {freezableDishes.map((dish: any) => {
            const isOpen = openId === dish.id;
            return (
              <div key={dish.id} className={`${card} p-4`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => setRecipeModal(dish)}
                    className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-[#f0f8ee] hover:ring-2 hover:ring-[#465940]/40 transition">
                    {dish.imageUrl ? <img src={dish.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-[#465940]/10" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#465940]/10 text-[#465940]">
                      {MEAL_LABEL[dish.mealType]}
                    </span>
                    <p className="font-bold text-[#465940] text-sm mt-1 truncate">{dish.titleKa}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button onClick={() => setOpenId(isOpen ? null : dish.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                      isOpen ? 'bg-[#465940] text-[#FDFBF0]' : 'bg-[#465940]/10 text-[#465940] hover:bg-[#465940] hover:text-[#FDFBF0]'
                    }`}>
                    {isOpen ? '✓ გაყინვის ინსტრუქცია' : 'გაყინვის ინსტრუქცია'}
                  </button>
                  <button onClick={() => setRecipeModal(dish)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940] hover:bg-[#465940] hover:text-[#FDFBF0] transition">
                    რეცეპტი
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-3 bg-[#465940]/5 rounded-xl p-3.5">
                    <p className="text-sm text-[#465940]/80 leading-relaxed">{dish.freezeInstructionsKa}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <RecipeModal dish={recipeModal} onClose={() => setRecipeModal(null)} ageGroup={child?.ageGroup} textureStage={child?.textureStage} />
    </div>
  );
}
