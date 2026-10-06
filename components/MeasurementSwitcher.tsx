'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useExperience } from './ExperienceProvider';
export default function MeasurementSwitcher() {
  const { units, locale } = useExperience();
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  return <label className="flex flex-wrap items-center gap-2 text-sm text-[#465940]">
    {locale === 'en' ? 'Measurements' : 'საზომი ერთეულები'}
    <select value={units} disabled={busy} className="input settings-input w-auto" onChange={async e => {
      setBusy(true); setError('');
      try {
        const response = await fetch('/api/preferences', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ units: e.target.value }) });
        if (!response.ok) throw new Error(); router.refresh();
      } catch { setError(locale === 'en' ? 'Could not save preferences.' : 'არჩევანი ვერ შეინახა.'); }
      finally { setBusy(false); }
    }}><option value="metric">g / ml</option><option value="us">oz / US fl oz</option><option value="uk">oz / UK fl oz</option></select>
    {error && <span role="alert">{error}</span>}
  </label>;
}
