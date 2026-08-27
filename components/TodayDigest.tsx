'use client';

import { useEffect, useMemo, useState } from 'react';

const card = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm';

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function norm(s: string): string {
  return s.trim().toLowerCase();
}

// "+ დაამატე რაც ჭამა" — food eaten outside the plan (grandma's snack, anything off-menu).
// The actual planned meals (საუზმე/სადილი/etc, with their ✅/❌/⏳ state and "თავდაპირველად"
// note) already render in the meal-plan list right below this — that list IS "დღეს რა
// ჭამა?", so this widget only adds what that list can't show: food that was never a
// plan slot at all. It doesn't repeat any of that list's content.
export default function TodayDigest({ child, allDishes }: { child: any; allDishes: any[] }) {
  const todayStr = localToday();

  const [extraLogs, setExtraLogs] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchExtra = () => {
    if (!child) return;
    fetch(`/api/extra-food-log?childId=${child.id}&date=${todayStr}`)
      .then((r) => r.json())
      .then((d) => setExtraLogs(Array.isArray(d) ? d : []))
      .catch(() => {});
  };

  useEffect(() => { fetchExtra(); }, [child?.id]);

  const matches = useMemo(() => {
    const q = norm(query);
    if (!q) return [];
    return allDishes.filter((d: any) => norm(d.titleKa || '').includes(q)).slice(0, 8);
  }, [query, allDishes]);

  const addExtra = async (opts: { dishId?: string; note?: string }) => {
    if (!child || saving) return;
    setSaving(true);
    try {
      await fetch('/api/extra-food-log', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: child.id, date: todayStr, ...opts }),
      });
      setQuery('');
      setShowAdd(false);
      fetchExtra();
    } finally {
      setSaving(false);
    }
  };

  const removeExtra = async (id: string) => {
    await fetch(`/api/extra-food-log?id=${id}`, { method: 'DELETE' });
    setExtraLogs((prev) => prev.filter((e) => e.id !== id));
  };

  if (!child) return null;

  return (
    <div className={`${card} p-4`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-[#465940] text-sm mb-0.5">დამატებით რაც ჭამა</h3>
          {extraLogs.length === 0 ? (
            <p className="text-xs text-[#465940]/50">გეგმის მიღმა რამე ხომ არ ჭამა — ბებიასთან, სასეირნოდ...</p>
          ) : (
            <ul className="space-y-1 mt-1.5">
              {extraLogs.map((e) => {
                const title = e.dish?.titleKa ?? e.ingredient?.titleKa ?? e.note;
                return (
                  <li key={e.id} className="flex items-center gap-2 text-sm text-[#465940]">
                    <span>➕</span>
                    <span className="flex-1 min-w-0 truncate">{title}</span>
                    <button onClick={() => removeExtra(e.id)} className="text-[#465940]/40 hover:text-[#465940] text-xs flex-shrink-0">✕</button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <button onClick={() => setShowAdd(true)}
          className="text-xs font-bold text-[#465940] bg-[#465940]/10 hover:bg-[#465940] hover:text-[#FDFBF0] rounded-full px-3 py-1.5 transition flex-shrink-0">
          + დაამატე რაც ჭამა
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-[#FDFBF0] rounded-3xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-[#465940]/10">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-[#465940]">რა ჭამა დამატებით?</h3>
                <button onClick={() => setShowAdd(false)} className="text-[#465940]/60 hover:text-[#465940]/80 text-2xl leading-none">×</button>
              </div>
              <p className="text-[11px] text-[#465940]/60 mt-1">მოძებნე Mommenu-ს კერძებში, ან უბრალოდ ჩაწერე თუ სიაში არაა</p>
            </div>
            <div className="p-4 space-y-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="მაგ: ხაჭო, ბანანის პანკეიქი..."
                className="w-full border border-[#465940]/15 rounded-2xl px-3.5 py-2.5 text-sm text-[#465940] bg-white focus:outline-none focus:border-[#465940] transition"
              />
              {matches.length > 0 && (
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {matches.map((d: any) => (
                    <button key={d.id} onClick={() => addExtra({ dishId: d.id })} disabled={saving}
                      className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#465940] group transition text-left">
                      <div className="w-10 h-10 rounded-xl bg-[#465940]/10 overflow-hidden flex-shrink-0">
                        {d.imageUrl ? <img src={d.imageUrl} className="w-full h-full object-cover" alt="" /> : null}
                      </div>
                      <span className="text-sm font-semibold text-[#465940] group-hover:text-[#FDFBF0] transition-colors truncate">{d.titleKa}</span>
                    </button>
                  ))}
                </div>
              )}
              {query.trim() && (
                <button onClick={() => addExtra({ note: query })} disabled={saving}
                  className="w-full text-left p-2.5 rounded-2xl border border-dashed border-[#465940]/25 text-sm text-[#465940]/70 hover:bg-[#465940]/5 transition">
                  ასე დაამატე: „{query.trim()}“ (სიაში არაა)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
