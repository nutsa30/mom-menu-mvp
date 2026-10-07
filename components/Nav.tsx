'use client';

import LangSwitcher from './LangSwitcher';
import MeasurementSwitcher from './MeasurementSwitcher';

export default function Nav({ locale = 'ka', isLoggedIn = false }: { locale?: string; isLoggedIn?: boolean }) {
  const navLinks = [
    { href: `/how-it-works?lang=${locale}`, label: locale === 'ka' ? 'როგორ მუშაობს' : 'How it Works' },
    { href: `/?lang=${locale}#pricing`,      label: locale === 'ka' ? 'ფასები' : 'Pricing' },
    { href: `/recipes?lang=${locale}`,       label: locale === 'ka' ? 'რეცეპტები' : 'Recipes' },
    { href: `/blog?lang=${locale}`,          label: locale === 'ka' ? 'ბლოგი' : 'Blog' },
  ];

  return (
    <header style={{ background: '#F5F1E4', borderBottom: '1px solid rgba(111,122,92,0.12)', fontFamily: "'Rubik', sans-serif", paddingTop: 'env(safe-area-inset-top)' }} className="sticky top-0 z-50">
      <nav className="flex justify-between items-center gap-3 w-full px-4 sm:px-5 py-3 max-w-7xl mx-auto">

        {/* Logo */}
        <a href={`/?lang=${locale}`} className="flex-shrink-0 select-none">
          <img src="/mommenu-logo.png" alt="mom menu" className="h-12 sm:h-16 w-auto" />
        </a>

        {/* Desktop links */}
        <div className="hidden xl:flex items-center gap-1">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{ color: '#6F7A5C', opacity: 0.75 }}
              className="text-sm font-semibold px-4 py-2 hover:opacity-100 hover:text-[#D9803B] transition"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
          <LangSwitcher locale={locale} variant="light" />
          <div className="basis-full sm:basis-auto"><MeasurementSwitcher compact /></div>
          <div className="hidden md:block">
            {isLoggedIn ? (
              <a
                href={`/dashboard?lang=${locale}`}
                className="text-sm font-bold px-6 py-2.5 rounded-full transition hover:opacity-90"
                style={{ background: '#D9803B', color: '#FFFFFF' }}
              >
                {locale === 'ka' ? 'დეშბორდი' : 'Dashboard'}
              </a>
            ) : (
              <a
                href={`/login?lang=${locale}`}
                className="text-sm font-bold px-6 py-2.5 rounded-full transition hover:opacity-90"
                style={{ background: '#D9803B', color: '#FFFFFF' }}
              >
                {locale === 'ka' ? 'შესვლა' : 'Log In'}
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
