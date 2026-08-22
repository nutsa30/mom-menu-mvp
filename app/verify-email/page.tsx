'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { sent?: string; error?: string; email?: string };
}) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [email, setEmail] = useState(searchParams.email ?? '');

  const resend = async () => {
    if (!email) return;
    setResending(true);
    await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setResending(false);
    setResent(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#6F7A5C] px-6">
      <div className="w-full max-w-md bg-[#F5F1E4] rounded-[32px] shadow-xl p-10 text-center">

        {searchParams.error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl mx-auto mb-6"></div>
            <h1 className="text-2xl font-black text-[#6F7A5C] mb-3">ბმული არასწორია</h1>
            <p className="text-[#6F7A5C]/70 text-sm mb-6">
              დადასტურების ბმული არასწორია ან ვადა გასულია.
            </p>
            <div className="space-y-3">
              {!resent ? (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="შეიყვანეთ ელფოსტა"
                    className="w-full px-4 py-3 rounded-xl border border-[#6F7A5C]/20 focus:outline-none focus:border-[#6F7A5C] text-sm text-[#6F7A5C] bg-[#F5F1E4]"
                  />
                  <button
                    onClick={resend}
                    disabled={resending || !email}
                    className="w-full py-3 rounded-full font-bold text-sm disabled:opacity-60 transition"
                    style={{ background: '#6F7A5C', color: '#F5F1E4' }}
                  >
                    {resending ? '...' : 'ახალი ბმულის გაგზავნა'}
                  </button>
                </>
              ) : (
                <p className="text-[#6F7A5C] font-semibold text-sm">✓ ახალი ბმული გაიგზავნა!</p>
              )}
              <Link href="/login" className="block text-sm text-[#6F7A5C]/60 hover:text-[#6F7A5C] transition">
                ← შესვლა
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[#6F7A5C]/10 flex items-center justify-center text-3xl mx-auto mb-6"></div>
            <h1 className="text-2xl font-black text-[#6F7A5C] mb-3">შეამოწმეთ ელფოსტა</h1>
            <p className="text-[#6F7A5C]/70 text-sm mb-6 leading-6">
              დადასტურების ბმული გამოგზავნილია. გთხოვთ გახსნათ ელფოსტა და დააჭიროთ ბმულს.
            </p>
            {!resent ? (
              <button
                onClick={resend}
                disabled={resending || !email}
                className="text-sm text-[#6F7A5C]/50 hover:text-[#6F7A5C] transition underline"
              >
                {resending ? '...' : 'ბმული არ მოვიდა? ხელახლა გაგზავნა'}
              </button>
            ) : (
              <p className="text-[#6F7A5C] font-semibold text-sm">✓ ახალი ბმული გაიგზავნა!</p>
            )}
            <Link href="/login" className="block mt-4 text-sm text-[#6F7A5C]/60 hover:text-[#6F7A5C] transition">
              ← შესვლა
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
