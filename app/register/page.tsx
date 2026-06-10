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
      style={{ background: '#465940', color: '#FDFBF0' }}
    >
      {pending && (
        <svg className="animate-spin h-4 w-4" style={{ color: '#FDFBF0' }} viewBox="0 0 24 24" fill="none">
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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#465940' }}>
      <div className="w-full max-w-5xl bg-[#FDFBF0] rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:grid lg:grid-cols-[45%_55%]" style={{ minHeight: 680 }}>

        {/* Left panel — mobile: compact banner on top, desktop: full side panel */}
        <div className="flex flex-col relative" style={{ background: '#465940' }}>

          {/* Mobile: horizontal photo strip */}
          <div className="flex lg:hidden items-center gap-4 px-6 py-5">
            <div className="rounded-2xl overflow-hidden flex-shrink-0 border border-[#FDFBF0]/20" style={{ width: 80, height: 80 }}>
              <Image
                src="/cooking.jpg"
                alt="Mom and child cooking"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[#FDFBF0] text-base font-extrabold tracking-tight">Mom Menu</p>
              <p className="text-[#FDFBF0]/70 text-xs mt-0.5">
                {locale === 'ka' ? 'ოპტიმიზირებული კვება ყველა ასაკისთვის' : "Optimized nutrition for every stage of your child's growth"}
              </p>
            </div>
          </div>

          {/* Desktop: full panel */}
          <div className="hidden lg:flex flex-col flex-1 p-10">
            <span className="text-[#FDFBF0] text-lg font-extrabold tracking-tight">Mom Menu</span>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full max-w-[280px]">
                <div className="rounded-3xl overflow-hidden border border-[#FDFBF0]/20" style={{ height: 340 }}>
                  <Image
                    src="/cooking.jpg"
                    alt="Mom and child cooking"
                    width={280}
                    height={340}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-5 -right-8 bg-[#FDFBF0] rounded-2xl shadow-xl p-3.5 flex items-center gap-3 w-52">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#465940' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FDFBF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#465940]">
                      {locale === 'ka' ? 'დღიური კვების გეგმა' : 'Daily Meal Plan'}
                    </p>
                    <p className="text-[10px] text-[#465940]/60 leading-tight">
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
        <div className="relative flex items-center justify-center bg-[#FDFBF0] px-10 py-12">
          <div className="absolute top-6 right-6">
            <LangSwitcher locale={locale} variant="light" />
          </div>
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-black text-[#465940] mb-1">
              {locale === 'ka' ? 'დაიწყეთ თქვენი გზა.' : 'Start your journey.'}
            </h1>
            <p className="text-[#465940]/60 text-sm mb-7">
              {locale === 'ka'
                ? '10 000+ მშობელი ქმნის ჯანსაღ მენიუს თავის შვილებისთვის.'
                : 'Join 10,000+ parents crafting mindful meals for their little ones.'}
            </p>

            {errorMsg && (
              <div className="mb-5 rounded-xl border border-[#465940]/30 px-4 py-3 text-sm font-semibold" style={{ background: '#465940', color: '#FDFBF0' }}>
                {errorMsg}
              </div>
            )}

            <form action={registerAction} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#465940] mb-1.5">
                  {locale === 'ka' ? 'მშობლის სახელი' : 'Parent Name'}
                </label>
                <input
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm text-[#465940] bg-[#FDFBF0]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#465940] mb-1.5">
                  {locale === 'ka' ? 'ელფოსტა' : 'Email Address'}
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm text-[#465940] bg-[#FDFBF0]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#465940] mb-1.5">
                  {locale === 'ka' ? 'პაროლი' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm pr-11 text-[#465940] bg-[#FDFBF0]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#465940]/40 hover:text-[#465940] transition"
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
                  <label className="block text-sm font-semibold text-[#465940] mb-1.5">
                    {locale === 'ka' ? 'ბავშვის სახელი' : "Child's Name"}
                  </label>
                  <input
                    name="childName"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm text-[#465940] bg-[#FDFBF0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#465940] mb-1.5">
                    {locale === 'ka' ? 'დაბადების თარიღი' : "Child's Birth Date"}
                  </label>
                  <input
                    name="birthDate"
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm text-[#465940] bg-[#FDFBF0]"
                  />
                </div>
              </div>

              {ageMonths !== null && (
                <div className="flex items-center gap-2 bg-[#465940]/10 border border-[#465940]/20 rounded-xl px-4 py-3 text-sm text-[#465940] font-medium">
                  <span>😊</span>
                  {locale === 'ka'
                    ? `თქვენი ბავშვი ${ageMonths} თვისაა`
                    : `Your child is ${ageMonths} months old`}
                </div>
              )}

              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input type="checkbox" required className="mt-0.5" style={{ accentColor: '#465940' }} />
                <span className="text-sm text-[#465940]/60">
                  {locale === 'ka' ? 'ვეთანხმები ' : 'I agree to the '}
                  <a href="#" className="text-[#465940] font-semibold hover:underline">
                    {locale === 'ka' ? 'მომსახურების პირობებს' : 'Terms of Service'}
                  </a>
                  {locale === 'ka' ? ' და ' : ' and '}
                  <a href="#" className="text-[#465940] font-semibold hover:underline">
                    {locale === 'ka' ? 'კონფიდენციალურობის პოლიტიკას' : 'Privacy Policy'}
                  </a>
                  .
                </span>
              </label>

              <SubmitButton label={d.register} />
            </form>

            <p className="text-sm text-[#465940]/60 mt-5 text-center">
              {locale === 'ka' ? 'უკვე გაქვს ანგარიში? ' : 'Already have an account? '}
              <a href={`/login?lang=${locale}`} className="text-[#465940] font-bold hover:underline">
                {locale === 'ka' ? 'შესვლა' : 'Login here'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
