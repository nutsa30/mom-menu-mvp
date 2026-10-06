'use client';

/**
 * Loads OneSignal Web SDK v16 using Next.js Script (afterInteractive).
 * OneSignalSDKWorker.js in /public handles push events + caching.
 * Required env: NEXT_PUBLIC_ONESIGNAL_APP_ID
 */

import Script from 'next/script';
import { useCallback, useEffect } from 'react';
import { useExperience } from './ExperienceProvider';

declare global {
  interface Window {
    mommenuPushReady?: Promise<any>;
    mommenuPushSync?: Promise<void>;
  }
}

export default function OneSignalProvider({ userId }: { userId?: string }) {
  const { market, locale, timeZone, preview } = useExperience();
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  const syncIdentity = useCallback(() => {
    if (preview || !window.mommenuPushReady) return;
    window.mommenuPushSync = (window.mommenuPushSync || Promise.resolve()).catch(() => {}).then(async () => {
      const sdk = await window.mommenuPushReady;
      if (!sdk) return;
      if (userId) await sdk.login(userId);
      else await sdk.logout();
      await sdk.User.setLanguage(locale);
      await sdk.User.addTags({ market, account_locale: locale, time_zone: timeZone });
    }).catch(() => {});
  }, [userId, market, locale, timeZone, preview]);
  useEffect(() => { syncIdentity(); }, [syncIdentity]);
  if (!appId || appId === 'YOUR_ONESIGNAL_APP_ID' || preview) return null;

  return (
    <>
      {/* 1. Queue init BEFORE the SDK script loads */}
      <Script id="onesignal-init" strategy="afterInteractive">{`
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.mommenuPushReady = new Promise(function(resolve, reject) {
        window.OneSignalDeferred.push(async function(OneSignal) {
          try {
          await OneSignal.init({
            appId: "${appId}",
            notifyButton: { enable: false }
          });
          resolve(OneSignal);
          } catch (error) { reject(error); }
        });
        });
      `}</Script>

      {/* 2. SDK script — processes the queue above once loaded */}
      <Script
        id="onesignal-sdk"
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        strategy="afterInteractive"
        onReady={syncIdentity}
      />
    </>
  );
}
