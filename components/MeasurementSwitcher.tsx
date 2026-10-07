'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useExperience } from './ExperienceProvider';
export default function MeasurementSwitcher({ compact = false, variant = 'light' }: { compact?: boolean; variant?: 'light' | 'dark' }) {
  const { units, locale, market } = useExperience();
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  if (market !== 'INTL') return null;
  return <label className={`flex flex-wrap items-center justify-center gap-2 ${compact ? 'text-xs' : 'text-sm'} ${variant === 'dark' ? 'text-[#F5F1E4]' : 'text-[#465940]'}`}>
    {locale === 'en' ? 'Measurements' : 'საზომი ერთეულები'}
    <select value={units} disabled={busy} className={`min-w-0 max-w-full rounded-full border border-[#465940]/25 bg-[#F5F1E4] text-[#465940] ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`} onChange={async e => {
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
