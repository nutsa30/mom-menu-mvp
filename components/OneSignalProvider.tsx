'use client';

/**
 * OneSignalProvider
 *
 * Loads the OneSignal Web SDK (v16) from CDN once the page is interactive.
 * The SDK is configured to use the same /sw.js service worker (which already
 * importScripts the OneSignal SW code), so no second SW is registered.
 *
 * Required env var: NEXT_PUBLIC_ONESIGNAL_APP_ID
 * Get yours at https://onesignal.com → New App → Web Push
 */

import { useEffect } from 'react';

declare global {
  interface Window {
    OneSignalDeferred: ((fn: (os: unknown) => void | Promise<void>) => void)[];
  }
}

export default function OneSignalProvider() {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

    // Skip if no App ID configured yet
    if (!appId || appId === 'YOUR_ONESIGNAL_APP_ID') return;

    // Initialise deferred queue before SDK loads
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: unknown) => {
      const os = OneSignal as {
        init(cfg: Record<string, unknown>): Promise<void>;
      };
      await os.init({
        appId,
        // Re-use our existing service worker — it already imports OneSignal's SW code
        serviceWorkerPath: '/sw.js',
        serviceWorkerParam: { scope: '/' },
        // Suppress OneSignal's built-in notify button — we have our own UI
        notifyButton: { enable: false },
        // Never auto-prompt; we show our own NotificationPrompt component
        promptOptions: { slidedown: { prompts: [] } },
        // Allow localhost during development
        allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
      });
    });

    // Inject SDK script once
    if (!document.getElementById('onesignal-sdk')) {
      const script = document.createElement('script');
      script.id   = 'onesignal-sdk';
      script.src  = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return null;
}
