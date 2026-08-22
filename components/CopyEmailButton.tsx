'use client';

import { useState } from 'react';

export default function CopyEmailButton({ email, label }: { email: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <a href={`mailto:${email}`} className="text-sm text-[#F5F1E4] font-semibold hover:underline">
        {email}
      </a>
      <button onClick={copy}
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-[#F5F1E4]/30 text-[#F5F1E4]/70 hover:text-[#F5F1E4] hover:border-[#F5F1E4]/60 transition">
        {copied ? '✓ კოპირებულია' : 'კოპირება'}
      </button>
    </div>
  );
}
