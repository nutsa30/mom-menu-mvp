'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function LangSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (lang: string) => router.push(`${pathname}?lang=${lang}`);

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
      <button
        onClick={() => switchTo('ka')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
          locale === 'ka' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        ქარ
      </button>
      <button
        onClick={() => switchTo('en')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
          locale === 'en' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        ENG
      </button>
    </div>
  );
}
