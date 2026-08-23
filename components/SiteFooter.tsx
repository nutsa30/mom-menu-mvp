'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const EMAIL = 'info@mommenu.ge';

export default function SiteFooter() {
  const searchParams = useSearchParams();
  const locale = searchParams.get('lang') === 'en' ? 'en' : 'ka';
  const ka = locale === 'ka';
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navLinks = [
    { href: `/about?lang=${locale}`,        label: ka ? 'ჩვენ შესახებ'      : 'About' },
    { href: `/how-it-works?lang=${locale}`, label: ka ? 'როგორ მუშაობს'    : 'How it Works' },
    { href: `/recipes?lang=${locale}`,      label: ka ? 'რეცეპტები'         : 'Recipes' },
    { href: `/blog?lang=${locale}`,         label: ka ? 'ბლოგი'             : 'Blog' },
  ];

  const legalLinks = [
    { href: `/privacy?lang=${locale}`,  label: ka ? 'კონფიდენციალურობა' : 'Privacy Policy' },
    { href: `/terms?lang=${locale}`,    label: ka ? 'გამოყენების წესები' : 'Terms of Use' },
    { href: `/contact?lang=${locale}`,  label: ka ? 'კონტაქტი'           : 'Contact' },
  ];

  return (
    <footer style={{ background: '#6F7A5C', fontFamily: "'Rubik', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-5 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand */}
          <div>
            <a href={`/?lang=${locale}`} className="inline-block mb-4">
              <div className="leading-tight">
                <div className="text-2xl font-black text-[#F5F1E4]">mom<svg width="20" height="20" viewBox="0 0 24 24" fill="#D9803B" style={{ display: 'inline', verticalAlign: '-3px', marginLeft: '1px' }}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>
                <div className="text-2xl font-black text-[#F5F1E4]">menu</div>
              </div>
            </a>
            <p className="text-sm text-[#F5F1E4]/70 leading-relaxed mb-6 max-w-[200px]">
              {ka
                ? 'ბავშვის კვების დაგეგმვა, მარტივად და სახალისოდ.'
                : 'Planning your child’s meals, simply and joyfully.'}
            </p>
            <a href="https://www.tiktok.com/@mommenu0" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: '#D9803B', color: '#FFFFFF' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
              </svg>
              @mommenu0
            </a>
          </div>

          {/* Nav links */}
          <div>
            <h4 className="text-xs font-black text-[#F5F1E4]/45 uppercase tracking-widest mb-5">
              {ka ? 'ნავიგაცია' : 'Navigation'}
            </h4>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-[#F5F1E4]/75 hover:text-[#D9803B] transition">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + CTA */}
          <div>
            <h4 className="text-xs font-black text-[#F5F1E4]/45 uppercase tracking-widest mb-5">
              {ka ? 'კონტაქტი' : 'Contact'}
            </h4>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-[#F5F1E4]/75">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-[#D9803B]">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <a href="mailto:info@mommenu.ge" className="hover:text-[#D9803B] transition">
                  {EMAIL}
                </a>
                <button onClick={copyEmail} title={ka ? 'კოპირება' : 'Copy'}
                  className="ml-1 text-[#F5F1E4]/45 hover:text-[#D9803B] transition text-xs">
                  {copied ? '✓' : (ka ? 'კოპირება' : 'Copy')}
                </button>
              </li>
              <li className="flex items-center gap-2 text-sm text-[#F5F1E4]/75">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-[#D9803B]">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <a href="tel:+995557466668" className="hover:text-[#D9803B] transition">+995 557 46 66 68</a>
              </li>
              <li className="flex items-start gap-2 text-sm text-[#F5F1E4]/75">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-[#D9803B] mt-0.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{ka ? 'ჩიქოვანის ქ. 45, თბილისი, საქართველო' : '45 Chikovani St, Tbilisi, Georgia'}</span>
              </li>
            </ul>
            <a
              href={`/register?lang=${locale}`}
              className="inline-block text-sm font-bold px-6 py-2.5 rounded-full transition hover:opacity-90"
              style={{ background: '#D9803B', color: '#FFFFFF' }}
            >
              {ka ? 'დაიწყე უფასოდ →' : 'Start for free →'}
            </a>
          </div>

        </div>
      </div>

      {/* Disclaimer bar */}
      <div className="border-t border-[#F5F1E4]/10 py-4">
        <p className="max-w-6xl mx-auto px-5 text-[11px] text-[#F5F1E4]/40 leading-relaxed text-center sm:text-left">
          {ka
            ? 'mom menu-ზე გამოქვეყნებული ინფორმაცია ზოგადი, საჯაროდ ხელმისაწვდომი ინფორმაციის საფუძველზეა მომზადებული და არ წარმოადგენს სამედიცინო ან დიეტოლოგიურ რჩევას.'
            : 'Information published on mom menu is based on general, publicly available sources and does not constitute medical or dietetic advice.'}
        </p>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#F5F1E4]/10 py-5">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#F5F1E4]/40 max-w-lg leading-relaxed">
            © 2026 mom menu. {ka
              ? 'ყველა რეცეპტი და კონტენტი შექმნილია mom menu-ის მიერ და დაცულია საავტორო უფლებით — მისი კოპირება, გავრცელება ან სხვა პლატფორმაზე გამოქვეყნება/გაყიდვა ნებართვის გარეშე აკრძალულია.'
              : 'All recipes and content are created by mom menu and protected by copyright — copying, distributing, or republishing/reselling on another platform without permission is prohibited.'}
          </p>
          <div className="flex items-center gap-5">
            {legalLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-xs text-[#F5F1E4]/40 hover:text-[#F5F1E4]/70 transition">
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-center sm:justify-end gap-2.5 mt-4 mb-3 sm:mb-0">
          <span className="text-xs text-[#F5F1E4]/40">{ka ? 'საიტი შექმნილია:' : 'Built by:'}</span>
          <img src="/kemsilab-logo.png" alt="KemsiLab" className="h-12" />
        </div>
      </div>
    </footer>
  );
}
