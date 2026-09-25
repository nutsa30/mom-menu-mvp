'use client';

import { useState, useTransition } from 'react';
import { deleteWithdrawal } from '@/app/admin/analytics/actions';

export default function WithdrawalDeleteButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] text-[#465940]/60">დარწმუნებული ხარ?</span>
        <button
          onClick={() => startTransition(() => { deleteWithdrawal(id); })}
          disabled={pending}
          className="text-[10px] font-bold text-[#FDFBF0] bg-[#465940] px-2 py-0.5 rounded-full transition disabled:opacity-60"
        >
          {pending ? '...' : 'კი'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-[10px] font-bold text-[#465940]/60 hover:text-[#465940] transition">
          არა
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-[#465940]/40 hover:text-[#465940] transition flex-shrink-0" title="წაშლა">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </button>
  );
}
