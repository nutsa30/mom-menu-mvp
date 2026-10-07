'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { analyticsAllowed, CONSENT_EVENT } from '@/lib/analytics-consent';
import { trackEvent } from '@/lib/gtag';

export default function PurchaseConversion() {
  const params = useSearchParams();
  useEffect(() => {
    if (params.get('sub') !== 'success') return;
    let stopped = false, running = false, timer: ReturnType<typeof setTimeout> | undefined, attempts = 0;
    const check = async () => {
      if (stopped || running || !analyticsAllowed()) return;
      running = true;
      try {
        const orderId = sessionStorage.getItem('mommenu_checkout_order');
        if (!orderId || sessionStorage.getItem(`mommenu_purchase_${orderId}`)) return;
        const response = await fetch(`/api/analytics/purchase?orderId=${encodeURIComponent(orderId)}`);
        if (!response.ok || stopped) return;
        const data = await response.json();
        if (data.transaction_id === orderId && !stopped && analyticsAllowed() && !sessionStorage.getItem(`mommenu_purchase_${orderId}`)) {
          trackEvent('purchase', data);
          sessionStorage.setItem(`mommenu_purchase_${orderId}`, '1');
          sessionStorage.removeItem('mommenu_checkout_order');
        } else if (data.pending && ++attempts < 20 && !stopped) timer = setTimeout(check, 3000);
      } catch { /* Analytics failure must never affect paid access. */ }
      finally { running = false; }
    };
    void check(); window.addEventListener(CONSENT_EVENT, check);
    return () => { stopped = true; if (timer) clearTimeout(timer); window.removeEventListener(CONSENT_EVENT, check); };
  }, [params]);
  return null;
}
