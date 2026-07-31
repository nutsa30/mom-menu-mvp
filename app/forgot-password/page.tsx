'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Locale } from '@/lib/i18n';

type Step = 'email' | 'code' | 'password' | 'success';

export default function ForgotPassword({ searchParams }: { searchParams: { lang?: Locale } }) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [verifiedCode, setVerifiedCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 1: send code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setDigits(['', '', '', '', '', '']);
      setStep('code');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError(locale === 'ka' ? 'შეცდომა. სცადეთ თავიდან.' : 'Error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  // Step 2: verify code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = digits.join('');
    if (code.length < 6) {
      setError(locale === 'ka' ? 'შეიყვანეთ 6-ნიშნა კოდი.' : 'Enter the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'invalid_code') setError(locale === 'ka' ? 'კოდი არასწორია. სცადეთ თავიდან.' : 'Invalid code. Please try again.');
        else if (data.error === 'token_expired') setError(locale === 'ka' ? 'კოდის ვადა გავიდა. გთხოვთ, ახლიდან მოითხოვოთ.' : 'Code expired. Please request a new one.');
        else if (data.error === 'token_used') setError(locale === 'ka' ? 'კოდი უკვე გამოყენებულია.' : 'Code already used.');
        else setError(locale === 'ka' ? 'შეცდომა. სცადეთ თავიდან.' : 'Error. Please try again.');
        return;
      }
      setVerifiedCode(code);
      setStep('password');
    } catch {
      setError(locale === 'ka' ? 'შეცდომა. სცადეთ თავიდან.' : 'Error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: change password
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError(locale === 'ka' ? 'პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს.' : 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError(locale === 'ka' ? 'პაროლები არ ემთხვევა.' : 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verifiedCode, newPassword: password }),
      });
      if (!res.ok) {
        setError(locale === 'ka' ? 'შეცდომა. სცადეთ თავიდან.' : 'Error. Please try again.');
        return;
      }
      setStep('success');
    } catch {
      setError(locale === 'ka' ? 'შეცდომა. სცადეთ თავიდან.' : 'Error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#465940] flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl bg-[#FDFBF0] rounded-3xl sm:rounded-[32px] shadow-2xl overflow-hidden grid lg:grid-cols-[45%_55%]" style={{ minHeight: 480 }}>

        {/* Left panel */}
        <div className="hidden lg:flex bg-[#465940] flex-col p-10 relative">
          <span className="text-[#FDFBF0] text-lg font-extrabold tracking-tight">Mom Menu</span>
          <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-[#FDFBF0]/10" />
          <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-[#FDFBF0]/10" />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[260px]">
              <div className="bg-[#465940] rounded-3xl overflow-hidden" style={{ height: 280 }}>
                <Image src="/cooking.jpg" alt="cooking" width={260} height={280} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex items-center justify-center bg-[#FDFBF0] px-4 py-7 sm:px-10 sm:py-12">
          <div className="w-full max-w-sm">

            {/* ── success ── */}
            {step === 'success' && (
              <div className="text-center">
                <div className="text-5xl mb-4"></div>
                <h2 className="text-2xl font-black text-[#465940] mb-2">
                  {locale === 'ka' ? 'პაროლი შეიცვალა!' : 'Password changed!'}
                </h2>
                <p className="text-[#465940]/60 text-sm mb-6">
                  {locale === 'ka' ? 'შეგიძლიათ ახლა ახალი პაროლით შეხვიდეთ.' : 'You can now log in with your new password.'}
                </p>
                <button onClick={() => router.push('/login?lang=' + locale)}
                  className="w-full bg-[#465940] text-[#FDFBF0] py-3.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition">
                  {locale === 'ka' ? 'შესვლა →' : 'Login →'}
                </button>
              </div>
            )}

            {/* ── Step 1: email ── */}
            {step === 'email' && (
              <>
                <h1 className="text-2xl sm:text-3xl font-black text-[#465940] mb-1">
                  {locale === 'ka' ? 'პაროლის აღდგენა' : 'Reset password'}
                </h1>
                <p className="text-[#465940]/60 text-sm mb-8">
                  {locale === 'ka' ? 'შეიყვანეთ ელფოსტა — გამოგიგზავნით 6-ნიშნა კოდს.' : "Enter your email — we'll send you a 6-digit code."}
                </p>
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#465940] mb-1.5">
                      {locale === 'ka' ? 'ელფოსტა' : 'Email'}
                    </label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm text-[#465940]" />
                  </div>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full bg-[#465940] text-[#FDFBF0] py-3.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition disabled:opacity-60">
                    {loading ? (locale === 'ka' ? 'იგზავნება...' : 'Sending...') : (locale === 'ka' ? 'კოდის გაგზავნა' : 'Send code')}
                  </button>
                </form>
                <p className="text-sm text-[#465940]/60 mt-6 text-center">
                  <a href={`/login?lang=${locale}`} className="text-[#465940] font-bold hover:underline">
                    ← {locale === 'ka' ? 'შესვლაზე დაბრუნება' : 'Back to login'}
                  </a>
                </p>
              </>
            )}

            {/* ── Step 2: enter code ── */}
            {step === 'code' && (
              <>
                <div className="mb-5">
                  <div className="text-2xl sm:text-3xl mb-2"></div>
                  <h1 className="text-lg sm:text-2xl font-black text-[#465940] mb-1">
                    {locale === 'ka' ? 'კოდი გამოგზავნილია' : 'Code sent'}
                  </h1>
                  <p className="text-[#465940]/60 text-xs sm:text-sm break-all">
                    {locale === 'ka' ? `შეამოწმეთ ${email}` : `Check ${email}`}
                  </p>
                </div>
                <form onSubmit={handleVerifyCode} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#465940] mb-3">
                      {locale === 'ka' ? 'შეიყვანეთ 6-ნიშნა კოდი' : 'Enter 6-digit code'}
                    </label>
                    <div className="grid gap-1 sm:gap-2" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                      {digits.map((d, i) => (
                        <input key={i} ref={(el) => { inputRefs.current[i] = el; }}
                          type="text" inputMode="numeric" maxLength={1} value={d}
                          onChange={(e) => handleDigitChange(i, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(i, e)}
                          className="w-full h-11 sm:h-14 text-center text-base sm:text-xl font-bold border-2 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#465940] transition text-[#465940]"
                          style={{ borderColor: d ? '#465940' : undefined }} />
                      ))}
                    </div>
                  </div>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  <button type="submit" disabled={loading || digits.join('').length < 6}
                    className="w-full bg-[#465940] text-[#FDFBF0] py-3 sm:py-3.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition disabled:opacity-40">
                    {loading ? (locale === 'ka' ? 'მოწმდება...' : 'Verifying...') : (locale === 'ka' ? 'კოდის დადასტურება' : 'Verify code')}
                  </button>
                </form>
                <p className="text-sm text-[#465940]/60 mt-4 text-center">
                  {locale === 'ka' ? 'კოდი არ მიიღეთ? ' : "Didn't get the code? "}
                  <button onClick={() => { setStep('email'); setError(''); }}
                    className="text-[#465940] font-bold hover:underline">
                    {locale === 'ka' ? 'ახლიდან გაგზავნა' : 'Resend'}
                  </button>
                </p>
              </>
            )}

            {/* ── Step 3: new password ── */}
            {step === 'password' && (
              <>
                <div className="mb-5">
                  <div className="text-2xl sm:text-3xl mb-2"></div>
                  <h1 className="text-lg sm:text-2xl font-black text-[#465940] mb-1">
                    {locale === 'ka' ? 'ახალი პაროლი' : 'New password'}
                  </h1>
                  <p className="text-[#465940]/60 text-sm">
                    {locale === 'ka' ? 'კოდი დადასტურდა. შეიყვანეთ ახალი პაროლი.' : 'Code verified. Set your new password.'}
                  </p>
                </div>
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#465940] mb-1.5">
                      {locale === 'ka' ? 'ახალი პაროლი' : 'New password'}
                    </label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} required minLength={6}
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder={locale === 'ka' ? 'მინიმუმ 6 სიმბოლო' : 'Min. 6 characters'}
                        className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm pr-20 text-[#465940]" />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#465940]/40 hover:text-[#465940] text-xs">
                        {showPass ? (locale === 'ka' ? 'დამალვა' : 'Hide') : (locale === 'ka' ? 'ჩვენება' : 'Show')}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#465940] mb-1.5">
                      {locale === 'ka' ? 'პაროლის დადასტურება' : 'Confirm password'}
                    </label>
                    <input type={showPass ? 'text' : 'password'} required
                      value={confirm} onChange={(e) => setConfirm(e.target.value)}
                      placeholder={locale === 'ka' ? 'გაიმეორეთ პაროლი' : 'Repeat password'}
                      className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm text-[#465940]" />
                  </div>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full bg-[#465940] text-[#FDFBF0] py-3.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition disabled:opacity-60">
                    {loading ? (locale === 'ka' ? 'იცვლება...' : 'Changing...') : (locale === 'ka' ? 'პაროლის შეცვლა' : 'Change password')}
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
