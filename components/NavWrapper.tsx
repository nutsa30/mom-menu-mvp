'use client';

import Nav from './Nav';
import MobileBottomNav from './MobileBottomNav';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavWrapper({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hideNav = ['/login', '/signup', '/register', '/forgot-password', '/dashboard', '/change-password'].includes(pathname)
    || pathname.startsWith('/dashboard/')
    || pathname.startsWith('/admin');

  const locale = searchParams.get('lang') === 'en' ? 'en' : 'ka';

  return (
    <>
      {!hideNav && <Nav locale={locale} isLoggedIn={isLoggedIn} />}
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  );
}
