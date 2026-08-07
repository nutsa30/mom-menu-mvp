import crypto from 'crypto';

const API_BASE = process.env.QUICKPAY_API_BASE || 'https://api.quickpay.ge/v1';

// TODO(confirm): exact slug for the tokenizing checkout — check GET /gateways
// for the `_subscriptions` variant of your preferred gateway (e.g. "bog_card_subscriptions").
const SUBSCRIPTION_GATEWAY_SLUG = process.env.QUICKPAY_SUBSCRIPTION_GATEWAY_SLUG;

export const PLAN_AMOUNTS: Record<'RECIPE_PLAN' | 'FULL_PLAN', string | undefined> = {
  RECIPE_PLAN: process.env.QUICKPAY_RECIPE_PLAN_AMOUNT_GEL,
  FULL_PLAN: process.env.QUICKPAY_FULL_PLAN_AMOUNT_GEL,
};

function apiHeaders(idempotencyKey?: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.QUICKPAY_API_KEY}`,
    'Content-Type': 'application/json',
  };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  return headers;
}

// Encodes which user/plan a payment is for into merchant_order_id, since Quickpay
// has no structured custom-data field like Lemon Squeezy's `custom.user_id`.
// cuids are lowercase alphanumeric only, so splitting on "_" is safe.
export function encodeOrderId(userId: string, plan: 'RECIPE_PLAN' | 'FULL_PLAN'): string {
  return `mm_${userId}_${plan}`;
}

export function decodeOrderId(merchantOrderId: string | null | undefined): { userId: string; plan: 'RECIPE_PLAN' | 'FULL_PLAN' } | null {
  if (!merchantOrderId) return null;
  const m = merchantOrderId.match(/^mm_([a-z0-9]+)_(RECIPE_PLAN|FULL_PLAN)$/);
  if (!m) return null;
  return { userId: m[1], plan: m[2] as 'RECIPE_PLAN' | 'FULL_PLAN' };
}

// Creates the FIRST payment on the tokenizing (`_subscriptions`) checkout page.
// Once the customer pays, the card is tokenized and the token arrives via webhook.
export async function createSubscriptionPayment(opts: {
  plan: 'RECIPE_PLAN' | 'FULL_PLAN';
  userId: string;
  email: string;
  name: string;
}) {
  if (!SUBSCRIPTION_GATEWAY_SLUG || !process.env.QUICKPAY_API_KEY) {
    throw new Error('Quickpay is not configured (missing gateway slug / API key env vars)');
  }
  const amount = PLAN_AMOUNTS[opts.plan];
  if (!amount) throw new Error(`No Quickpay GEL amount configured for ${opts.plan}`);

  const res = await fetch(`${API_BASE}/payments`, {
    method: 'POST',
    headers: apiHeaders(`checkout_${opts.userId}_${Date.now()}`),
    body: JSON.stringify({
      amount: Number(amount),
      currency: 'GEL',
      description: opts.plan === 'FULL_PLAN' ? 'MomMenu — სრული პაკეტი' : 'MomMenu — რეცეპტების წვდომა',
      gateway_slug: SUBSCRIPTION_GATEWAY_SLUG,
      merchant_order_id: encodeOrderId(opts.userId, opts.plan),
      customer_name: opts.name,
      customer_email: opts.email,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?lang=ka&sub=success`,
      source: 'api',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Quickpay payment creation failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  return json.payment_url as string;
}

// Server-to-server recurring charge against a previously tokenized card.
// Result is async — Quickpay confirms success/failure via webhook, not this response.
export async function chargeSubscriptionToken(subscriptionToken: string, opts: { amount: string; description: string }) {
  const res = await fetch(`${API_BASE}/payments/charge`, {
    method: 'POST',
    headers: apiHeaders(`renew_${subscriptionToken}_${Date.now()}`),
    body: JSON.stringify({
      subscription_token: subscriptionToken,
      amount: Number(opts.amount),
      description: opts.description,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Quickpay recurring charge failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function getGateways() {
  const res = await fetch(`${API_BASE}/gateways`, { headers: apiHeaders() });
  if (!res.ok) throw new Error(`Quickpay gateway list failed (${res.status}): ${await res.text()}`);
  return res.json();
}

// Confirmed from the Quickpay dashboard's Webhooks page (Signature format):
//   QUICKPAY-SIGNATURE: t={timestamp},v1=HMAC-SHA256(secret, "{timestamp}.{body}")
// Requests with a timestamp older than 5 minutes must be rejected (replay protection).
const SIGNATURE_HEADER = process.env.QUICKPAY_WEBHOOK_SIGNATURE_HEADER || 'quickpay-signature';
const MAX_TIMESTAMP_AGE_SECONDS = 5 * 60;

export function verifyWebhookSignature(rawBody: string, headers: Headers): boolean {
  const secret = process.env.QUICKPAY_WEBHOOK_SECRET;
  const header = headers.get(SIGNATURE_HEADER);
  if (!secret || !header) return false;

  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]));
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > MAX_TIMESTAMP_AGE_SECONDS) return false;

  const digest = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`, 'utf8').digest('hex');
  const a = Buffer.from(digest, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
