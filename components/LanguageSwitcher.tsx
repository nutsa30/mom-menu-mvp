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
    <div className="flex items-center gap-1">
      <button
        onClick={() => setLocale('ka')}
        className={`rounded-full px-3 py-1 text-sm font-bold transition ${
          locale === 'ka'
            ? 'border-2 border-[#6F7A5C] text-[#6F7A5C] bg-[#F5F1E4]'
            : 'border-2 border-transparent text-[#6F7A5C] hover:border-[#6F7A5C]/40'
        }`}
      >
        KA
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`rounded-full px-3 py-1 text-sm font-bold transition ${
          locale === 'en'
            ? 'border-2 border-[#6F7A5C] text-[#6F7A5C] bg-[#F5F1E4]'
            : 'border-2 border-transparent text-[#6F7A5C] hover:border-[#6F7A5C]/40'
        }`}
      >
        EN
      </button>
    </div>
  );
}
