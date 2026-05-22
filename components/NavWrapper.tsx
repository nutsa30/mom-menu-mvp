'use client';

import Nav from './Nav';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavWrapper({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hideNav = ['/login', '/signup', '/register', '/forgot-password', '/dashboard', '/change-password'].includes(pathname) || pathname.startsWith('/dashboard/') || pathname.startsWith('/admin');
  if (hideNav) return null;

  const locale = searchParams.get('lang') === 'en' ? 'en' : 'ka';

  return <Nav locale={locale} isLoggedIn={isLoggedIn} />;
}
