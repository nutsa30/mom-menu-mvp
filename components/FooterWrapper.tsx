'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import SiteFooter from './SiteFooter';

const HIDE_ON = ['/admin', '/login', '/register', '/signup', '/dashboard', '/forgot-password', '/change-password', '/subscription'];

export default function FooterWrapper() {
  const pathname = usePathname();
  if (HIDE_ON.some(p => pathname.startsWith(p))) return null;
  return (
    <Suspense fallback={null}>
      <SiteFooter />
    </Suspense>
  );
}
