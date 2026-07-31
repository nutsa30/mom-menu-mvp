import crypto from 'crypto';

const API_BASE = 'https://api.lemonsqueezy.com/v1';

export const PLAN_VARIANT_IDS: Record<'RECIPE_PLAN' | 'FULL_PLAN', string | undefined> = {
  RECIPE_PLAN: process.env.LEMONSQUEEZY_RECIPE_PLAN_VARIANT_ID,
  FULL_PLAN: process.env.LEMONSQUEEZY_FULL_PLAN_VARIANT_ID,
};

export function variantIdToPlan(variantId: string): 'RECIPE_PLAN' | 'FULL_PLAN' | null {
  if (variantId === process.env.LEMONSQUEEZY_RECIPE_PLAN_VARIANT_ID) return 'RECIPE_PLAN';
  if (variantId === process.env.LEMONSQUEEZY_FULL_PLAN_VARIANT_ID) return 'FULL_PLAN';
  return null;
}

function apiHeaders() {
  return {
    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  };
}

export async function createCheckout(opts: {
  plan: 'RECIPE_PLAN' | 'FULL_PLAN';
  userId: string;
  email: string;
  name: string;
  discountCode?: string;
}) {
  const variantId = PLAN_VARIANT_IDS[opts.plan];
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!variantId || !storeId || !process.env.LEMONSQUEEZY_API_KEY) {
    throw new Error('Lemon Squeezy is not configured (missing store/variant/API key env vars)');
  }

  const checkoutData: Record<string, any> = {
    email: opts.email,
    name: opts.name,
    custom: { user_id: opts.userId },
  };
  if (opts.discountCode) checkoutData.discount_code = opts.discountCode;

  const res = await fetch(`${API_BASE}/checkouts`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: checkoutData,
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?lang=ka&sub=success`,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: storeId } },
          variant: { data: { type: 'variants', id: variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lemon Squeezy checkout creation failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  return json.data.attributes.url as string;
}

export async function getSubscriptionPortalUrl(lsSubscriptionId: string) {
  const res = await fetch(`${API_BASE}/subscriptions/${lsSubscriptionId}`, {
    headers: apiHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lemon Squeezy subscription fetch failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  return json.data.attributes.urls.customer_portal as string;
}

export async function cancelSubscription(lsSubscriptionId: string) {
  const res = await fetch(`${API_BASE}/subscriptions/${lsSubscriptionId}`, {
    method: 'PATCH',
    headers: apiHeaders(),
    body: JSON.stringify({
      data: {
        type: 'subscriptions',
        id: lsSubscriptionId,
        attributes: { cancelled: true },
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lemon Squeezy subscription cancel failed (${res.status}): ${text}`);
  }
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;
  const digest = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  const a = Buffer.from(digest, 'utf8');
  const b = Buffer.from(signatureHeader, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
