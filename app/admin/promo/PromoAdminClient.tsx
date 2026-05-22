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
  RECIPE_PLAN: 'bg-blue-100 text-blue-700',
  FULL_PLAN: 'bg-green-100 text-green-700',
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
          <h1 className="text-3xl font-black text-gray-900">პრომოკოდები</h1>
          <p className="text-gray-400 text-sm mt-1">{codes.length} კოდი სულ</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="bg-[#ff7f50] hover:bg-[#e86e40] text-white font-bold px-5 py-2.5 rounded-full text-sm transition"
        >
          + ახალი კოდი
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-black text-gray-900 mb-4">ახალი პრომოკოდი</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">კოდი</label>
                <input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="მაგ. PROMO2024"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-[#ff7f50]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">გეგმა</label>
                <select
                  value={form.planType}
                  onChange={e => setForm(f => ({ ...f, planType: e.target.value as any }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ff7f50]"
                >
                  <option value="RECIPE_PLAN">15₾ — რეცეპტები</option>
                  <option value="FULL_PLAN">30₾ — სრული</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">ფასდაკლება %</label>
                <input
                  type="number"
                  value={form.discountPercent}
                  onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
                  placeholder="მაგ. 20"
                  min="1"
                  max="100"
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ff7f50]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">ლიმიტი (ცარიელი = ∞)</label>
                <input
                  type="number"
                  value={form.maxUses}
                  onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                  placeholder="ულიმიტო"
                  min="1"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ff7f50]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#ff7f50] hover:bg-[#e86e40] text-white font-bold px-5 py-2 rounded-full text-sm transition disabled:opacity-50"
              >
                {loading ? 'ქმნის...' : 'შექმნა'}
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="border border-gray-200 text-gray-500 hover:border-gray-300 font-semibold px-5 py-2 rounded-full text-sm transition"
              >
                გაუქმება
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Codes list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-[#fdf6f3]">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">კოდი</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">გეგმა</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">ფასდაკლება</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">გამოყენება</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">სტატუსი</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">შექმნილია</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">მოქმედება</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {codes.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">პრომოკოდები არ არის</td>
              </tr>
            )}
            {codes.map(code => (
              <tr key={code.id} className={`hover:bg-gray-50 transition ${!code.isActive ? 'opacity-50' : ''}`}>
                <td className="px-6 py-4">
                  <span className="font-mono font-bold text-gray-900 text-sm bg-gray-100 px-2 py-0.5 rounded">{code.code}</span>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${PLAN_BADGE[code.planType]}`}>
                    {PLAN_LABELS[code.planType]}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-bold text-green-700 text-sm">{code.discountPercent}%</span>
                  {code.discountPercent > 0 && (
                    <span className="ml-1.5 text-xs text-gray-400">
                      → {Math.round((code.planType === 'RECIPE_PLAN' ? 15 : 30) * (1 - code.discountPercent / 100))}₾
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {code._count.users}
                  {code.maxUses ? <span className="text-gray-400"> / {code.maxUses}</span> : <span className="text-gray-400"> / ∞</span>}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => handleToggle(code.id, code.isActive)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                      code.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${code.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {code.isActive ? 'აქტიური' : 'გამორთული'}
                  </button>
                </td>
                <td className="px-4 py-4 text-sm text-gray-400">
                  {new Date(code.createdAt).toLocaleDateString('ka-GE')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(code.id, code.code)}
                    className="text-xs text-red-400 hover:text-red-600 font-semibold transition"
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
