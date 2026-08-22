'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function LangSwitcher({ locale, variant = 'dark' }: { locale: string; variant?: 'dark' | 'light' }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (lang: string) => router.push(`${pathname}?lang=${lang}`);

  const activeClass = variant === 'dark'
    ? 'bg-[#F5F1E4] text-[#6F7A5C]'
    : 'bg-[#6F7A5C] text-[#F5F1E4]';

  const inactiveClass = variant === 'dark'
    ? 'text-[#F5F1E4] border border-[#F5F1E4]/50 hover:border-[#F5F1E4]'
    : 'text-[#6F7A5C] border border-[#6F7A5C]/30 hover:border-[#6F7A5C]';

  return (
    <div className="flex items-center gap-1">
      {['ka', 'en'].map((lang) => (
        <button
          key={lang}
          onClick={() => switchTo(lang)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            locale === lang ? activeClass : inactiveClass
          }`}
        >
          {lang === 'ka' ? 'ქარ' : 'ENG'}
        </button>
      ))}
    </div>
  );
}
