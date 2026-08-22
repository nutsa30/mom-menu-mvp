'use client';

import LangSwitcher from './LangSwitcher';

export default function Nav({ locale = 'ka', isLoggedIn = false }: { locale?: string; isLoggedIn?: boolean }) {
  const navLinks = [
    { href: `/how-it-works?lang=${locale}`, label: locale === 'ka' ? 'როგორ მუშაობს' : 'How it Works' },
    { href: `/?lang=${locale}#pricing`,      label: locale === 'ka' ? 'ფასები' : 'Pricing' },
    { href: `/recipes?lang=${locale}`,       label: locale === 'ka' ? 'რეცეპტები' : 'Recipes' },
    { href: `/blog?lang=${locale}`,          label: locale === 'ka' ? 'ბლოგი' : 'Blog' },
  ];

  return (
    <header style={{ background: '#F5F1E4', borderBottom: '1px solid rgba(111,122,92,0.12)', fontFamily: "'Rubik', sans-serif", paddingTop: 'env(safe-area-inset-top)' }} className="sticky top-0 z-50">
      <nav className="flex justify-between items-center w-full px-5 py-4 max-w-7xl mx-auto">

        {/* Logo */}
        <a href={`/?lang=${locale}`} className="flex-shrink-0 select-none leading-tight">
          <div className="text-xl font-black flex items-center" style={{ color: '#6F7A5C', lineHeight: 1 }}>
            mom<svg width="18" height="18" viewBox="0 0 24 24" fill="#D9803B" style={{ display: 'inline', verticalAlign: '-2px', marginLeft: '1px' }}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <div className="text-xl font-black" style={{ color: '#6F7A5C', lineHeight: 1 }}>menu</div>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
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
        <div className="flex items-center gap-2">
          <LangSwitcher locale={locale} variant="light" />
          <div className="hidden md:block">
            {isLoggedIn ? (
              <a
                href="/dashboard"
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
