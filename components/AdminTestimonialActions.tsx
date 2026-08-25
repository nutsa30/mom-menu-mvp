'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ApproveTestimonialButton({ id, approved }: { id: string; approved: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    await fetch(`/api/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: !approved }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <button onClick={toggle} disabled={loading}
      className={`rounded-full px-3 py-1 text-xs font-bold transition disabled:opacity-50 ${
        approved ? 'bg-[#465940]/10 text-[#465940]/70 hover:bg-[#465940]/15' : 'bg-[#465940] text-[#FDFBF0] hover:opacity-90'
      }`}>
      {loading ? '...' : approved ? '✕ დამალვა' : '✓ დამტკიცება'}
    </button>
  );
}

export function DeleteTestimonialButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const del = async () => {
    if (!confirm('წავშალო ეს კომენტარი?')) return;
    setLoading(true);
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
    router.refresh();
    setLoading(false);
  };

  return (
    <button onClick={del} disabled={loading}
      className="rounded-full px-3 py-1 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50">
      {loading ? '...' : 'წაშლა'}
    </button>
  );
}
