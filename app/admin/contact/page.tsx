'use client';

import { useState, useEffect } from 'react';

type Settings = {
  titleKa: string; titleEn: string;
  subtitleKa: string; subtitleEn: string;
  introKa: string; introEn: string;
  email: string;
  responseTimeKa: string; responseTimeEn: string;
  workingHoursKa: string; workingHoursEn: string;
};

const FIELDS: { key: keyof Settings; label: string; multiline?: boolean }[] = [
  { key: 'titleKa',        label: 'სათაური (ქარ)' },
  { key: 'titleEn',        label: 'სათაური (eng)' },
  { key: 'subtitleKa',     label: 'ქვესათაური (ქარ)',   multiline: true },
  { key: 'subtitleEn',     label: 'ქვესათაური (eng)',   multiline: true },
  { key: 'introKa',        label: 'შესავალი ტექსტი (ქარ)', multiline: true },
  { key: 'introEn',        label: 'შესავალი ტექსტი (eng)', multiline: true },
  { key: 'email',          label: 'ელ-ფოსტა' },
  { key: 'responseTimeKa', label: 'პასუხის დრო (ქარ)' },
  { key: 'responseTimeEn', label: 'პასუხის დრო (eng)' },
  { key: 'workingHoursKa', label: 'სამუშაო საათები (ქარ)' },
  { key: 'workingHoursEn', label: 'სამუშაო საათები (eng)' },
];

export default function AdminContactPage() {
  const [form, setForm] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/contact-settings').then(r => r.json()).then(setForm);
  }, []);

  const set = (key: keyof Settings, val: string) =>
    setForm(f => f ? { ...f, [key]: val } : f);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    await fetch('/api/admin/contact-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!form) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#465940' }}>იტვირთება...</div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#465940', margin: 0 }}>
            ✉️ კონტაქტის გვერდი
          </h1>
          <p style={{ color: '#465940', opacity: 0.5, fontSize: '0.82rem', margin: '0.25rem 0 0' }}>
            /contact გვერდის ტექსტები
          </p>
        </div>
        <button onClick={save} disabled={saving}
          style={{
            padding: '10px 24px', background: saving ? '#ccc' : '#465940',
            color: '#FDFBF0', border: 'none', borderRadius: 999,
            fontWeight: 800, fontSize: '0.85rem', cursor: saving ? 'default' : 'pointer',
          }}>
          {saved ? '✓ შენახულია' : saving ? 'ინახება...' : 'შენახვა'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {FIELDS.map(f => (
          <div key={f.key} style={{ background: '#fff', border: '1px solid rgba(70,89,64,.12)', borderRadius: 12, padding: '1rem 1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#465940', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              {f.label}
            </label>
            {f.multiline ? (
              <textarea
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                rows={3}
                style={{ width: '100%', border: '1.5px solid rgba(70,89,64,.2)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.88rem', color: '#465940', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            ) : (
              <input
                type={f.key === 'email' ? 'email' : 'text'}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                style={{ width: '100%', border: '1.5px solid rgba(70,89,64,.2)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.88rem', color: '#465940', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
        <button onClick={save} disabled={saving}
          style={{
            padding: '12px 32px', background: saving ? '#ccc' : '#465940',
            color: '#FDFBF0', border: 'none', borderRadius: 999,
            fontWeight: 800, fontSize: '0.9rem', cursor: saving ? 'default' : 'pointer',
          }}>
          {saved ? '✓ შენახულია!' : saving ? 'ინახება...' : 'შენახვა'}
        </button>
      </div>
    </div>
  );
}
