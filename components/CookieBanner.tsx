'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const searchParams = useSearchParams();
  const locale = searchParams.get('lang') === 'en' ? 'en' : 'ka';
  const ka = locale === 'ka';

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-[#F5F1E4] rounded-2xl shadow-2xl border border-[#6F7A5C]/20 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#6F7A5C] mb-1">
            {ka ? 'ვიყენებთ Cookies-ებს' : 'We use Cookies'}
          </p>
          <p className="text-xs text-[#6F7A5C]/70 leading-relaxed">
            {ka
              ? 'ვიყენებთ Google Analytics-ს საიტის გასაუმჯობესებლად. შენი მონაცემები უსაფრთხოდ არის დაცული.'
              : 'We use Google Analytics to improve our site. Your data is kept safe and private.'}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 rounded-full text-xs font-bold text-[#6F7A5C] border border-[#6F7A5C]/20 hover:bg-[#6F7A5C]/10 transition"
          >
            {ka ? 'უარყოფა' : 'Decline'}
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[#6F7A5C] text-[#F5F1E4] hover:bg-[#6F7A5C]/90 transition"
          >
            {ka ? 'მიღება' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}
