'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;
const ageGroups = ['FROM_6', 'FROM_9', 'FROM_12', 'FROM_24'] as const;

export default function NewPlanPage() {
  const router = useRouter();
  const [titleKa, setTitleKa] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [ageGroup, setAgeGroup] = useState<string>('FROM_24');
  const [dayOffset, setDayOffset] = useState('0');
  const [dishes, setDishes] = useState<any[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/meals')
      .then((r) => r.json())
      .then((data) => setDishes(Array.isArray(data) ? data : data.meals ?? []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleKa || !titleEn) return alert('Fill in both titles');
    setLoading(true);

    const items = mealTypes
      .filter((t) => selectedDishes[t])
      .map((t) => ({ mealType: t, dishId: selectedDishes[t] }));

    const res = await fetch('/api/meal-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titleKa, titleEn, ageGroup, dayOffset: Number(dayOffset), items }),
    });

    if (res.ok) {
      router.push('/admin/plans');
      router.refresh();
    } else {
      alert('Failed to create plan');
      setLoading(false);
    }
  };

  const dishesByType = (type: string) =>
    dishes.filter((d) => d.mealType === type);

  return (
    <div className="mx-auto max-w-2xl rounded-[24px] bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold text-[#241915]">New meal plan</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#241915]">Title EN</label>
            <input
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full rounded-xl border border-[#f0e4df] bg-[#fff8f6] px-4 py-2.5 text-sm outline-none focus:border-[#ff7f50]"
              placeholder="Today's preschool menu"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#241915]">Title KA</label>
            <input
              value={titleKa}
              onChange={(e) => setTitleKa(e.target.value)}
              className="w-full rounded-xl border border-[#f0e4df] bg-[#fff8f6] px-4 py-2.5 text-sm outline-none focus:border-[#ff7f50]"
              placeholder="დღევანდელი მენიუ"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#241915]">Age group</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full rounded-xl border border-[#f0e4df] bg-[#fff8f6] px-4 py-2.5 text-sm outline-none focus:border-[#ff7f50]"
            >
              {ageGroups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#241915]">Day offset</label>
            <input
              type="number"
              min="0"
              value={dayOffset}
              onChange={(e) => setDayOffset(e.target.value)}
              className="w-full rounded-xl border border-[#f0e4df] bg-[#fff8f6] px-4 py-2.5 text-sm outline-none focus:border-[#ff7f50]"
            />
          </div>
        </div>

        <div className="rounded-xl border border-[#f0e4df] p-5">
          <p className="mb-4 font-semibold text-[#241915]">Assign dishes</p>
          <div className="space-y-3">
            {mealTypes.map((type) => (
              <div key={type} className="flex items-center gap-3">
                <span className="w-24 text-xs font-bold uppercase text-[#57423b]">{type}</span>
                <select
                  value={selectedDishes[type] ?? ''}
                  onChange={(e) => setSelectedDishes((p) => ({ ...p, [type]: e.target.value }))}
                  className="flex-1 rounded-xl border border-[#f0e4df] bg-[#fff8f6] px-3 py-2 text-sm outline-none focus:border-[#ff7f50]"
                >
                  <option value="">— skip —</option>
                  {dishesByType(type).map((d) => (
                    <option key={d.id} value={d.id}>{d.titleEn || d.titleKa}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#ff7f50] py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Create plan'}
        </button>
      </form>
    </div>
  );
}
