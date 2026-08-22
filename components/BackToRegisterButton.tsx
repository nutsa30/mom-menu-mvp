'use client';

export default function BackToRegisterButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.close()}
      className="inline-flex items-center gap-2 text-sm font-semibold text-[#6F7A5C]/70 hover:text-[#6F7A5C] transition"
    >
      ← {label}
    </button>
  );
}
