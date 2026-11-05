'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { analyticsAllowed, CONSENT_EVENT } from '@/lib/analytics-consent';
import { trackablePath } from '@/lib/traffic-source';
import { disablePixels, enablePixels, pixelPageView, type PixelIds } from '@/lib/ad-pixels';

// Loads Meta / TikTok / Pinterest pixels - only after cookie consent and only for the
// platforms whose ID is configured in Vercel (META_PIXEL_ID, TIKTOK_PIXEL_ID, PINTEREST_TAG_ID).
export default function AdPixels({ ids }: { ids: PixelIds }) {
  const pathname = usePathname();
  const last = useRef('');
  const configured = Boolean(ids.meta || ids.tiktok || ids.pinterest);

  useEffect(() => {
    if (!configured) return;
    const sync = () => {
      if (analyticsAllowed()) { enablePixels(ids); last.current = ''; sendView(); } else { disablePixels(); last.current = ''; }
    };
    const sendView = () => {
      const path = trackablePath(window.location.pathname);
      if (!path || last.current === path) return;   // private pages (account, admin, e-mail links) never reach ad platforms
      last.current = path; pixelPageView();
    };
    sync(); window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, [configured]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!configured || !analyticsAllowed()) return;
    const path = trackablePath(pathname);
    if (!path || last.current === path) return;
    last.current = path; pixelPageView();
  }, [pathname, configured]);

  return null;
}
