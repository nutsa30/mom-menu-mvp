declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", eventName, params);
  window.dataLayer?.push({ event: eventName, ...params });
}

export const ga = {
  signUp:              () => trackEvent("sign_up",              { method: "email" }),
  login:               () => trackEvent("login",               { method: "email" }),
  subscribe:           (planName: string, value: number) =>
                         trackEvent("purchase",                { currency: "GEL", value, item_name: planName }),
  cancelSubscription:  () => trackEvent("cancel_subscription"),
  viewBlog:            (title: string) =>
                         trackEvent("view_item",               { item_name: title, item_category: "blog" }),
  contactSubmit:       () => trackEvent("contact_form_submit"),
};
