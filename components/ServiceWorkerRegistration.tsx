'use client';

import { useEffect } from 'react';

/**
 * Registers /sw.js at scope /.
 * The SW already imports the OneSignal SW code, so a single registration
 * handles both offline caching and push notifications.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((reg) => {
        // Immediately check for a newer SW version
        reg.update().catch(() => {});
      })
      .catch(() => {});
  }, []);

  return null;
}
