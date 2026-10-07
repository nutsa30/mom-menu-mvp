'use client';
import { useExperience } from './ExperienceProvider';
import { COOKIE_SETTINGS_EVENT } from '@/lib/analytics-consent';
export default function LegalLinks() {
  const { locale } = useExperience();
  const en = locale === 'en';
  return <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs">
    {[['terms', en ? 'Terms' : 'წესები'], ['privacy', en ? 'Privacy' : 'კონფიდენციალურობა'], ['refunds', en ? 'Refunds & cancellation' : 'გაუქმება და დაბრუნება'], ['contact', en ? 'Contact' : 'კონტაქტი']].map(([path, label]) => <a key={path} href={`/${path}?lang=${locale}`} className="underline underline-offset-4">{label}</a>)}
    <button type="button" className="underline underline-offset-4" onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}>{en ? 'Cookie settings' : 'Cookie-ების პარამეტრები'}</button>
  </div>;
}
