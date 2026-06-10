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
    <header style={{ background: '#465940', borderBottom: '1px solid rgba(253,251,240,0.12)' }} className="sticky top-0 z-50 shadow-sm">
      <nav className="flex justify-between items-center w-full px-5 py-3.5 max-w-7xl mx-auto">

        {/* Logo */}
        <a href={`/?lang=${locale}`} className="flex-shrink-0 select-none leading-tight">
          <div className="text-xl font-black" style={{ color: '#FDFBF0', lineHeight: 1 }}>
            mom<span style={{ color: '#FDFBF0', opacity: 0.6 }}>{'♥︎'}</span>
          </div>
          <div className="text-xl font-black" style={{ color: '#FDFBF0', lineHeight: 1 }}>menu</div>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{ color: '#FDFBF0' }}
              className="text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#FDFBF0]/10 transition"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LangSwitcher locale={locale} />
          <div className="hidden md:block">
            {isLoggedIn ? (
              <a
                href="/dashboard"
                className="text-sm font-bold px-5 py-2 rounded-full transition"
                style={{ background: '#FDFBF0', color: '#465940' }}
              >
                {locale === 'ka' ? 'დეშბორდი' : 'Dashboard'}
              </a>
            ) : (
              <a
                href={`/login?lang=${locale}`}
                className="text-sm font-bold px-5 py-2 rounded-full transition"
                style={{ background: '#FDFBF0', color: '#465940' }}
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
