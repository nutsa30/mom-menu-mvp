import { analyticsAllowed, analyticsLocation, campaignAttribution } from './analytics-consent';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    mommenuAnalyticsReady?: boolean;
    mommenuAnalyticsQueue?: Array<{ name: string; params: Record<string, any> }>;
  }
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (!analyticsAllowed()) return;
  const event = { name: eventName, params: { ...campaignAttribution(), page_location: analyticsLocation(window.location.href), ...params } };
  if (!window.mommenuAnalyticsReady) {
    window.mommenuAnalyticsQueue = [...(window.mommenuAnalyticsQueue || []), event].slice(-50);
    return;
  }
  window.gtag?.('event', event.name, event.params);
}

export function flushAnalyticsEvents() {
  if (!analyticsAllowed() || !window.mommenuAnalyticsReady) return;
  for (const event of window.mommenuAnalyticsQueue || []) window.gtag?.('event', event.name, event.params);
  window.mommenuAnalyticsQueue = [];
}

export const ga = {
  signUp:              (method = 'email') => trackEvent("sign_up", { method }),
  login:               () => trackEvent("login",               { method: "email" }),
  subscribe:           (planName: string, value: number, currency = 'GEL') =>
                         trackEvent("begin_checkout",          { currency, value, item_name: planName }),
  cancelSubscription:  () => trackEvent("cancel_subscription"),
  viewBlog:            (title: string) =>
                         trackEvent("view_item",               { item_name: title, item_category: "blog" }),
  contactSubmit:       () => trackEvent("contact_form_submit"),
};

export function rememberCheckout(orderId: string) {
  if (!analyticsAllowed()) return;
  try { sessionStorage.setItem('mommenu_checkout_order', orderId); } catch { /* Storage may be unavailable. */ }
}
