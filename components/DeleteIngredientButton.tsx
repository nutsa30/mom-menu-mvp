'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteIngredientButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/ingredients/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  if (confirming) {
    return (
      <span className="flex items-center gap-2 justify-end">
        <button onClick={handleDelete} disabled={loading}
          className="text-xs font-bold text-red-600 hover:text-red-800 transition disabled:opacity-60">
          {loading ? '...' : 'დიახ'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-xs text-gray-400 hover:text-gray-600 transition">
          გაუქმება
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-gray-400 hover:text-red-500 transition ml-3">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
    </button>
  );
}
