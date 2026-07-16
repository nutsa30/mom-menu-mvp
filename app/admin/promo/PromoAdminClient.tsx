'use client';

import { useState } from 'react';
import { createPromoCode, togglePromoCode, deletePromoCode } from './actions';

type PromoCode = {
  id: string;
  code: string;
  planType: 'RECIPE_PLAN' | 'FULL_PLAN';
  discountPercent: number;
  maxUses: number | null;
  isActive: boolean;
  createdAt: Date;
  _count: { users: number };
};

const PLAN_LABELS: Record<string, string> = {
  RECIPE_PLAN: '15₾ — რეცეპტები',
  FULL_PLAN: '30₾ — სრული',
};

const PLAN_BADGE: Record<string, string> = {
  RECIPE_PLAN: 'bg-[#FDFBF0]/10 text-[#465940]',
  FULL_PLAN: 'bg-[#465940]/20 text-[#465940]',
};

export default function PromoAdminClient({ codes }: { codes: PromoCode[] }) {
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: '',
    planType: 'RECIPE_PLAN' as 'RECIPE_PLAN' | 'FULL_PLAN',
    discountPercent: '',
    maxUses: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    setLoading(true);
    await createPromoCode({
      code: form.code.trim().toUpperCase(),
      planType: form.planType,
      discountPercent: form.discountPercent ? parseInt(form.discountPercent) : 0,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
    });
    setForm({ code: '', planType: 'RECIPE_PLAN', discountPercent: '', maxUses: '' });
    setCreating(false);
    setLoading(false);
  };

  const handleToggle = async (id: string, current: boolean) => {
    await togglePromoCode(id, !current);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`წაშლა "${code}"?`)) return;
    await deletePromoCode(id);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 lg:mb-8 gap-3">
        <div>
          <h1 className="text-3xl font-black text-[#465940]">პრომოკოდები</h1>
          <p className="text-[#465940]/60 text-sm mt-1">{codes.length} კოდი სულ</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] font-bold px-5 py-2.5 rounded-full text-sm transition"
        >
          + ახალი კოდი
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-6 mb-6">
          <h2 className="font-black text-[#465940] mb-4">ახალი პრომოკოდი</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#465940]/70 mb-1">კოდი</label>
                <input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="მაგ. PROMO2024"
                  className="w-full border border-[#465940]/20 rounded-xl px-3 py-2 text-sm font-mono uppercase text-[#465940] bg-white focus:outline-none focus:border-[#465940]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#465940]/70 mb-1">გეგმა</label>
                <select
                  value={form.planType}
                  onChange={e => setForm(f => ({ ...f, planType: e.target.value as any }))}
                  className="w-full border border-[#465940]/20 rounded-xl px-3 py-2 text-sm text-[#465940] bg-white focus:outline-none focus:border-[#465940]"
                >
                  <option value="RECIPE_PLAN">15₾ — რეცეპტები</option>
                  <option value="FULL_PLAN">30₾ — სრული</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#465940]/70 mb-1">ფასდაკლება %</label>
                <input
                  type="number"
                  value={form.discountPercent}
                  onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
                  placeholder="მაგ. 20"
                  min="1"
                  max="100"
                  required
                  className="w-full border border-[#465940]/20 rounded-xl px-3 py-2 text-sm text-[#465940] bg-white focus:outline-none focus:border-[#465940]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#465940]/70 mb-1">ლიმიტი (ცარიელი = ∞)</label>
                <input
                  type="number"
                  value={form.maxUses}
                  onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                  placeholder="ულიმიტო"
                  min="1"
                  className="w-full border border-[#465940]/20 rounded-xl px-3 py-2 text-sm text-[#465940] bg-white focus:outline-none focus:border-[#465940]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] font-bold px-5 py-2 rounded-full text-sm transition disabled:opacity-50"
              >
                {loading ? 'ქმნის...' : 'შექმნა'}
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="border border-[#465940]/20 text-[#465940]/70 hover:border-[#465940]/30 font-semibold px-5 py-2 rounded-full text-sm transition"
              >
                გაუქმება
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Codes list */}
      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead style={{ background: '#465940' }}>
            <tr>
              {['კოდი','გეგმა','ფასდაკლება','გამოყენება','სტატუსი','შექმნილია','მოქმედება'].map((h, i) => (
                <th key={h} style={{ color: 'rgba(253,251,240,0.8)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '10px 16px', textAlign: i === 6 ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#465940]/5">
            {codes.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[#465940]/60 text-sm">პრომოკოდები არ არის</td>
              </tr>
            )}
            {codes.map(code => (
              <tr key={code.id} className={`hover:bg-[#465940]/5 transition ${!code.isActive ? 'opacity-50' : ''}`}>
                <td className="px-6 py-4">
                  <span className="font-mono font-bold text-[#465940] text-sm bg-[#465940]/10 px-2 py-0.5 rounded">{code.code}</span>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${PLAN_BADGE[code.planType]}`}>
                    {PLAN_LABELS[code.planType]}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-bold text-[#465940] text-sm">{code.discountPercent}%</span>
                  {code.discountPercent > 0 && (
                    <span className="ml-1.5 text-xs text-[#465940]/60">
                      → {Math.round((code.planType === 'RECIPE_PLAN' ? 15 : 30) * (1 - code.discountPercent / 100))}₾
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-[#465940]/80">
                  {code._count.users}
                  {code.maxUses ? <span className="text-[#465940]/60"> / {code.maxUses}</span> : <span className="text-[#465940]/60"> / ∞</span>}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => handleToggle(code.id, code.isActive)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                      code.isActive ? 'bg-[#465940]/20 text-[#465940] hover:bg-[#465940]/30' : 'bg-[#465940]/10 text-[#465940]/70 hover:bg-[#465940]/15'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${code.isActive ? 'bg-[#465940]' : 'bg-[#FDFBF0]/40'}`} />
                    {code.isActive ? 'აქტიური' : 'გამორთული'}
                  </button>
                </td>
                <td className="px-4 py-4 text-sm text-[#465940]/60">
                  {new Date(code.createdAt).toLocaleDateString('ka-GE')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(code.id, code.code)}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fecaca'; (e.currentTarget as HTMLButtonElement).style.color = '#b91c1c'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2'; (e.currentTarget as HTMLButtonElement).style.color = '#dc2626'; }}
                    style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 12px', borderRadius: 999, background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer' }}
                  >
                    წაშლა
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
