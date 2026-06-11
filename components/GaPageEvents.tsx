'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ga } from '@/lib/gtag';

export default function GaPageEvents() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isNew = searchParams.get('new') === '1';
    const isLogin = searchParams.get('in') === '1';

    if (!isNew && !isLogin) return;

    if (isNew) ga.signUp();
    if (isLogin) ga.login();

    // Clean the tracking params from URL without re-render
    const next = new URLSearchParams(searchParams.toString());
    next.delete('new');
    next.delete('in');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
