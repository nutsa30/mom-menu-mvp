'use client';

import { useEffect, useState } from 'react';
import RecipeModal from './RecipeModal';

const card = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm';

// Feature 1 ("დღეს საერთოდ არ ჭამს") + feature 7 ("დღეს სახლში არ ვჭამთ") — one shared
// "დღეს რა ხდება?" picker. Collapsed and out of the way on an ordinary day; when a mode
// is set, shows short, non-medical, non-judgmental guidance (never a diagnosis) plus, for
// NOT_EATING only, a couple of genuinely simple real-dish ideas. Today-only, like every
// other write action on this tab.
const NOT_EATING_REASONS: Record<string, { label: string; emoji: string; text: string }> = {
  WONT_EAT: { label: 'საერთოდ არ ჭამს', emoji: '😐', text: 'ხანდახან ბავშვები უბრალოდ არ არიან მშიერი — ეს ნორმალურია. სცადე შესთავაზო საკვები ზეწოლის გარეშე და დაუშვი, რომ თვითონ გადაწყვიტოს, რამდენი უნდა.' },
  ONLY_SPECIFIC: { label: 'მხოლოდ გარკვეულ კერძებს ჭამს', emoji: '🍽️', text: 'ეს ჩვეულებრივი ეტაპია. სცადე შესთავაზო ის, რაც აქამდე მოსწონდა — ახალი კერძები პარალელურად, ზეწოლის გარეშე.' },
  TEETHING: { label: 'კბილები ეჭრება', emoji: '🦷', text: 'კბილების ჭრისას ღრძილები მტკივნეულია და მადა ბუნებრივად მცირდება. სცადე გრილი და რბილი საკვები.' },
  SICK: { label: 'ავად არის', emoji: '🤒', text: 'ავადმყოფობისას მადა ბუნებრივად მცირდება — მთავარია საკმარისი სითხე. საკვებზე ზეწოლა არ არის საჭირო. თუ გაწუხებს, მიმართე ექიმს.' },
  TIRED: { label: 'დაღლილია', emoji: '😴', text: 'დაღლილობისას მადა დროებით მცირდება. სცადე მშვიდ გარემოში, პატარა ულუფებით.' },
  AWAY_ALL_DAY: { label: 'მთელი დღე გარეთაა', emoji: '🎒', text: 'დღეს ჩვეული გრაფიკი გართულებულია — ეს ერთჯერადია და პრობლემა არ არის. სცადე თან წაიღო მარტივი, უსაფრთხო საკვები.' },
};

const AWAY_REASONS: Record<string, { label: string; emoji: string; text: string }> = {
  RESTAURANT: { label: 'რესტორანში ვართ', emoji: '🍝', text: 'აირჩიე რაც შეიძლება ახლოსაა ჩვეულ საკვებთან — მარტივად მომზადებული, ნაკლებად ცხარე/მარილიანი. არ არის საჭირო ზუსტად იგივეს პოვნა, რასაც სახლში ჭამს.' },
  VISITING: { label: 'სტუმრად ვართ', emoji: '🏠', text: 'სხვისი სახლის მენიუ განსხვავებულია და ეს ნორმალურია. შესთავაზე ის, რაც ხელმისაწვდომია და უსაფრთხოა, ზეწოლის გარეშე.' },
  TRAVELING: { label: 'მოგზაურობაში ვართ', emoji: '✈️', text: 'გზაზე გრაფიკი იცვლება — ეს დროებითია. მთავარია საკმარისი სითხე და ის, რაც ხელმისაწვდომი და უსაფრთხოა.' },
  ON_THE_ROAD: { label: 'გზაშია', emoji: '🚗', text: 'გზაზე მარტივი, ადვილად საჭმელი საკვები საუკეთესოა. ჩვეულ გრაფიკს სახლში დაბრუნდებით.' },
};

const MODES = [
  { key: 'NOT_EATING', label: 'საერთოდ არ ჭამს', emoji: '😐', reasons: NOT_EATING_REASONS },
  { key: 'AWAY_FROM_HOME', label: 'სახლში არ ვართ', emoji: '🚗', reasons: AWAY_REASONS },
];

export default function DayModeBanner({ child, date }: { child: any; date: string }) {
  const [status, setStatus] = useState<{ mode: string; reason: string | null } | null | undefined>(undefined);
  const [pickerMode, setPickerMode] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [recipeModal, setRecipeModal] = useState<any | null>(null);

  useEffect(() => {
    if (!child || !date) return;
    setStatus(undefined);
    setPickerMode(null);
    fetch(`/api/day-status?childId=${child.id}&date=${date}`)
      .then((r) => r.json())
      .then((d) => setStatus(d && d.mode ? d : null))
      .catch(() => setStatus(null));
  }, [child?.id, date]);

  useEffect(() => {
    if (!child || status?.mode !== 'NOT_EATING') { setSuggestions([]); return; }
    fetch(`/api/day-status/simple-suggestions?childId=${child.id}`)
      .then((r) => r.json())
      .then((d) => setSuggestions(Array.isArray(d) ? d : []))
      .catch(() => setSuggestions([]));
  }, [child?.id, status?.mode]);

  if (!child || status === undefined) return null;

  const setMode = async (mode: string, reason: string) => {
    const res = await fetch('/api/day-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId: child.id, date, mode, reason }),
    });
    const saved = await res.json();
    setStatus(saved);
    setPickerMode(null);
  };

  const clear = async () => {
    await fetch(`/api/day-status?childId=${child.id}&date=${date}`, { method: 'DELETE' });
    setStatus(null);
  };

  // Ordinary day, picker closed — a small, low-key entry point, not a banner.
  if (!status && !pickerMode) {
    return (
      <button
        onClick={() => setPickerMode('')}
        className="text-xs font-bold text-[#465940]/60 hover:text-[#465940] transition px-1"
      >
        დღეს რა ხდება? 🤔
      </button>
    );
  }

  // Picker open, no mode chosen yet.
  if (!status && pickerMode === '') {
    return (
      <div className={`${card} p-4`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-[#465940]">დღეს რა ხდება?</p>
          <button onClick={() => setPickerMode(null)} className="text-[#465940]/50 hover:text-[#465940] text-sm">✕</button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {MODES.map((m) => (
            <button key={m.key} onClick={() => setPickerMode(m.key)}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940] hover:bg-[#465940] hover:text-[#FDFBF0] transition">
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Picker open, mode chosen — pick a reason.
  if (!status && pickerMode) {
    const mode = MODES.find((m) => m.key === pickerMode)!;
    return (
      <div className={`${card} p-4`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-[#465940]">{mode.emoji} {mode.label} — რატომ?</p>
          <button onClick={() => setPickerMode('')} className="text-[#465940]/50 hover:text-[#465940] text-sm">← უკან</button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(mode.reasons).map(([key, r]) => (
            <button key={key} onClick={() => setMode(mode.key, key)}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940] hover:bg-[#465940] hover:text-[#FDFBF0] transition">
              {r.emoji} {r.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Active status.
  const mode = MODES.find((m) => m.key === status!.mode);
  const reasonInfo = mode?.reasons[status!.reason || ''];

  return (
    <div className={`${card} p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-bold text-[#465940]">
            {reasonInfo?.emoji ?? mode?.emoji} დღეს: {reasonInfo?.label ?? mode?.label}
          </p>
          {reasonInfo?.text && (
            <p className="text-xs text-[#465940]/70 mt-1.5 leading-relaxed">{reasonInfo.text}</p>
          )}
        </div>
        <button onClick={clear} className="text-[10px] font-bold text-[#465940]/50 hover:text-[#465940] flex-shrink-0 px-2 py-1">
          გაუქმება
        </button>
      </div>

      {status!.mode === 'NOT_EATING' && suggestions.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-bold text-[#465940]/60 mb-2">დღეს იქნებ ეს მარტივი კერძები? 🌱</p>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {suggestions.map((d: any) => (
              <button key={d.id} onClick={() => setRecipeModal(d)} className="flex-shrink-0 w-20 text-left group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#f0f8ee] group-hover:ring-2 group-hover:ring-[#465940]/40 transition">
                  {d.imageUrl ? <img src={d.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-[#465940]/10" />}
                </div>
                <p className="mt-1.5 text-[11px] font-bold text-[#465940] leading-snug line-clamp-2">{d.titleKa}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <RecipeModal dish={recipeModal} onClose={() => setRecipeModal(null)} ageGroup={child?.ageGroup} textureStage={child?.textureStage} />
    </div>
  );
}
