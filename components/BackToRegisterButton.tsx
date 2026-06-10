'use client';

export default function BackToRegisterButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.close()}
      className="inline-flex items-center gap-2 text-sm font-semibold text-[#465940]/70 hover:text-[#465940] transition"
    >
      ← {label}
    </button>
  );
}
