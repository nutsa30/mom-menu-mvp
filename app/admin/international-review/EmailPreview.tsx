'use client';
import { useEffect, useState } from 'react';
export default function EmailPreview({ keys }: { keys: string[] }) {
  const [key, setKey] = useState('welcome');
  const [lang, setLang] = useState('en');
  const [interval, setInterval] = useState('1');
  const [result, setResult] = useState<{ html: string; subject: string } | null>(null);
  const [status, setStatus] = useState('');
  const url = `/api/admin/email-preview?key=${encodeURIComponent(key)}&lang=${lang}&interval=${interval}`;
  useEffect(() => { let current = true; setResult(null); fetch(url).then(r => { if (!r.ok) throw Error(); return r.json(); }).then(data => { if (current) setResult(data); }).catch(() => { if (current) setStatus('Preview failed'); }); return () => { current = false; }; }, [url]);
  return <section className="space-y-4">
    <h2 className="text-xl font-bold">წერილების შემოწმება / Email preview</h2>
    <div className="flex flex-wrap gap-3">
      <select className="input settings-input w-auto" aria-label="Template" value={key} onChange={e => setKey(e.target.value)}>{keys.map(k => <option key={k}>{k}</option>)}</select>
      <select className="input settings-input w-auto" aria-label="Language" value={lang} onChange={e => setLang(e.target.value)}><option value="ka">ქართული · GEL</option><option value="en">English · USD</option></select>
      <select className="input settings-input w-auto" aria-label="Plan" value={interval} onChange={e => setInterval(e.target.value)}>{['1','3','6'].map(i => <option key={i} value={i}>{i} months</option>)}</select>
      <button className="px-4 py-2 rounded bg-[#465940] text-white" onClick={async () => { setStatus('Sending…'); try { const r = await fetch(url, { method: 'POST' }); const d = await r.json(); setStatus(d.success ? d.sandbox ? 'Local preview: no email was sent.' : 'Test sent to your admin account email.' : 'Send failed'); } catch { setStatus('Send failed'); } }}>საცდელი წერილი ჩემს მისამართზე</button>
    </div>
    <p>{status}</p><p>{result?.subject}</p>
    <iframe title="Email preview" sandbox="" srcDoc={result?.html || ''} className="w-full h-[650px] border rounded bg-white" />
  </section>;
}
