'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteDishButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/dishes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      alert('წაშლა ვერ მოხერხდა');
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">დარწმუნებული ხარ?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-full transition disabled:opacity-60"
        >
          {deleting ? '...' : 'კი'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs font-bold text-gray-500 hover:text-gray-700 transition"
        >
          არა
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-gray-400 hover:text-red-500 transition"
      title="წაშლა"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </button>
  );
}
