'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useExperience } from './ExperienceProvider';

export default function OwnerPreview() {
  const { isAdmin, preview } = useExperience();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!isAdmin) return null;
  async function select(market: string) {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ market }) });
      if (!response.ok) throw new Error('Preview could not be changed.');
      const url = new URL(window.location.href);
      url.searchParams.delete('lang');
      window.location.assign(url.toString());
    } catch { setError('Preview could not be changed.'); setBusy(false); }
  }
  return <aside className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950" aria-label="Owner preview">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
      <strong>{preview ? `ADMIN PREVIEW: ${preview === 'INTL' ? 'INTERNATIONAL' : 'GEORGIA'}` : 'OWNER PREVIEW · AUTOMATIC'}</strong>
      <select aria-label="Preview market" disabled={busy} value={preview || 'AUTO'} onChange={e => select(e.target.value)} className="rounded-lg border border-amber-300 bg-white px-3 py-2">
        <option value="AUTO">Automatic / Live</option><option value="GE">Georgian · GEL</option><option value="INTL">International · USD</option>
      </select>
      {preview && <button disabled={busy} onClick={() => select('AUTO')} className="underline">Return to Automatic Mode</button>}
      <a className="underline" href="/admin/international-review">წერილები და ინგლისური კონტენტის შემოწმება</a>
      <Link className="underline" href="/">მთლიანი საიტის ნახვა</Link>
      <Link className="underline" href="/dashboard">მომხმარებლის დაშბორდი</Link>
      <Link className="underline" href="/recipes">რეცეპტები</Link>
      {preview && <span>Preview changes presentation only. Your account&apos;s real billing market stays unchanged.</span>}
      {error && <span role="alert">{error}</span>}
    </div>
  </aside>;
}
