'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function TestimonialTranslation({ id, initial }: { id: string; initial: string | null }) {
  const [content, setContent] = useState(initial || '');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  return <div className="mt-3 space-y-2">
    <label className="block text-xs font-bold text-[#465940]">ინგლისური თარგმანი — გამოჩნდება ნიშნით „თარგმნილია ქართულიდან“</label>
    <textarea aria-label="English testimonial translation" value={content} onChange={e => setContent(e.target.value)} rows={3} className="w-full border rounded-lg p-2 text-sm bg-white text-[#465940]" />
    <button disabled={saving} className="btn-primary text-xs" onClick={async () => {
      setSaving(true); setMessage('');
      try {
        const result = await fetch(`/api/testimonials/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ contentEn:content }) });
        if (!result.ok) throw new Error();
        setMessage('თარგმანი შენახულია.'); router.refresh();
      } catch { setMessage('თარგმანი ვერ შეინახა.'); }
      finally { setSaving(false); }
    }}>{saving ? '...' : 'თარგმანის შენახვა'}</button>
    {message && <p role="status" className="text-xs">{message}</p>}
  </div>;
}
