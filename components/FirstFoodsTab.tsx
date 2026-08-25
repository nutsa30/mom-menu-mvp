'use client';

import { useState, useEffect, useCallback } from 'react';

type Ingredient = {
  id: string; nameKa: string; nameEn: string; category: string; minAgeMonths: number;
  status: {
    id: string; tried: boolean; liked: boolean | null; disliked: boolean | null;
    ateWell: boolean | null; refused: boolean | null; allergic: boolean; comment: string | null;
  } | null;
};

function blwCutSize(ageMonths: number): string {
  if (ageMonths < 9) return '~10 სმ ჯოხი (ბავშვის ხელის სიგრძე)';
  if (ageMonths < 12) return '1–2 სმ კუბი ან ზოლი';
  return 'კბენის ზომის ნაჭრები';
}

function blwPrep(category: string): string {
  if (category === 'vegetable') return 'მოხარშეთ სანამ ძალიან ლმობიერია';
  return 'ლმობიერი — ნედლი ან მოხარშული';
}

function pureePrep(category: string): string {
  if (category === 'vegetable') return 'მოხარშეთ და გახეხეთ პიურედ';
  return 'გახეხეთ / გახადეთ პიურე';
}

function StatusBadge({ tried, allergic, liked, ateWell }: any) {
  if (allergic) return <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">ალერგია</span>;
  if (!tried) return <span className="text-[10px] bg-[#465940]/10 text-[#465940]/50 font-bold px-2 py-0.5 rounded-full">არ გასინჯულა</span>;
  if (liked) return <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">✓ მოეწონა</span>;
  if (ateWell) return <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">✓ კარგად ჭამა</span>;
  return <span className="text-[10px] bg-[#465940]/10 text-[#465940] font-bold px-2 py-0.5 rounded-full">✓ გასინჯა</span>;
}

function IngredientCard({
  ing, childId, onUpdate, blwMode, ageMonths,
}: {
  ing: Ingredient; childId: string; onUpdate: () => void; blwMode: boolean; ageMonths: number;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState(ing.status?.comment ?? '');
  const s = ing.status;

  const update = async (fields: Record<string, any>) => {
    setSaving(true);
    const body = { childId, ingredientId: ing.id, ...fields };
    if (s?.id) {
      await fetch(`/api/baby-ingredient-status/${s.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
    } else {
      await fetch('/api/baby-ingredient-status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
    setSaving(false);
    onUpdate();
  };

  const toggle = (field: string, current: boolean | null) => update({ [field]: !current, tried: true });

  return (
    <div className={`rounded-xl border-2 transition ${s?.allergic ? 'border-red-200 bg-red-50' : s?.tried ? 'border-[#465940]/30 bg-[#465940]/5' : 'border-[#465940]/10'}`}>
      <button className="w-full flex items-center justify-between px-4 py-3 text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
            s?.allergic ? 'bg-red-100 border-red-300' :
            s?.tried ? 'bg-[#465940] border-[#465940]' : 'border-[#465940]/30'
          }`}>
            {s?.tried && !s?.allergic && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4 8L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            {s?.allergic && <span className="text-red-500 text-xs">✕</span>}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-sm text-[#465940]">{ing.nameKa}</span>
            {/* Prep hint — always visible so parent knows how to prepare */}
            {!s?.allergic && (
              <p className="text-[10px] text-[#465940]/50 mt-0.5">
                {blwMode
                  ? `${blwCutSize(ageMonths)} · ${blwPrep(ing.category)}`
                  : `${pureePrep(ing.category)}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge tried={s?.tried} allergic={s?.allergic} liked={s?.liked} ateWell={s?.ateWell} />
          <span className="text-[#465940]/40 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#465940]/10 pt-3">
          {!s?.tried ? (
            <button onClick={() => update({ tried: true })} disabled={saving}
              className="w-full py-2 rounded-xl bg-[#465940] text-[#FDFBF0] text-sm font-bold transition disabled:opacity-60">
              ✓ გავასინჯე
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {[
                { field: 'liked',    val: s.liked,    label: 'მოეწონა',     active: 'bg-green-500 text-white' },
                { field: 'disliked', val: s.disliked, label: 'არ მოეწონა',  active: 'bg-orange-400 text-white' },
                { field: 'ateWell',  val: s.ateWell,  label: 'კარგად ჭამა', active: 'bg-blue-500 text-white' },
                { field: 'refused',  val: s.refused,  label: 'არ ჭამა',     active: 'bg-gray-400 text-white' },
                { field: 'allergic', val: s.allergic, label: 'ალერგია',     active: 'bg-red-500 text-white' },
              ].map(opt => (
                <button key={opt.field}
                  onClick={() => toggle(opt.field, opt.val ?? false)}
                  disabled={saving}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition disabled:opacity-50 ${
                    opt.val ? opt.active : 'border-[#465940]/20 text-[#465940]/70 hover:border-[#465940]/30'
                  }`}>
                  {opt.label}
                </button>
              ))}
              <button onClick={() => update({ tried: false, liked: null, disliked: null, ateWell: null, refused: null, allergic: false })}
                className="py-2 px-3 rounded-xl text-xs font-bold border border-[#465940]/15 text-[#465940]/40 hover:text-[#465940]/60 transition col-span-1">
                გასუფთავება
              </button>
            </div>
          )}
          {s?.tried && (
            <div className="flex gap-2">
              <input value={comment} onChange={e => setComment(e.target.value)}
                placeholder="კომენტარი (სურვილისამებრ)"
                className="flex-1 px-3 py-1.5 rounded-xl border border-[#465940]/20 text-xs text-[#465940] bg-white focus:outline-none focus:border-[#465940]" />
              <button onClick={() => update({ comment })} disabled={saving || comment === (s?.comment ?? '')}
                className="px-3 py-1.5 rounded-xl bg-[#465940] text-[#FDFBF0] text-xs font-bold disabled:opacity-40 transition">
                შენახვა
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BlwIngCard({ ing, ageMonths }: { ing: Ingredient; ageMonths: number }) {
  return (
    <div className="rounded-xl border-2 border-[#465940]/20 bg-white px-4 py-3 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#465940] text-sm">{ing.nameKa}</p>
        <p className="text-[11px] text-[#465940]/70 mt-0.5">{blwPrep(ing.category)}</p>
        <div className="mt-1.5 inline-flex items-center gap-1 bg-[#465940]/10 rounded-lg px-2 py-0.5">
          <span className="text-[10px] font-semibold text-[#465940]">{blwCutSize(ageMonths)}</span>
        </div>
      </div>
    </div>
  );
}

export default function FirstFoodsTab({ child, isFullPlan }: { child: any; isFullPlan: boolean }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loadingIng, setLoadingIng] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'vegetable' | 'fruit'>('all');
  const [blwMode, setBlwMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`blw_${child.id}`);
    if (stored === 'true') setBlwMode(true);
  }, [child.id]);

  const toggleBlw = () => {
    const next = !blwMode;
    setBlwMode(next);
    localStorage.setItem(`blw_${child.id}`, String(next));
  };

  const fetchIngredients = useCallback(async () => {
    setLoadingIng(true);
    const res = await fetch(`/api/baby-ingredients?childId=${child.id}`);
    const data = await res.json();
    setIngredients(Array.isArray(data) ? data : []);
    setLoadingIng(false);
  }, [child.id]);

  useEffect(() => { fetchIngredients(); }, [fetchIngredients]);

  const ageMonths = Math.floor((Date.now() - new Date(child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44));

  if (!isFullPlan) return (
    <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-10 text-center">
      <div className="w-16 h-16 rounded-full bg-[#465940] flex items-center justify-center text-3xl mx-auto mb-5"></div>
      <h2 className="text-xl font-black text-[#465940] mb-2">პირველი საკვები დაბლოკილია</h2>
      <p className="text-[#465940]/70 text-sm mb-6 max-w-sm mx-auto">ინგრედიენტების გასინჯვის ტრეკერი ხელმისაწვდომია მხოლოდ სრული პაკეტით.</p>
      <a href="/subscription" className="inline-flex items-center justify-center rounded-full bg-[#465940] px-8 py-3 font-semibold text-[#FDFBF0] shadow-lg hover:scale-105 transition">
        პაკეტის განახლება
      </a>
    </div>
  );

  const triedCount = ingredients.filter(i => i.status?.tried).length;
  const allergicCount = ingredients.filter(i => i.status?.allergic).length;

  // Age-appropriate filter: show only if minAgeMonths <= baby's age, OR already tried
  const ageAppropriate = ingredients.filter(i =>
    i.minAgeMonths <= ageMonths || i.status?.tried
  );
  const filteredIng = ageAppropriate.filter(i =>
    categoryFilter === 'all' || i.category === categoryFilter
  );
  const vegetables = filteredIng.filter(i => i.category === 'vegetable');
  const fruits = filteredIng.filter(i => i.category === 'fruit');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-black text-[#465940]">პირველი საკვები</h2>
            <p className="text-xs text-[#465940]/60 mt-0.5">{child.name} · {ageMonths} თვე</p>
          </div>
          <div className="flex gap-3 text-center">
            <div className="bg-[#465940]/5 rounded-xl px-3 py-2">
              <p className="text-xl font-black text-[#465940]">{triedCount}</p>
              <p className="text-[10px] text-[#465940]/60">გასინჯული</p>
            </div>
            {allergicCount > 0 && (
              <div className="bg-red-50 rounded-xl px-3 py-2">
                <p className="text-xl font-black text-red-500">{allergicCount}</p>
                <p className="text-[10px] text-red-400">ალერგია</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-[#465940]/10 rounded-full overflow-hidden">
          <div className="h-2 bg-[#465940] rounded-full transition-all"
            style={{ width: ageAppropriate.length ? `${(triedCount / ageAppropriate.length) * 100}%` : '0%' }} />
        </div>
        <p className="text-[10px] text-[#465940]/50 mt-1">{triedCount} / {ageAppropriate.length} ინგრედიენტი გასინჯული ({ageMonths} თვის ასაკისთვის)</p>

        {/* BLW toggle */}
        <div className="mt-3 pt-3 border-t border-[#465940]/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#465940]">BLW კვება</span>
            <span className="ml-2 text-[10px] text-[#465940]/50">
              {blwMode ? 'ჩართულია — ნაჭრებად, პიურეს გარეშე' : 'გამორთულია — პიურე რეჟიმი'}
            </span>
          </div>
          <button onClick={toggleBlw}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${blwMode ? 'bg-[#465940]' : 'bg-[#465940]/20'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${blwMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          {(['all', 'vegetable', 'fruit'] as const).map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${categoryFilter === cat ? 'bg-[#465940] text-[#FDFBF0]' : 'bg-[#FDFBF0] border border-[#465940]/20 text-[#465940]/70'}`}>
              {cat === 'all' ? 'ყველა' : cat === 'vegetable' ? 'ბოსტნეული' : 'ხილი'}
            </button>
          ))}
        </div>
        {loadingIng ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-[#465940]/10 animate-pulse" />)}</div>
        ) : (
          <>
            {(categoryFilter === 'all' || categoryFilter === 'vegetable') && vegetables.length > 0 && (
              <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-4 space-y-2">
                <p className="text-xs font-black text-[#465940]/60 uppercase tracking-wide mb-3">ბოსტნეული</p>
                {vegetables.map(ing => (
                  <IngredientCard key={ing.id} ing={ing} childId={child.id} blwMode={blwMode} ageMonths={ageMonths}
                    onUpdate={fetchIngredients} />
                ))}
              </div>
            )}
            {(categoryFilter === 'all' || categoryFilter === 'fruit') && fruits.length > 0 && (
              <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-4 space-y-2">
                <p className="text-xs font-black text-[#465940]/60 uppercase tracking-wide mb-3">ხილი</p>
                {fruits.map(ing => (
                  <IngredientCard key={ing.id} ing={ing} childId={child.id} blwMode={blwMode} ageMonths={ageMonths}
                    onUpdate={fetchIngredients} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
