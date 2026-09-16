'use client';

import { useState } from 'react';

const card = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm';

// Feature 8, "კვების SOS" — the one thing every other today-feature ties into. Deliberately
// routes into EXISTING functionality rather than building anything new: 🔴/🟠 just set the
// same DayStatus (feature 1) the "დღეს რა ხდება?" picker sets; 🟡 opens the existing "ახალი
// პროდუქტების გაცნობა" tracker on the "შვილი" tab; 🟢 is a plain affirming message; 🔵 opens
// the existing /recipes catalog (with feature 10's filters). No new pages, no new data.
const OPTIONS = [
  { key: 'NOT_EATING',   color: '#E05353', dot: '🔴', label: 'საერთოდ არ ჭამს' },
  { key: 'ONLY_SPECIFIC',color: '#E08A35', dot: '🟠', label: 'მხოლოდ რამდენიმე რამ უნდა' },
  { key: 'NEW_FOOD',     color: '#D4B33C', dot: '🟡', label: 'ახალი პროდუქტის დამატება მინდა' },
  { key: 'ALL_GOOD',     color: '#4C9A5B', dot: '🟢', label: 'ყველაფერი კარგადაა' },
  { key: 'NEED_IDEAS',   color: '#3B7FBF', dot: '🔵', label: 'იდეები მჭირდება' },
];

export default function MealSOS({
  child, date, onStatusSet, onWantsIntro,
}: {
  child: any; date: string; onStatusSet: () => void; onWantsIntro: (childId: string) => void;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  if (!child) return null;

  const setDayStatus = async (reason: string) => {
    setSaving(reason);
    setMessage(null);
    await fetch('/api/day-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId: child.id, date, mode: 'NOT_EATING', reason }),
    });
    setSaving(null);
    onStatusSet();
    setMessage('აღინიშნა ✓ — რჩევა და იდეები იხილე ზემოთ, "დღეს რა ხდება?"-ში 👆');
  };

  const handle = (key: string) => {
    if (key === 'NOT_EATING') { setDayStatus('WONT_EAT'); return; }
    if (key === 'ONLY_SPECIFIC') { setDayStatus('ONLY_SPECIFIC'); return; }
    if (key === 'NEW_FOOD') { setMessage(null); onWantsIntro(child.id); return; }
    if (key === 'ALL_GOOD') { setMessage(`მშვენიერია! 🌿 გააგრძელე ასე, ${child.name} კარგად საქმეობს.`); return; }
    if (key === 'NEED_IDEAS') { window.open('/recipes', '_blank', 'noopener'); return; }
  };

  return (
    <div className={`${card} p-4`}>
      <p className="text-sm font-bold text-[#465940] mb-1">კვების SOS</p>
      <p className="text-xs text-[#465940]/60 mb-3">რა ხდება დღეს?</p>
      <div className="flex gap-2 flex-wrap">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => handle(o.key)}
            disabled={saving === o.key}
            className="px-3 py-2 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940] hover:bg-[#465940] hover:text-[#FDFBF0] transition disabled:opacity-60"
          >
            {o.dot} {o.label}
          </button>
        ))}
      </div>
      {message && (
        <p className="text-xs text-[#465940]/70 mt-3 bg-[#465940]/5 rounded-xl px-3 py-2 leading-relaxed">{message}</p>
      )}
    </div>
  );
}
