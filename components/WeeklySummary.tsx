'use client';

import { useEffect, useState } from 'react';
import RecipeModal from './RecipeModal';

const card = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm';

// "კვირის შეჯამება" — feature 9. Built entirely from data that already exists (DailyLog,
// ExtraFoodLog, DishVote) via /api/weekly-summary — no new tables, no calorie counting.
// Deliberately framed only in positive/neutral terms per the owner's explicit "must never
// feel like a bad week" requirement: no counts of meals skipped, no comparison to a target,
// no "only" language. "New" and "repeated" are both just facts, shown as good news.
export default function WeeklySummary({ child }: { child: any }) {
  const [data, setData] = useState<any | null>(null);
  const [recipeModal, setRecipeModal] = useState<any | null>(null);

  useEffect(() => {
    if (!child) { setData(null); return; }
    setData(null);
    fetch(`/api/weekly-summary?childId=${child.id}`)
      .then((r) => r.json())
      .then((d) => setData(d && !d.error ? d : null))
      .catch(() => setData(null));
  }, [child?.id]);

  if (!child || data === null) return null;

  const Strip = ({ title, items }: { title: string; items: any[] }) => {
    if (!items?.length) return null;
    return (
      <div className="mt-4">
        <p className="text-xs font-bold text-[#465940]/60 mb-2">{title}</p>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {items.map((it: any) => (
            <button
              key={it.key ?? it.id}
              onClick={() => setRecipeModal(it)}
              className="flex-shrink-0 w-20 text-left group"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#f0f8ee] group-hover:ring-2 group-hover:ring-[#465940]/40 transition">
                {it.imageUrl ? <img src={it.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-[#465940]/10" />}
              </div>
              <p className="mt-1.5 text-[11px] font-bold text-[#465940] leading-snug line-clamp-2">{it.titleKa}</p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`${card} p-5`}>
      <h3 className="font-black text-[#465940] text-sm mb-1">{child.name}-ის კვირის შეჯამება 🌿</h3>

      {data.distinctCount === 0 ? (
        <p className="text-sm text-[#465940]/60 mt-2">
          ჯერ ცოტა მონაცემია ამ კვირისთვის 🌿 როგორც კი {child.name} სცდის კერძებს, აქ თბილად შეჯამდება.
        </p>
      ) : (
        <>
          <p className="text-sm text-[#465940]/70 mt-1">
            ამ კვირაში {child.name}-მ სცადა <span className="font-bold text-[#465940]">{data.distinctCount}</span> სხვადასხვა კერძი
            {data.newCount > 0 && <> — მათგან <span className="font-bold text-[#465940]">{data.newCount}</span> პირველად! 🎉</>}
          </p>

          <Strip title="ახალი გასინჯული 🌱" items={data.newItems} />
          <Strip title="მოეწონა ❤️" items={data.likedItems} />
          <Strip title="ხშირად აირჩია 🔁" items={data.repeatedItems} />
        </>
      )}

      <Strip title="იდეები შემდეგი კვირისთვის ✨" items={data.suggestions} />

      <RecipeModal dish={recipeModal} onClose={() => setRecipeModal(null)} ageGroup={child?.ageGroup} textureStage={child?.textureStage} />
    </div>
  );
}
