'use client';

import { useState, useEffect } from 'react';
import { useExperience } from './ExperienceProvider';
import { CONSENT_EVENT, COOKIE_SETTINGS_EVENT } from '@/lib/analytics-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { locale } = useExperience();
  const ka = locale === 'ka';

  useEffect(() => {
    try { if (!localStorage.getItem('cookie_consent')) setVisible(true); } catch { setVisible(true); }
    const open = () => setVisible(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, open);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, open);
  }, []);

  const accept = () => {
    try { localStorage.setItem('cookie_consent', 'accepted'); } catch { /* Optional storage is blocked. */ }
    window.dispatchEvent(new Event(CONSENT_EVENT));
    setVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem('cookie_consent', 'declined');
      localStorage.removeItem('mommenu_campaign');
      Object.keys(document.cookie.split(';').reduce<Record<string, boolean>>((cookies, pair) => ({ ...cookies, [pair.trim().split('=')[0]]: true }), {})).filter(key => key === '_ga' || key.startsWith('_ga_') || key === '_gid').forEach(key => {
        for (const domain of ['', window.location.hostname, '.mommenu.ge']) document.cookie = `${key}=; Max-Age=0; path=/${domain ? '; domain=' + domain : ''}`;
      });
    } catch { /* Optional storage is blocked. */ }
    window.dispatchEvent(new Event(CONSENT_EVENT));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-28 sm:bottom-0 left-0 right-0 z-[70] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-[#F5F1E4] rounded-2xl shadow-2xl border border-[#6F7A5C]/20 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#6F7A5C] mb-1">
            {ka ? 'ვიყენებთ Cookies-ებს' : 'We use Cookies'}
          </p>
          <p className="text-xs text-[#6F7A5C]/70 leading-relaxed">
            {ka
              ? 'აუცილებელი cookie-ები საიტის მუშაობისთვის გამოიყენება. შენი თანხმობით Google Analytics ვიზიტებსა და რეკლამიდან გამოწერებამდე გზას აღრიცხავს. უარყოფა საიტის გამოყენებას არ ზღუდავს.'
              : 'Essential cookies keep the site working. With your permission, Google Analytics measures visits and the journey from ads to subscriptions. Declining does not limit access.'}
          </p>
          <a href={`/privacy?lang=${locale}`} className="text-xs underline text-[#6F7A5C]">{ka ? 'კონფიდენციალურობა' : 'Privacy and cookies'}</a>
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
