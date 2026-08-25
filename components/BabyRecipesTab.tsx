'use client';

import { useState, useEffect, useCallback } from 'react';

const TEXTURE_KA: Record<string, string> = {
  puree: 'პიურე',
  mashed: 'ჩანგლით დაჭყლეტილი',
  softPieces: 'ლმობიერი ნაჭრები',
};

type Suggestion = {
  id: string; titleKa: string; titleEn: string; texture: string; minAgeMonths: number;
  ingredientLinks: { ingredient: { id: string; nameKa: string } }[];
  logs: { id: string; ate: boolean; liked: boolean | null; refused: boolean | null; comment: string | null; eatenAt: string }[];
};

function SuggestionCard({ s, childId, onLogged }: { s: Suggestion; childId: string; onLogged: () => void }) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [logging, setLogging] = useState(false);
  const lastLog = s.logs[0];

  const log = async (fields: { ate?: boolean; liked?: boolean; refused?: boolean }) => {
    setLogging(true);
    await fetch('/api/baby-meal-log', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId, suggestionId: s.id, ...fields, comment: comment || null }),
    });
    setLogging(false);
    setComment('');
    onLogged();
  };

  return (
    <div className={`rounded-xl border-2 transition ${lastLog?.ate ? 'border-[#465940]/30' : 'border-[#465940]/15'}`}>
      <button className="w-full flex items-center justify-between px-4 py-3 text-left" onClick={() => setOpen(!open)}>
        <div>
          <p className="font-bold text-[#465940] text-sm">{s.titleKa}</p>
          <p className="text-[10px] text-[#465940]/60 mt-0.5">
            {TEXTURE_KA[s.texture]} · {s.ingredientLinks.map(l => l.ingredient.nameKa).join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastLog?.ate && (
            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
              {lastLog.liked ? 'მოეწონა' : '✓ ვაჭამე'}
            </span>
          )}
          <span className="text-[#465940]/40 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-[#465940]/10 pt-3 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => log({ ate: true, liked: true })} disabled={logging}
              className="py-2 rounded-xl bg-green-500 text-white text-xs font-bold disabled:opacity-50 transition">
              ვაჭამე & მოეწონა
            </button>
            <button onClick={() => log({ ate: true, liked: false })} disabled={logging}
              className="py-2 rounded-xl bg-[#465940] text-[#FDFBF0] text-xs font-bold disabled:opacity-50 transition">
              ✓ ვაჭამე
            </button>
            <button onClick={() => log({ ate: false, refused: true })} disabled={logging}
              className="py-2 rounded-xl bg-orange-400 text-white text-xs font-bold disabled:opacity-50 transition">
              არ ჭამა
            </button>
          </div>
          <input value={comment} onChange={e => setComment(e.target.value)}
            placeholder="კომენტარი (სურვილისამებრ)"
            className="w-full px-3 py-1.5 rounded-xl border border-[#465940]/20 text-xs text-[#465940] bg-white focus:outline-none focus:border-[#465940]" />
          {s.logs.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-[#465940]/50 uppercase font-semibold">ბოლო ჩანაწერები</p>
              {s.logs.slice(0, 3).map(lg => (
                <div key={lg.id} className="flex items-center gap-2 text-xs text-[#465940]/70">
                  <span>{lg.ate ? (lg.liked ? 'მოეწონა' : 'ვცადა') : 'არ ჭამა'}</span>
                  <span>{new Date(lg.eatenAt).toLocaleDateString('ka-GE')}</span>
                  {lg.comment && <span className="italic">— {lg.comment}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BabyRecipesTab({ child, isFullPlan }: { child: any; isFullPlan: boolean }) {
  const [allowed, setAllowed] = useState<Suggestion[]>([]);
  const [safeCount, setSafeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [blwMode, setBlwMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`blw_${child.id}`);
    if (stored === 'true') setBlwMode(true);
  }, [child.id]);

  const fetchAllowed = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/baby-meal-suggestions/allowed?childId=${child.id}`);
    const data = await res.json();
    setAllowed(data.suggestions ?? []);
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

  const blwSoftPieces = allowed.filter(s => s.texture === 'softPieces');
  const visible = blwMode ? blwSoftPieces : allowed;

  return (
    <div className="space-y-4">
      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-5">
        <h2 className="text-xl font-black text-[#465940]">რეცეპტები</h2>
        <p className="text-xs text-[#465940]/60 mt-0.5">
          {child.name} · {safeCount} გასინჯული ინგრედიენტიდან შედგენილი კომბინაციები
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-[#465940]/10 animate-pulse" />)}</div>
      ) : safeCount === 0 ? (
        <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-10 text-center">
          <p className="text-4xl mb-3"></p>
          <p className="font-bold text-[#465940] mb-1">ჯერ ცარიელია</p>
          <p className="text-sm text-[#465940]/60 max-w-xs mx-auto">
            რეცეპტი გამოჩნდება მხოლოდ მაშინ, როცა შემადგენელი ინგრედიენტები ცალ-ცალკე იქნება გასინჯული — დაიწყე "პირველი საკვები" ტაბიდან.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-10 text-center">
          <p className="text-4xl mb-3"></p>
          <p className="font-bold text-[#465940] mb-1">ჯერ კომბინაცია არ არის</p>
          <p className="text-sm text-[#465940]/60">გასინჯე მეტი ინგრედიენტი — ახალი კომბინაციები თანდათან გამოჩნდება</p>
        </div>
      ) : (
        <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-4 space-y-2">
          {visible.map(s => (
            <SuggestionCard key={s.id} s={s} childId={child.id} onLogged={fetchAllowed} />
          ))}
        </div>
      )}
    </div>
  );
}
