'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { loginAction } from '@/app/actions';
import { dict, Locale } from '@/lib/i18n';
import LangSwitcher from '@/components/LangSwitcher';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-[#ff7f50] text-white py-3.5 rounded-full font-bold text-sm shadow-md hover:scale-[1.02] hover:shadow-lg transition mt-2 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
    >
      {pending && (
        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      )}
      {pending ? '...' : label}
    </button>
  );
}

export default function Login({ searchParams }: { searchParams: { lang?: Locale; error?: string } }) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const d = dict[locale];
  const [showPwd, setShowPwd] = useState(false);

  const errorMsg =
    searchParams.error === 'blocked'
      ? locale === 'ka' ? 'ანგარიში დაბლოკილია. დაუკავშირდი მხარდაჭერას.' : 'Account is blocked. Contact support.'
      : searchParams.error
      ? locale === 'ka' ? 'არასწორი ელფოსტა ან პაროლი' : 'Invalid email or password'
      : null;

  return (
    <div className="min-h-screen bg-[#fef3ef] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden grid lg:grid-cols-[45%_55%]" style={{ minHeight: 560 }}>

        {/* Left panel — light peach */}
        <div className="hidden lg:flex bg-[#fce8df] flex-col p-10 relative">
          <span className="text-[#ff7f50] text-lg font-extrabold tracking-tight">Mom Menu</span>

          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-[260px]">
              <div className="bg-[#ff9470] rounded-3xl overflow-hidden" style={{ height: 300 }}>
                <Image
                  src="/cooking.jpg"
                  alt="Mom and child cooking"
                  width={260}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -right-8 bg-white rounded-2xl shadow-xl p-3.5 flex items-center gap-3 w-48">
                <div className="w-9 h-9 rounded-xl bg-[#fff0eb] flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff7f50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    {locale === 'ka' ? 'დღიური მენიუ' : 'Daily Meal Plan'}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    {locale === 'ka' ? 'სპეციალურად შენი ბავშვისთვის' : 'Personalized for your child'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="relative flex items-center justify-center bg-white px-10 py-12">
          <div className="absolute top-6 right-6">
            <LangSwitcher locale={locale} />
          </div>
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-black text-gray-900 mb-1">
              {locale === 'ka' ? 'შესვლა.' : 'Welcome back.'}
            </h1>
            <p className="text-gray-400 text-sm mb-8">
              {locale === 'ka' ? 'შედი შენი ანგარიშით' : 'Sign in to your account'}
            </p>

            {errorMsg && (
              <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {errorMsg}
              </div>
            )}

            <form action={loginAction} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{d.email}</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7f50] transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{d.password}</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7f50] transition text-sm pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showPwd
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  </button>
                </div>
              </div>

              <SubmitButton label={d.login} />

              <div className="text-right">
                <a href={`/forgot-password?lang=${locale}`} className="text-xs text-[#ff7f50] hover:underline">
                  {locale === 'ka' ? 'პაროლი დაგავიწყდა?' : 'Forgot password?'}
                </a>
              </div>
            </form>

            <p className="text-sm text-gray-400 mt-6 text-center">
              {locale === 'ka' ? 'არ გაქვს ანგარიში? ' : "Don't have an account? "}
              <a href={`/register?lang=${locale}`} className="text-[#ff7f50] font-bold hover:underline">
                {locale === 'ka' ? 'დარეგისტრირდი' : 'Get started'}
              </a>
            </p>

            <div className="mt-4 text-center">
              <a href={`/?lang=${locale}`} className="text-xs text-gray-400 hover:text-gray-600 transition">
                ← {locale === 'ka' ? 'მთავარ გვერდზე დაბრუნება' : 'Back to home'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
