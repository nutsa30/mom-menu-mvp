'use client';

const MEAL_LABEL: Record<string, string> = { BREAKFAST: 'საუზმე', SNACK: 'სნექი', LUNCH: 'სადილი', DINNER: 'ვახშამი' };

// The one full recipe view used everywhere a dish can be opened — "დღის გეგმა" and
// "რა მაქვს სახლში?" both render this same component, so a recipe looks and behaves
// identically no matter which tab it was opened from. Do not fork this markup.
export default function RecipeModal({ dish, onClose }: { dish: any | null; onClose: () => void }) {
  if (!dish) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#FDFBF0] w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="relative h-48 bg-[#fdf0ea] flex-shrink-0">
          {dish.imageUrl
            ? <img src={dish.imageUrl} alt={dish.titleKa} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-[#FDFBF0] transition">✕</button>
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FDFBF0]/90`}>
            {MEAL_LABEL[dish.mealType]}
          </span>
        </div>
        <div className="overflow-y-auto p-6 space-y-5">
          <h2 className="text-xl font-black text-[#465940]">{dish.titleKa}</h2>
          {dish.ingredientsKa?.length > 0 && (
            <div>
              <p className="text-sm font-bold text-[#465940] mb-2">ინგრედიენტები</p>
              <ul className="space-y-1.5">
                {dish.ingredientsKa.map((ing: string, i: number) => (
                  <li key={i} className="flex gap-2.5 text-sm text-[#465940]">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#465940]/10 text-[#465940]/70 text-[11px] font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {dish.descriptionKa && (
            <div>
              <p className="text-sm font-bold text-[#465940] mb-2">მომზადების წესი</p>
              <p className="text-sm text-[#465940] leading-relaxed">{dish.descriptionKa}</p>
            </div>
          )}
          {dish.calories && (
            <div>
              <p className="text-sm font-bold text-[#465940] mb-2">კვებითი ღირებულება</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: dish.calories, label: 'კალორი', unit: 'kcal', color: 'bg-[#FDFBF0]/10 text-[#465940]' },
                  { v: dish.proteinGrams, label: 'ცილა', unit: 'g', color: 'bg-[#FDFBF0]/10 text-[#465940]' },
                  { v: dish.carbsGrams, label: 'ნახშ.', unit: 'g', color: 'bg-[#FDFBF0]/10 text-[#465940]' },
                  { v: dish.fatGrams, label: 'ცხიმი', unit: 'g', color: 'bg-[#FDFBF0]/10 text-[#465940]' },
                  { v: dish.ironMg, label: 'რკინა', unit: 'mg', color: 'bg-[#465940] text-[#FDFBF0]' },
                  { v: dish.calciumMg, label: 'კალციუმი', unit: 'mg', color: 'bg-[#465940]/10 text-[#465940]' },
                  { v: dish.vitaminCmg, label: 'C ვიტ.', unit: 'mg', color: 'bg-[#FDFBF0]/10 text-[#465940]' },
                  { v: dish.vitaminAmcg, label: 'A ვიტ.', unit: 'mcg', color: 'bg-[#FDFBF0]/10 text-[#FDFBF0]' },
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
  );
}
