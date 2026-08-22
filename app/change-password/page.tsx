'use client';

import { useState } from 'react';
import { Locale } from '@/lib/i18n';

export default function ChangePassword({ searchParams }: { searchParams: { lang?: Locale } }) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      setErrorMsg(locale === 'ka' ? 'პაროლები არ ემთხვევა' : 'Passwords do not match');
      setStatus('error');
      return;
    }
    if (next.length < 6) {
      setErrorMsg(locale === 'ka' ? 'პაროლი მინიმუმ 6 სიმბოლო' : 'Password must be at least 6 characters');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(
          data.error === 'wrong_password'
            ? (locale === 'ka' ? 'მიმდინარე პაროლი არასწორია' : 'Current password is incorrect')
            : (locale === 'ka' ? 'შეცდომა. სცადეთ თავიდან.' : 'Error. Please try again.')
        );
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch {
      setErrorMsg(locale === 'ka' ? 'შეცდომა. სცადეთ თავიდან.' : 'Error. Please try again.');
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-[#6F7A5C] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-[#F5F1E4] rounded-[32px] shadow-xl p-10">
        {status === 'success' ? (
          <div className="text-center">
            <div className="text-5xl mb-4"></div>
            <h2 className="text-2xl font-black text-[#6F7A5C] mb-2">
              {locale === 'ka' ? 'პაროლი შეიცვალა!' : 'Password changed!'}
            </h2>
            <p className="text-[#6F7A5C]/60 text-sm mb-6">
              {locale === 'ka' ? 'ახლა შეგიძლია ახალი პაროლით შეხვიდე.' : 'You can now log in with your new password.'}
            </p>
            <a href={`/dashboard?lang=${locale}`} className="text-[#6F7A5C] font-bold hover:underline text-sm">
              {locale === 'ka' ? 'დეშბორდზე დაბრუნება →' : 'Back to dashboard →'}
            </a>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-[#6F7A5C] mb-1">
              {locale === 'ka' ? 'პაროლის შეცვლა' : 'Change password'}
            </h1>
            <p className="text-[#6F7A5C]/60 text-sm mb-8">
              {locale === 'ka' ? 'შეიყვანე მიმდინარე და ახალი პაროლი.' : 'Enter your current and new password.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#6F7A5C] mb-1.5">
                  {locale === 'ka' ? 'მიმდინარე პაროლი' : 'Current password'}
                </label>
                <input
                  type="password"
                  required
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#6F7A5C]/20 focus:outline-none focus:border-[#6F7A5C] transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F7A5C] mb-1.5">
                  {locale === 'ka' ? 'ახალი პაროლი' : 'New password'}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#6F7A5C]/20 focus:outline-none focus:border-[#6F7A5C] transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6F7A5C] mb-1.5">
                  {locale === 'ka' ? 'პაროლის დადასტურება' : 'Confirm new password'}
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#6F7A5C]/20 focus:outline-none focus:border-[#6F7A5C] transition text-sm"
                />
              </div>

              {status === 'error' && (
                <p className="text-[#F5F1E4] text-sm font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#6F7A5C] text-[#F5F1E4] py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-[#6F7A5C] transition disabled:opacity-60 mt-2"
              >
                {status === 'loading'
                  ? (locale === 'ka' ? 'ინახება...' : 'Saving...')
                  : (locale === 'ka' ? 'პაროლის შეცვლა' : 'Change password')}
              </button>
            </form>

            <p className="text-sm text-[#6F7A5C]/60 mt-6 text-center">
              <a href={`/dashboard?lang=${locale}`} className="text-[#6F7A5C] font-bold hover:underline">
                ← {locale === 'ka' ? 'დეშბორდზე დაბრუნება' : 'Back to dashboard'}
              </a>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
