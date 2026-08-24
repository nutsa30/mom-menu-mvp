'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { email?: string; lang?: string };
}) {
  const router = useRouter();
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const ka = locale === 'ka';

  const [email, setEmail] = useState(searchParams.email ?? '');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleDigitKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = digits.join('');
    if (!email) {
      setError(ka ? 'შეიყვანეთ ელფოსტა.' : 'Enter your email.');
      return;
    }
    if (code.length < 6) {
      setError(ka ? 'შეიყვანეთ 6-ნიშნა კოდი.' : 'Enter the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'invalid_code') setError(ka ? 'კოდი არასწორია.' : 'Invalid code.');
        else if (data.error === 'token_expired') setError(ka ? 'კოდის ვადა გავიდა. მოითხოვეთ ახალი.' : 'Code expired. Request a new one.');
        else if (data.error === 'token_used') setError(ka ? 'კოდი უკვე გამოყენებულია.' : 'Code already used.');
        else if (data.error === 'blocked') setError(ka ? 'ეს ანგარიში დაბლოკილია.' : 'This account is blocked.');
        else setError(ka ? 'შეცდომა. სცადეთ თავიდან.' : 'Error. Please try again.');
        return;
      }
      router.push('/dashboard?lang=' + locale + '&in=1');
    } catch {
      setError(ka ? 'შეცდომა. სცადეთ თავიდან.' : 'Error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email) return;
    setResending(true);
    setError('');
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setDigits(['', '', '', '', '', '']);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
      inputRefs.current[0]?.focus();
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#6F7A5C] px-6">
      <div className="w-full max-w-md bg-[#F5F1E4] rounded-[32px] shadow-xl p-8 sm:p-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-[#6F7A5C] mb-2">
            {ka ? 'დაადასტურეთ ელფოსტა' : 'Verify your email'}
          </h1>
          <p className="text-[#6F7A5C]/60 text-sm">
            {ka ? 'გამოგიგზავნეთ 6-ნიშნა კოდი — შეიყვანეთ ქვემოთ.' : "We've sent you a 6-digit code — enter it below."}
          </p>
        </div>

        <form onSubmit={verify} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#6F7A5C] mb-1.5">
              {ka ? 'ელფოსტა' : 'Email'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#6F7A5C]/20 focus:outline-none focus:border-[#6F7A5C] transition text-sm text-[#6F7A5C] bg-[#F5F1E4]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#6F7A5C] mb-3">
              {ka ? 'შეიყვანეთ 6-ნიშნა კოდი' : 'Enter 6-digit code'}
            </label>
            <div className="grid gap-1 sm:gap-2" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
              {digits.map((d, i) => (
                <input key={i} ref={(el) => { inputRefs.current[i] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  className="w-full h-11 sm:h-14 text-center text-base sm:text-xl font-bold border-2 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#6F7A5C] transition text-[#6F7A5C]"
                  style={{ borderColor: d ? '#6F7A5C' : undefined }} />
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" disabled={loading || digits.join('').length < 6}
            className="w-full py-3.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition disabled:opacity-40"
            style={{ background: '#6F7A5C', color: '#F5F1E4' }}>
            {loading ? (ka ? 'მოწმდება...' : 'Verifying...') : (ka ? 'დადასტურება' : 'Verify')}
          </button>
        </form>

        <p className="text-sm text-[#6F7A5C]/60 mt-5 text-center">
          {ka ? 'კოდი არ მიიღეთ? ' : "Didn't get the code? "}
          {resent ? (
            <span className="text-[#6F7A5C] font-bold">{ka ? 'გაიგზავნა ✓' : 'Sent ✓'}</span>
          ) : (
            <button onClick={resend} disabled={resending || !email} className="text-[#6F7A5C] font-bold hover:underline disabled:opacity-50">
              {resending ? (ka ? 'იგზავნება...' : 'Sending...') : (ka ? 'ხელახლა გაგზავნა' : 'Resend')}
            </button>
          )}
        </p>

        <p className="text-sm text-[#6F7A5C]/60 mt-2 text-center">
          <a href={`/login?lang=${locale}`} className="hover:text-[#6F7A5C] transition">
            ← {ka ? 'შესვლაზე დაბრუნება' : 'Back to login'}
          </a>
        </p>
      </div>
    </main>
  );
}
