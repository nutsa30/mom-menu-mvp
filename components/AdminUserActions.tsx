'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { adminDict, AdminLocale } from '@/lib/adminI18n';

export function BlockUserButton({ userId, isBlocked, locale = 'ka' }: { userId: string; isBlocked: boolean; locale?: AdminLocale }) {
  const d = adminDict[locale];
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!confirm(isBlocked ? d.unblockUserConfirm : d.blockUserConfirm)) return;
    setLoading(true);
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBlocked: !isBlocked }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-full px-3 py-1 text-xs font-bold transition disabled:opacity-50 ${
        isBlocked
          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          : 'bg-red-50 text-red-500 hover:bg-red-100'
      }`}
    >
      {loading ? '...' : isBlocked ? d.unblockBtn : d.blockBtn}
    </button>
  );
}

const GIFT_OPTIONS = [
  { value: 'RECIPE_PLAN', label: '15₾ — რეცეპტები', color: 'text-blue-700' },
  { value: 'FULL_PLAN', label: '30₾ — სრული', color: 'text-green-700' },
  { value: 'FREE', label: 'გაუქმება', color: 'text-red-500' },
];

export function GiftSubscriptionButton({ userId, currentStatus, isGifted }: { userId: string; currentStatus: string; isGifted: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const gift = async (status: string) => {
    const option = GIFT_OPTIONS.find(o => o.value === status);
    if (!confirm(`${option?.label} — დარწმუნებული ხარ?`)) return;
    setLoading(true);
    setOpen(false);
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionStatus: status, isGifted: status !== 'FREE' }),
    });
    router.refresh();
    setLoading(false);
  };

  const hasGift = isGifted && currentStatus !== 'FREE' && currentStatus !== 'CANCELED';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={loading}
        className={`rounded-full px-3 py-1 text-xs font-bold transition disabled:opacity-50 flex items-center gap-1 ${
          hasGift
            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
      >
        {loading ? '...' : hasGift ? '🎁 გაჩუქებული' : '🎁 გაჩუქება'}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 min-w-[160px] py-1 overflow-hidden">
          {GIFT_OPTIONS.filter(o => o.value !== currentStatus).map(opt => (
            <button
              key={opt.value}
              onClick={() => gift(opt.value)}
              className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-gray-50 transition ${opt.color}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ToggleAdminButton({ userId, role, locale = 'ka' }: { userId: string; role: string; locale?: AdminLocale }) {
  const d = adminDict[locale];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isAdmin = role === 'ADMIN';

  const toggle = async () => {
    if (!confirm(isAdmin ? d.removeAdminConfirm : d.grantAdminConfirm)) return;
    setLoading(true);
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: isAdmin ? 'USER' : 'ADMIN' }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-full px-3 py-1 text-xs font-bold transition disabled:opacity-50 ${
        isAdmin
          ? 'bg-[#fff1ec] text-[#ff7f50] hover:bg-orange-100'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {loading ? '...' : isAdmin ? d.adminRole : d.makeAdmin}
    </button>
  );
}
