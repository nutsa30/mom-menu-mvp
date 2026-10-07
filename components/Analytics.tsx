'use client';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { analyticsAllowed, analyticsLocation, campaignAttribution, CONSENT_EVENT } from '@/lib/analytics-consent';
import { trackEvent, flushAnalyticsEvents } from '@/lib/gtag';

export default function Analytics({ gaId, gtmId }: { gaId?: string; gtmId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const lastPage = useRef('');
  const initialized = useRef(false);
  const validGaId = gaId && /^G-[A-Z0-9]+$/.test(gaId) ? gaId : undefined;
  const validGtmId = gtmId && /^GTM-[A-Z0-9]+$/.test(gtmId) ? gtmId : undefined;
  useEffect(() => {
    const update = () => {
      const consent = analyticsAllowed();
      setAllowed(consent);
      if (validGaId) (window as unknown as Record<string, unknown>)[`ga-disable-${validGaId}`] = !consent;
      if (!consent) {
        window.mommenuAnalyticsReady = false;
        window.mommenuAnalyticsQueue = [];
        window.gtag?.('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
        lastPage.current = '';
      }
    };
    update(); window.addEventListener(CONSENT_EVENT, update);
    return () => window.removeEventListener(CONSENT_EVENT, update);
  }, [validGaId]);
  useEffect(() => {
    if (!allowed) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function (..._args: any[]) { window.dataLayer!.push(arguments); };
    window.gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    if (!initialized.current && validGaId) {
      window.gtag('js', new Date());
      window.gtag('config', validGaId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: analyticsLocation(window.location.href) });
      initialized.current = true;
    }
    window.mommenuAnalyticsReady = Boolean(validGaId);
    flushAnalyticsEvents();
    setReady(true);
  }, [allowed, validGaId]);
  useEffect(() => {
    if (!allowed || !ready) return;
    const location = analyticsLocation(window.location.href);
    if (lastPage.current === location) return;
    lastPage.current = location;
    const campaign = campaignAttribution();
    trackEvent('page_view', { page_location: location, page_path: pathname });
    if (campaign.utm_source === 'justparents') {
      try {
        if (!sessionStorage.getItem('mommenu_justparents_landing')) {
          trackEvent('campaign_landing'); sessionStorage.setItem('mommenu_justparents_landing', '1');
        }
      } catch { /* Analytics remains optional. */ }
    }
  }, [allowed, ready, pathname, searchParams]);
  if (!allowed) return null;
  return <>
    {validGaId && <Script src={`https://www.googletagmanager.com/gtag/js?id=${validGaId}`} strategy="afterInteractive" />}
    {validGtmId && <Script id="gtm-init" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${validGtmId}');`}</Script>}
  </>;
}
