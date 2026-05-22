'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { adminDict, AdminLocale } from '@/lib/adminI18n';

export function PublishToggle({ planId, isActive, locale = 'ka' }: { planId: string; isActive: boolean; locale?: AdminLocale }) {
  const d = adminDict[locale];
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    await fetch(`/api/meal-plans/${planId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-full px-3 py-1 text-xs font-bold transition ${
        isActive
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {loading ? '...' : isActive ? d.planPublished : d.planDraft}
    </button>
  );
}

export function DeletePlanButton({ planId, locale = 'ka' }: { planId: string; locale?: AdminLocale }) {
  const d = adminDict[locale];
  const router = useRouter();

  const del = async () => {
    if (!confirm(d.deletePlanConfirm)) return;
    await fetch(`/api/meal-plans/${planId}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <button onClick={del} className="text-sm font-semibold text-red-500 hover:text-red-700">
      {d.deletePlan}
    </button>
  );
}

export function SortItemButton({
  planId,
  itemId,
  direction,
}: {
  planId: string;
  itemId: string;
  direction: 'up' | 'down';
}) {
  const router = useRouter();

  const move = async () => {
    await fetch(`/api/meal-plans/${planId}/items`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, direction }),
    });
    router.refresh();
  };

  return (
    <button onClick={move} className="rounded px-1.5 py-0.5 text-xs text-[#57423b] hover:bg-[#fff1ec]">
      {direction === 'up' ? '↑' : '↓'}
    </button>
  );
}

export function RemoveItemButton({ planId, itemId }: { planId: string; itemId: string }) {
  const router = useRouter();

  const remove = async () => {
    await fetch(`/api/meal-plans/${planId}/items?itemId=${itemId}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <button onClick={remove} className="text-xs font-semibold text-red-400 hover:text-red-600">
      ✕
    </button>
  );
}

export function AddItemForm({
  planId,
  dishes,
  locale = 'ka',
}: {
  planId: string;
  dishes: { id: string; titleEn: string; titleKa: string; mealType: string }[];
  locale?: AdminLocale;
}) {
  const d = adminDict[locale];
  const router = useRouter();
  const [dishId, setDishId] = useState('');
  const [mealType, setMealType] = useState('BREAKFAST');
  const [loading, setLoading] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishId) return;
    setLoading(true);
    await fetch(`/api/meal-plans/${planId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dishId, mealType }),
    });
    setDishId('');
    router.refresh();
    setLoading(false);
  };

  return (
    <form onSubmit={add} className="mt-3 flex gap-2 flex-wrap">
      <select
        value={mealType}
        onChange={(e) => setMealType(e.target.value)}
        className="rounded-xl border border-[#f0e4df] bg-[#fff8f6] px-3 py-2 text-sm"
      >
        {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <select
        value={dishId}
        onChange={(e) => setDishId(e.target.value)}
        className="flex-1 min-w-[180px] rounded-xl border border-[#f0e4df] bg-[#fff8f6] px-3 py-2 text-sm"
      >
        <option value="">{d.selectDish}</option>
        {dishes.map((dish) => (
          <option key={dish.id} value={dish.id}>
            {locale === 'ka' ? (dish.titleKa || dish.titleEn) : (dish.titleEn || dish.titleKa)}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading || !dishId}
        className="rounded-xl bg-[#ff7f50] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {d.addItem}
      </button>
    </form>
  );
}
