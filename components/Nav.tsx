'use client';

import { useState } from 'react';
import LangSwitcher from './LangSwitcher';

export default function Nav({ locale = 'ka', isLoggedIn = false }: { locale?: string; isLoggedIn?: boolean }) {
  const [open, setOpen] = useState(false);

  const btnClass = "text-sm font-semibold text-white px-4 py-2 rounded-full bg-[#ff7f50] hover:bg-[#e86e40] transition cursor-pointer";
  const outlineClass = "text-sm font-semibold text-[#ff7f50] px-4 py-2 rounded-full border border-[#ff7f50] hover:bg-[#fff1ec] transition cursor-pointer";

  const navLinks = [
    { href: `/how-it-works?lang=${locale}`, label: locale === 'ka' ? 'როგორ მუშაობს' : 'How it Works' },
    { href: `/?lang=${locale}#pricing`,      label: locale === 'ka' ? 'ფასები' : 'Pricing' },
    { href: `/recipes?lang=${locale}`,       label: locale === 'ka' ? 'რეცეპტები' : 'Recipes' },
    { href: `/blog?lang=${locale}`,          label: locale === 'ka' ? 'ბლოგი' : 'Blog' },
  ];

  return (
    <header className="bg-white/70 backdrop-blur-lg border-b border-orange-100/50 sticky top-0 z-50 shadow-[0_10px_30px_rgba(255,127,80,0.08)]">
      <nav className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">

        {/* LEFT — logo + desktop links */}
        <div className="flex items-center gap-8">
          <a href={`/?lang=${locale}`} className="text-xl font-extrabold tracking-tight cursor-pointer select-none">
            <span style={{ color: '#2b1d18' }}>mo</span>
            <span className="text-orange-500">M</span>
            <span style={{ color: '#2b1d18' }}>eals</span>
          </a>

          <div className="hidden md:flex gap-2">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className={btnClass}>{l.label}</a>
            ))}
          </div>
        </div>

        {/* RIGHT — lang switcher + auth + hamburger */}
        <div className="flex items-center gap-3">
          <LangSwitcher locale={locale} />

          <div className="hidden md:block">
            {isLoggedIn ? (
              <a href="/dashboard" className={outlineClass}>
                {locale === 'ka' ? 'დეშბორდი' : 'Dashboard'}
              </a>
            ) : (
              <a href={`/login?lang=${locale}`} className={btnClass}>
                {locale === 'ka' ? 'შესვლა' : 'Login'}
              </a>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-orange-50 transition"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 my-1 transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-orange-50 px-6 py-4 space-y-2">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block w-full text-left text-sm font-semibold text-gray-700 px-4 py-3 rounded-xl hover:bg-[#fff1ec] hover:text-[#ff7f50] transition"
            >
              {l.label}
            </a>
          ))}

          <div className="pt-2 border-t border-gray-100">
            {isLoggedIn ? (
              <a
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block w-full text-center text-sm font-semibold text-[#ff7f50] px-4 py-3 rounded-xl border border-[#ff7f50] hover:bg-[#fff1ec] transition"
              >
                {locale === 'ka' ? 'დეშბორდი' : 'Dashboard'}
              </a>
            ) : (
              <a
                href={`/login?lang=${locale}`}
                onClick={() => setOpen(false)}
                className="block w-full text-center text-sm font-semibold text-white px-4 py-3 rounded-xl bg-[#ff7f50] hover:bg-[#e86e40] transition"
              >
                {locale === 'ka' ? 'შესვლა' : 'Login'}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
