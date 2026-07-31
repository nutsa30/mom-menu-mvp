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
      <div className="max-w-3xl mx-auto bg-[#FDFBF0] rounded-2xl shadow-2xl border border-[#465940]/20 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#465940] mb-1">
            {ka ? 'ვიყენებთ Cookies-ებს' : 'We use Cookies'}
          </p>
          <p className="text-xs text-[#465940]/70 leading-relaxed">
            {ka
              ? 'ვიყენებთ Google Analytics-ს საიტის გასაუმჯობესებლად. შენი მონაცემები უსაფრთხოდ არის დაცული.'
              : 'We use Google Analytics to improve our site. Your data is kept safe and private.'}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 rounded-full text-xs font-bold text-[#465940] border border-[#465940]/20 hover:bg-[#465940]/10 transition"
          >
            {ka ? 'უარყოფა' : 'Decline'}
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[#465940] text-[#FDFBF0] hover:bg-[#465940]/90 transition"
          >
            {ka ? 'მიღება' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}
