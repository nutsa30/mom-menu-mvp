'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function LanguageSwitcher({ locale }: { locale: 'ka' | 'en' }) {
  const router = useRouter();
  const params = useSearchParams();
  const path = usePathname();
  function setLocale(next: 'ka' | 'en') {
    const q = new URLSearchParams(params.toString());
    q.set('lang', next);
    router.push(`${path}?${q.toString()}`);
  }
  return (
    <div className="rounded-full bg-white p-1 shadow-sm ring-1 ring-cocoa/10">
      <button onClick={() => setLocale('ka')} className={`rounded-full px-3 py-1 text-sm font-bold ${locale === 'ka' ? 'bg-cocoa text-white' : ''}`}>KA</button>
      <button onClick={() => setLocale('en')} className={`rounded-full px-3 py-1 text-sm font-bold ${locale === 'en' ? 'bg-cocoa text-white' : ''}`}>EN</button>
    </div>
  );
}
