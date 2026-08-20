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
          ? 'bg-[#465940]/20 text-[#465940] hover:bg-[#465940]/30'
          : 'bg-[#465940] text-[#FDFBF0] hover:bg-[#465940]/10'
      }`}
    >
      {loading ? '...' : isBlocked ? d.unblockBtn : d.blockBtn}
    </button>
  );
}

export function GiftSubscriptionButton({
  userId, currentStatus, isGifted, recipePrice = 15, fullPrice = 30,
}: { userId: string; currentStatus: string; isGifted: boolean; recipePrice?: number; fullPrice?: number }) {
  const GIFT_OPTIONS = [
    { value: 'RECIPE_PLAN', label: `${recipePrice}₾ — რეცეპტები`, color: 'text-[#465940]' },
    { value: 'FULL_PLAN', label: `${fullPrice}₾ — სრული`, color: 'text-[#465940]' },
    { value: 'FREE', label: 'გაუქმება', color: 'text-[#FDFBF0]' },
  ];
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

  const removeGiftFlag = async () => {
    if (!confirm('მოეხსნას "გაჩუქებული" ნიშანი? პაკეტი და თარიღები უცვლელი დარჩება — გამოსადეგია, თუ ეს რეალურად გადახდილი გამოწერაა.')) return;
    setLoading(true);
    setOpen(false);
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isGifted: false }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={loading}
        className={`rounded-full px-3 py-1 text-xs font-bold transition disabled:opacity-50 flex items-center gap-1 ${
          hasGift
            ? 'bg-[#FDFBF0]/10 text-[#465940] hover:bg-[#FDFBF0]/10'
            : 'bg-[#465940]/10 text-[#465940]/70 hover:bg-[#465940]/15'
        }`}
      >
        {loading ? '...' : hasGift ? '🎁 გაჩუქებული' : '🎁 გაჩუქება'}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[#FDFBF0] border border-[#465940]/10 rounded-xl shadow-lg z-50 min-w-[200px] py-1 overflow-hidden">
          {GIFT_OPTIONS.filter(o => o.value !== currentStatus).map(opt => (
            <button
              key={opt.value}
              onClick={() => gift(opt.value)}
              className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#465940]/5 transition ${opt.color}`}
            >
              {opt.label}
            </button>
          ))}
          {hasGift && (
            <button
              onClick={removeGiftFlag}
              className="w-full text-left px-4 py-2 text-xs font-semibold text-[#465940] hover:bg-[#465940]/5 transition border-t border-[#465940]/10"
            >
              ✕ მოხსნა (რეალურად გადახდილია)
            </button>
          )}
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
          ? 'bg-[#465940] text-[#FDFBF0] hover:bg-[#465940]/80'
          : 'bg-[#465940]/10 text-[#465940]/70 hover:bg-[#465940]/15'
      }`}
    >
      {loading ? '...' : isAdmin ? d.adminRole : d.makeAdmin}
    </button>
  );
}
