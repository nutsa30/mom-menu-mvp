'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { registerAction } from '@/app/actions';
import { dict, Locale } from '@/lib/i18n';
import LangSwitcher from '@/components/LangSwitcher';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3.5 rounded-full font-bold text-sm shadow-md hover:scale-[1.02] hover:shadow-lg transition mt-1 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
      style={{ background: '#6F7A5C', color: '#F5F1E4' }}
    >
      {pending && (
        <svg className="animate-spin h-4 w-4" style={{ color: '#F5F1E4' }} viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      )}
      {pending ? '...' : label}
    </button>
  );
}

function calcAgeMonths(dateStr: string): number | null {
  if (!dateStr) return null;
  const birth = new Date(dateStr);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

export default function Register({ searchParams }: { searchParams: { lang?: Locale; error?: string } }) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';
  const d = dict[locale];
  const [birthDate, setBirthDate] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const ageMonths = calcAgeMonths(birthDate);

  const errorMsg =
    searchParams.error === 'exists'
      ? locale === 'ka' ? 'ეს ელფოსტა უკვე დარეგისტრირებულია' : 'This email is already registered'
      : searchParams.error
      ? locale === 'ka' ? 'შეცდომა. სცადეთ თავიდან.' : 'Something went wrong. Please try again.'
      : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#6F7A5C' }}>
      <div className="w-full max-w-5xl bg-[#F5F1E4] rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:grid lg:grid-cols-[45%_55%]" style={{ minHeight: 680 }}>

        {/* Left panel — mobile: compact banner on top, desktop: full side panel */}
        <div className="flex flex-col relative" style={{ background: '#6F7A5C' }}>

          {/* Mobile: horizontal photo strip */}
          <div className="flex lg:hidden items-center gap-4 px-6 py-5">
            <div className="rounded-2xl overflow-hidden flex-shrink-0 border border-[#F5F1E4]/20" style={{ width: 80, height: 80 }}>
              <Image
                src="/cooking.jpg"
                alt="Mom and child cooking"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[#F5F1E4] text-base font-extrabold tracking-tight">Mom Menu</p>
              <p className="text-[#F5F1E4]/70 text-xs mt-0.5">
                {locale === 'ka' ? 'ოპტიმიზირებული კვება ყველა ასაკისთვის' : "Optimized nutrition for every stage of your child's growth"}
              </p>
            </div>
          </div>

          {/* Desktop: full panel */}
          <div className="hidden lg:flex flex-col flex-1 p-10">
            <span className="text-[#F5F1E4] text-lg font-extrabold tracking-tight">Mom Menu</span>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full max-w-[280px]">
                <div className="rounded-3xl overflow-hidden border border-[#F5F1E4]/20" style={{ height: 340 }}>
                  <Image
                    src="/cooking.jpg"
                    alt="Mom and child cooking"
                    width={280}
                    height={340}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-5 -right-8 bg-[#F5F1E4] rounded-2xl shadow-xl p-3.5 flex items-center gap-3 w-52">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#6F7A5C' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5F1E4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#6F7A5C]">
                      {locale === 'ka' ? 'დღიური კვების გეგმა' : 'Daily Meal Plan'}
                    </p>
                    <p className="text-[10px] text-[#6F7A5C]/60 leading-tight">
                      {locale === 'ka'
                        ? 'ოპტიმიზირებული კვება ყველა ასაკისთვის.'
                        : "Optimized nutrition for every stage of your child's growth."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="relative flex items-center justify-center bg-[#F5F1E4] px-10 py-12">
          <div className="absolute top-6 right-6">
            <LangSwitcher locale={locale} variant="light" />
          </div>
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-black text-[#6F7A5C] mb-1">
              {locale === 'ka' ? 'დაიწყეთ თქვენი გზა.' : 'Start your journey.'}
            </h1>
            <p className="text-[#6F7A5C]/60 text-sm mb-7">
              {locale === 'ka'
                ? '10 000+ მშობელი ქმნის ჯანსაღ მენიუს თავის შვილებისთვის.'
                : 'Join 10,000+ parents crafting mindful meals for their little ones.'}
            </p>

            {errorMsg && (
              <div className="mb-5 rounded-xl border border-[#6F7A5C]/30 px-4 py-3 text-sm font-semibold" style={{ background: '#6F7A5C', color: '#F5F1E4' }}>
                {errorMsg}
              </div>
            )}

            {/* Google sign-up */}
            <a
              href="/api/auth/google"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#6F7A5C]/20 bg-white py-3 text-sm font-semibold text-[#6F7A5C] shadow-sm hover:bg-gray-50 transition"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                <path fill="#4285F4" d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.2 7.3-10.5 7.3-17.3z"/>
                <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.2 1.5-5 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.6v6.2C6.6 42.7 14.8 48 24 48z"/>
                <path fill="#FBBC05" d="M10.8 28.8c-.5-1.5-.8-3-.8-4.8s.3-3.3.8-4.8v-6.2H2.6C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l8.2-6z"/>
                <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.4 30.4 0 24 0 14.8 0 6.6 5.3 2.6 13.2l8.2 6.2C12.7 13.6 17.9 9.5 24 9.5z"/>
              </svg>
              {locale === 'ka' ? 'Google-ით რეგისტრაცია' : 'Sign up with Google'}
            </a>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#6F7A5C]/15"/></div>
              <div className="relative flex justify-center"><span className="bg-[#F5F1E4] px-3 text-xs text-[#6F7A5C]/40">{locale === 'ka' ? 'ან ელფოსტით' : 'or with email'}</span></div>
            </div>

            <form action={registerAction} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#6F7A5C] mb-1.5">
                  {locale === 'ka' ? 'მშობლის სახელი' : 'Parent Name'}
                </label>
                <input
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#6F7A5C]/20 focus:outline-none focus:border-[#6F7A5C] transition text-sm text-[#6F7A5C] bg-[#F5F1E4]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6F7A5C] mb-1.5">
                  {locale === 'ka' ? 'ელფოსტა' : 'Email Address'}
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#6F7A5C]/20 focus:outline-none focus:border-[#6F7A5C] transition text-sm text-[#6F7A5C] bg-[#F5F1E4]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6F7A5C] mb-1.5">
                  {locale === 'ka' ? 'პაროლი' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-[#6F7A5C]/20 focus:outline-none focus:border-[#6F7A5C] transition text-sm pr-11 text-[#6F7A5C] bg-[#F5F1E4]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7A5C]/40 hover:text-[#6F7A5C] transition"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#6F7A5C] mb-1.5">
                    {locale === 'ka' ? 'ბავშვის სახელი' : "Child's Name"}
                  </label>
                  <input
                    name="childName"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#6F7A5C]/20 focus:outline-none focus:border-[#6F7A5C] transition text-sm text-[#6F7A5C] bg-[#F5F1E4]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6F7A5C] mb-1.5">
                    {locale === 'ka' ? 'დაბადების თარიღი' : "Child's Birth Date"}
                  </label>
                  <input
                    name="birthDate"
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#6F7A5C]/20 focus:outline-none focus:border-[#6F7A5C] transition text-sm text-[#6F7A5C] bg-[#F5F1E4]"
                  />
                </div>
              </div>

              {ageMonths !== null && (
                <div className="flex items-center gap-2 bg-[#6F7A5C]/10 border border-[#6F7A5C]/20 rounded-xl px-4 py-3 text-sm text-[#6F7A5C] font-medium">
                  <span></span>
                  {locale === 'ka'
                    ? `თქვენი ბავშვი ${ageMonths} თვისაა`
                    : `Your child is ${ageMonths} months old`}
                </div>
              )}

              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input type="checkbox" required className="mt-0.5" style={{ accentColor: '#6F7A5C' }} />
                <span className="text-sm text-[#6F7A5C]/60">
                  {locale === 'ka' ? 'ვეთანხმები ' : 'I agree to the '}
                  <a href={`/terms?lang=${locale}&from=register`} target="_blank" rel="noopener noreferrer" className="text-[#6F7A5C] font-semibold hover:underline">
                    {locale === 'ka' ? 'მომსახურების პირობებს' : 'Terms of Service'}
                  </a>
                  {locale === 'ka' ? ' და ' : ' and '}
                  <a href={`/privacy?lang=${locale}&from=register`} target="_blank" rel="noopener noreferrer" className="text-[#6F7A5C] font-semibold hover:underline">
                    {locale === 'ka' ? 'კონფიდენციალურობის პოლიტიკას' : 'Privacy Policy'}
                  </a>
                  .
                </span>
              </label>

              <SubmitButton label={d.register} />
            </form>

            <p className="text-sm text-[#6F7A5C]/60 mt-5 text-center">
              {locale === 'ka' ? 'უკვე გაქვს ანგარიში? ' : 'Already have an account? '}
              <a href={`/login?lang=${locale}`} className="text-[#6F7A5C] font-bold hover:underline">
                {locale === 'ka' ? 'შესვლა' : 'Login here'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
