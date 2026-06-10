'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export default function MobileBottomNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = searchParams.get('lang') === 'en' ? 'en' : 'ka';
  const ka = locale === 'ka';

  const hideOn = ['/login', '/signup', '/register', '/forgot-password', '/change-password'];
  if (
    hideOn.includes(pathname) ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard')
  ) return null;

  const links = [
    {
      href: `/?lang=${locale}`,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
          <path d="M9 21V12h6v9"/>
        </svg>
      ),
      label: ka ? 'მთავარი' : 'Home',
      match: '/',
      exact: true,
    },
    {
      href: `/recipes?lang=${locale}`,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
          <path d="M12 8v4l3 3"/>
        </svg>
      ),
      label: ka ? 'რეცეპტები' : 'Recipes',
      match: '/recipes',
      exact: false,
    },
    {
      href: `/blog?lang=${locale}`,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M7 8h10M7 12h7M7 16h5"/>
        </svg>
      ),
      label: ka ? 'ბლოგი' : 'Blog',
      match: '/blog',
      exact: false,
    },
    {
      href: isLoggedIn ? '/dashboard' : `/login?lang=${locale}`,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      ),
      label: ka ? 'ანგარიში' : 'Account',
      match: isLoggedIn ? '/dashboard' : '/login',
      exact: false,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FDFBF0]/95 backdrop-blur border-t border-[#465940]/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {links.map((link) => {
          const isActive = link.exact
            ? pathname === link.match
            : (pathname === link.match || pathname.startsWith(link.match + '/') || pathname.startsWith(link.match + '?'));
          return (
            <a
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                isActive ? 'text-[#465940]' : 'text-[#465940]/60 hover:text-[#465940]/80'
              }`}
            >
              {link.icon}
              <span className="text-[10px] font-bold tracking-wide">{link.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
