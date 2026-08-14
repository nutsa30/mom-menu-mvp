'use client';

import { useState } from 'react';

type Template = { id: number; mealType: string; title: string; body: string; active: boolean };
type Schedule = { paused: boolean; breakfastHour: number; lunchHour: number; snackHour: number; dinnerHour: number; weeklyHour: number };

const MEAL_TYPES = [
  { key: 'breakfast', label: '☀️ საუზმე',       scheduleKey: 'breakfastHour' as keyof Schedule },
  { key: 'lunch',     label: '🍽️ სადილი',        scheduleKey: 'lunchHour'     as keyof Schedule },
  { key: 'snack',     label: '🍎 სნექი',          scheduleKey: 'snackHour'     as keyof Schedule },
  { key: 'dinner',    label: '🌙 ვახშამი',        scheduleKey: 'dinnerHour'    as keyof Schedule },
  { key: 'weekly',    label: '📅 კვირის გეგმა',   scheduleKey: 'weeklyHour'    as keyof Schedule },
];

function hourToTime(h: number) { return `${String(h).padStart(2, '0')}:00`; }
function timeToHour(t: string) { return parseInt(t.split(':')[0], 10); }

export default function NotificationsClient({
  initial,
  initialSchedule,
}: {
  initial: Template[];
  initialSchedule: Schedule;
}) {
  const [templates, setTemplates] = useState<Template[]>(initial);
  const [editing, setEditing] = useState<Template | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [saving, setSaving] = useState(false);

  const [schedule, setSchedule] = useState<Schedule>(initialSchedule);
  const [scheduleEditing, setScheduleEditing] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [pauseToggling, setPauseToggling] = useState(false);

  const togglePaused = async () => {
    setPauseToggling(true);
    const next = !schedule.paused;
    const r = await fetch('/api/admin/push-schedule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...schedule, paused: next }),
    });
    if (r.ok) setSchedule(s => ({ ...s, paused: next }));
    setPauseToggling(false);
  };

  const byType = (type: string) => templates.filter(t => t.mealType === type);

  const reload = async () => {
    const r = await fetch('/api/admin/push-templates');
    setTemplates(await r.json());
  };

  const save = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    setSaving(true);
    if (editing) {
      await fetch('/api/admin/push-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, title: newTitle, body: newBody, active: editing.active }),
      });
    } else if (adding) {
      await fetch('/api/admin/push-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealType: adding, title: newTitle, body: newBody }),
      });
    }
    await reload();
    setEditing(null);
    setAdding(null);
    setNewTitle('');
    setNewBody('');
    setSaving(false);
  };

  const toggleActive = async (t: Template) => {
    await fetch('/api/admin/push-templates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id, title: t.title, body: t.body, active: !t.active }),
    });
    await reload();
  };

  const remove = async (id: number) => {
    if (!confirm('წაიშალოს?')) return;
    await fetch('/api/admin/push-templates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await reload();
  };

  const startEdit = (t: Template) => {
    setEditing(t);
    setAdding(null);
    setNewTitle(t.title);
    setNewBody(t.body);
  };

  const startAdd = (type: string) => {
    setAdding(type);
    setEditing(null);
    setNewTitle('');
    setNewBody('');
  };

  const cancel = () => { setEditing(null); setAdding(null); setNewTitle(''); setNewBody(''); };

  const startScheduleEdit = (key: string, currentHour: number) => {
    setScheduleEditing(key);
    setScheduleTime(hourToTime(currentHour));
  };

  const saveSchedule = async (scheduleKey: keyof Schedule) => {
    setScheduleSaving(true);
    const hour = timeToHour(scheduleTime);
    const updated = { ...schedule, [scheduleKey]: hour };
    const r = await fetch('/api/admin/push-schedule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (r.ok) setSchedule(updated);
    setScheduleEditing(null);
    setScheduleSaving(false);
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FDFBF0', margin: 0 }}>
          🔔 Push შეტყობინებების შაბლონები
        </h1>
        <button
          onClick={togglePaused}
          disabled={pauseToggling}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '8px 18px', borderRadius: 999, fontWeight: 800, fontSize: '0.85rem',
            cursor: pauseToggling ? 'not-allowed' : 'pointer', border: 'none', transition: 'all 0.15s',
            background: schedule.paused ? '#ef4444' : '#22c55e',
            color: '#fff',
            opacity: pauseToggling ? 0.6 : 1,
          }}>
          {pauseToggling ? '...' : schedule.paused ? '⏸ შეტყობინებები გამორთულია' : '▶ შეტყობინებები ჩართულია'}
        </button>
      </div>
      <p style={{ color: '#FDFBF0', opacity: 0.6, fontSize: '0.85rem', marginBottom: '2rem' }}>
        ყოველდღე ერთ-ერთი შეტყობინება შემთხვევით გაიგზავნება. გამორთული შეტყობინებები არ გაიგზავნება.
      </p>

      {MEAL_TYPES.map(mt => {
        const currentHour = schedule[mt.scheduleKey];
        const isEditingTime = scheduleEditing === mt.key;

        return (
          <div key={mt.key} style={{ background: '#fff', border: '1px solid rgba(70,89,64,.12)', borderRadius: 16, marginBottom: '1.25rem', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: '#465940', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                <span style={{ color: '#FDFBF0', fontWeight: 800, fontSize: '1rem' }}>{mt.label}</span>

                {/* Time display / edit */}
                {isEditingTime ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                      style={{ padding: '2px 8px', borderRadius: 6, border: 'none', fontSize: '0.82rem', color: '#465940', background: '#FDFBF0', outline: 'none', fontWeight: 700 }}
                    />
                    <button onClick={() => saveSchedule(mt.scheduleKey)} disabled={scheduleSaving}
                      style={{ padding: '3px 10px', background: '#FDFBF0', color: '#465940', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>
                      {scheduleSaving ? '...' : '✓'}
                    </button>
                    <button onClick={() => setScheduleEditing(null)}
                      style={{ padding: '3px 8px', background: 'rgba(253,251,240,.15)', color: '#FDFBF0', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <button onClick={() => startScheduleEdit(mt.key, currentHour)}
                    style={{ background: 'rgba(253,251,240,.15)', color: '#FDFBF0', border: '1px solid rgba(253,251,240,.25)', borderRadius: 6, padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    🕐 {hourToTime(currentHour)}
                    <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>✎</span>
                  </button>
                )}
              </div>

              <span style={{ background: 'rgba(253,251,240,.15)', color: '#FDFBF0', fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: 999, flexShrink: 0 }}>
                {byType(mt.key).filter(t => t.active).length} აქტიური
              </span>
            </div>

            {/* Templates */}
            <div style={{ padding: '0.5rem 0' }}>
              {byType(mt.key).length === 0 && (
                <p style={{ padding: '0.75rem 1.25rem', color: '#465940', opacity: 0.4, fontSize: '0.82rem' }}>
                  შაბლონი არ არის დამატებული
                </p>
              )}
              {byType(mt.key).map(t => (
                <div key={t.id} style={{
                  padding: '0.75rem 1.25rem',
                  borderBottom: '1px solid rgba(70,89,64,.06)',
                  opacity: t.active ? 1 : 0.45,
                }}>
                  {editing?.id === t.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                        placeholder="სათაური (მაგ: ☀️ საუზმის დრო!)"
                        className="settings-input"
                        style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1.5px solid rgba(70,89,64,.3)', fontSize: '0.85rem', outline: 'none' }} />
                      <textarea value={newBody} onChange={e => setNewBody(e.target.value)}
                        placeholder="ტექსტი"
                        rows={2}
                        className="settings-input"
                        style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1.5px solid rgba(70,89,64,.3)', fontSize: '0.82rem', resize: 'vertical', outline: 'none' }} />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={save} disabled={saving}
                          style={{ padding: '6px 16px', background: '#465940', color: '#FDFBF0', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                          {saving ? '...' : 'შენახვა'}
                        </button>
                        <button onClick={cancel}
                          style={{ padding: '6px 14px', background: 'transparent', color: '#465940', border: '1px solid rgba(70,89,64,.3)', borderRadius: 8, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                          გაუქმება
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#465940', fontSize: '0.85rem' }}>{t.title}</div>
                        <div style={{ color: '#465940', opacity: 0.65, fontSize: '0.8rem', marginTop: 2 }}>{t.body}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                        <button onClick={() => toggleActive(t)} title={t.active ? 'გამორთვა' : 'ჩართვა'}
                          style={{ padding: '4px 10px', background: t.active ? '#e8f5e9' : '#fafafa', color: t.active ? '#2e7d32' : '#888', border: '1px solid', borderColor: t.active ? '#a5d6a7' : '#ddd', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                          {t.active ? 'ჩართული' : 'გამორთული'}
                        </button>
                        <button onClick={() => startEdit(t)}
                          style={{ padding: '4px 10px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', color: '#555' }}>
                          რედაქტირება
                        </button>
                        <button onClick={() => remove(t.id)}
                          style={{ padding: '4px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', color: '#dc2626' }}>
                          წაშლა
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add form */}
              {adding === mt.key ? (
                <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    placeholder="სათაური (მაგ: ☀️ საუზმის დრო!)"
                    className="settings-input"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1.5px solid #465940', fontSize: '0.85rem', outline: 'none' }}
                    autoFocus />
                  <textarea value={newBody} onChange={e => setNewBody(e.target.value)}
                    placeholder="ტექსტი"
                    rows={2}
                    className="settings-input"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1.5px solid #465940', fontSize: '0.82rem', resize: 'vertical', outline: 'none' }} />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={save} disabled={saving}
                      style={{ padding: '6px 16px', background: '#465940', color: '#FDFBF0', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                      {saving ? '...' : 'დამატება'}
                    </button>
                    <button onClick={cancel}
                      style={{ padding: '6px 14px', background: 'transparent', color: '#465940', border: '1px solid rgba(70,89,64,.3)', borderRadius: 8, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                      გაუქმება
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => startAdd(mt.key)}
                  style={{ margin: '0.5rem 1.25rem', padding: '6px 14px', background: 'transparent', color: '#465940', border: '1px dashed rgba(70,89,64,.35)', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                  + ახალი შეტყობინება
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
