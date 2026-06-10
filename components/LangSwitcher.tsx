'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function LangSwitcher({ locale, variant = 'dark' }: { locale: string; variant?: 'dark' | 'light' }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (lang: string) => router.push(`${pathname}?lang=${lang}`);

  const activeClass = variant === 'dark'
    ? 'bg-[#FDFBF0] text-[#465940]'
    : 'bg-[#465940] text-[#FDFBF0]';

  const inactiveClass = variant === 'dark'
    ? 'text-[#FDFBF0] border border-[#FDFBF0]/50 hover:border-[#FDFBF0]'
    : 'text-[#465940] border border-[#465940]/30 hover:border-[#465940]';

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
