'use client';

/**
 * Loads OneSignal Web SDK v16 using Next.js Script (afterInteractive).
 * OneSignalSDKWorker.js in /public handles push events + caching.
 * Required env: NEXT_PUBLIC_ONESIGNAL_APP_ID
 */

import Script from 'next/script';

declare global {
  interface Window {
    OneSignalDeferred: ((fn: (os: unknown) => void | Promise<void>) => void)[];
    OneSignal: unknown;
  }
}

export default function OneSignalProvider() {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId || appId === 'YOUR_ONESIGNAL_APP_ID') return null;

  return (
    <>
      {/* 1. Queue init BEFORE the SDK script loads */}
      <Script id="onesignal-init" strategy="afterInteractive">{`
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async function(OneSignal) {
          await OneSignal.init({
            appId: "${appId}",
            notifyButton: { enable: false }
          });
        });
      `}</Script>

      {/* 2. SDK script — processes the queue above once loaded */}
      <Script
        id="onesignal-sdk"
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        strategy="afterInteractive"
      />
    </>
  );
}
