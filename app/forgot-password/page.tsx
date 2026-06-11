'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Locale } from '@/lib/i18n';

export default function ForgotPassword({ searchParams }: { searchParams: { lang?: Locale } }) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#465940] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-[#FDFBF0] rounded-[32px] shadow-2xl overflow-hidden grid lg:grid-cols-[45%_55%]" style={{ minHeight: 480 }}>

        {/* Left panel */}
        <div className="hidden lg:flex bg-[#465940] flex-col p-10 relative">
          <span className="text-[#465940] text-lg font-extrabold tracking-tight">Mom Menu</span>
          <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-[#FDFBF0]/10" />
          <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-[#FDFBF0]/10" />
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-[260px]">
              <div className="bg-[#465940] rounded-3xl overflow-hidden" style={{ height: 280 }}>
                <Image src="/cooking.jpg" alt="cooking" width={260} height={280} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex items-center justify-center bg-[#FDFBF0] px-10 py-12">
          <div className="w-full max-w-sm">
            {status === 'sent' ? (
              <div className="text-center">
                <div className="text-5xl mb-4">📬</div>
                <h2 className="text-2xl font-black text-[#465940] mb-2">
                  {locale === 'ka' ? 'გამოგზავნილია!' : 'Email sent!'}
                </h2>
                <p className="text-[#465940]/60 text-sm mb-6">
                  {locale === 'ka'
                    ? 'შეამოწმეთ ელფოსტა. გაგზავნილია პაროლის აღდგენის ბმული. ბმული მოქმედებს 30 წუთის განმავლობაში.'
                    : 'Check your email. A password reset link has been sent. The link is valid for 30 minutes.'}
                </p>
                <a href={`/login?lang=${locale}`} className="text-[#465940] font-bold hover:underline text-sm">
                  {locale === 'ka' ? 'შესვლაზე გადასვლა →' : 'Go to login →'}
                </a>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black text-[#465940] mb-1">
                  {locale === 'ka' ? 'პაროლის აღდგენა' : 'Reset password'}
                </h1>
                <p className="text-[#465940]/60 text-sm mb-8">
                  {locale === 'ka'
                    ? 'შეიყვანეთ ელფოსტა და გამოგიგზავნით პაროლის აღდგენის ბმულს.'
                    : 'Enter your email and we\'ll send you a password reset link.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#465940] mb-1.5">
                      {locale === 'ka' ? 'ელფოსტა' : 'Email'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-[#FDFBF0] text-sm">
                      {locale === 'ka' ? 'შეცდომა. სცადეთ თავიდან.' : 'Error. Please try again.'}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-[#465940] text-[#FDFBF0] py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-[#465940] transition disabled:opacity-60"
                  >
                    {status === 'loading'
                      ? (locale === 'ka' ? 'იგზავნება...' : 'Sending...')
                      : (locale === 'ka' ? 'ბმულის გაგზავნა' : 'Send reset link')}
                  </button>
                </form>

                <p className="text-sm text-[#465940]/60 mt-6 text-center">
                  <a href={`/login?lang=${locale}`} className="text-[#465940] font-bold hover:underline">
                    ← {locale === 'ka' ? 'შესვლაზე დაბრუნება' : 'Back to login'}
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
