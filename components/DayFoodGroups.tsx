'use client';

import { useEffect, useState } from 'react';
import RecipeModal from './RecipeModal';

const card = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm';

// Feature 3, "დღეს რა გამომივიდა?" — self-fetching from /api/day-food-groups, which does
// all the real classification work. This component only renders what comes back: a simple
// presence check across 6 food groups, never a calorie count, never a score. Framed
// gently throughout — a missing group is just "maybe add", never a red flag.
const GROUP_META: Record<string, { label: string; emoji: string }> = {
  ENERGY: { label: 'ენერგია', emoji: '⚡' },
  PROTEIN: { label: 'ცილა', emoji: '🍗' },
  VEGETABLE: { label: 'ბოსტნეული', emoji: '🥦' },
  FRUIT: { label: 'ხილი', emoji: '🍎' },
  GRAIN: { label: 'მარცვლეული', emoji: '🌾' },
  FAT: { label: 'ცხიმი', emoji: '🥑' },
};
const GROUP_ORDER = ['ENERGY', 'PROTEIN', 'VEGETABLE', 'FRUIT', 'GRAIN', 'FAT'];

export default function DayFoodGroups({ child, date }: { child: any; date: string }) {
  const [data, setData] = useState<any | null>(null);
  const [recipeModal, setRecipeModal] = useState<any | null>(null);

  useEffect(() => {
    if (!child || !date) { setData(null); return; }
    setData(null);
    fetch(`/api/day-food-groups?childId=${child.id}&date=${date}`)
      .then((r) => r.json())
      .then((d) => setData(d && !d.error ? d : null))
      .catch(() => setData(null));
  }, [child?.id, date]);

  if (!child || !data) return null;

  return (
    <div className={`${card} p-4`}>
      <p className="text-sm font-bold text-[#465940] mb-3">დღეს რა გამომივიდა? 🍽️</p>

      {data.eatenCount === 0 ? (
        <p className="text-xs text-[#465940]/60">ჯერ არაფერია დამატებული დღეს — როგორც კი დაემატება, აქ თბილად შეჯამდება.</p>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {GROUP_ORDER.map((g) => {
              const present = !!data.groups?.[g];
              const meta = GROUP_META[g];
              return (
                <span key={g}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                    present ? 'bg-[#465940] text-[#FDFBF0]' : 'bg-[#465940]/8 text-[#465940]/50'
                  }`}>
                  <span>{meta.emoji}</span>
                  {meta.label}
                  {present && <span className="text-[10px]">✓</span>}
                </span>
              );
            })}
          </div>

          {data.suggestions?.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-bold text-[#465940]/60 mb-2">იქნებ დაამატო? 🌱</p>
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                {data.suggestions.map((s: any) => (
                  <button key={s.dish.id} onClick={() => setRecipeModal(s.dish)} className="flex-shrink-0 w-20 text-left group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#f0f8ee] group-hover:ring-2 group-hover:ring-[#465940]/40 transition">
                      {s.dish.imageUrl ? <img src={s.dish.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-[#465940]/10" />}
                    </div>
                    <p className="mt-1.5 text-[11px] font-bold text-[#465940] leading-snug line-clamp-2">{s.dish.titleKa}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <RecipeModal dish={recipeModal} onClose={() => setRecipeModal(null)} ageGroup={child?.ageGroup} textureStage={child?.textureStage} />
    </div>
  );
}
