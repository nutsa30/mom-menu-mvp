import crypto from 'crypto';

// ─── Bank of Georgia Payment Manager API client ────────────────────────────
// Docs: https://api.bog.ge/docs/en/payments/* (the /ipay/* tree is deprecated,
// do not use it). Mirrors the structure of lib/quickpay.ts so the two
// integrations stay easy to compare while Quickpay is unreachable from the UI.
//
// NOTE: Recurring Payments and Preauthorization both had to be manually activated by
// BOG support on our merchant account (manager.bog.ge → application → additional
// services) — both are confirmed active now.

const OAUTH_URL = 'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token';
const API_BASE = 'https://api.bog.ge/payments/v1';

export const PLAN_AMOUNTS: Record<'RECIPE_PLAN' | 'FULL_PLAN', string | undefined> = {
  RECIPE_PLAN: process.env.BOG_RECIPE_PLAN_AMOUNT_GEL,
  FULL_PLAN: process.env.BOG_FULL_PLAN_AMOUNT_GEL,
};

const PLAN_DESCRIPTIONS: Record<'RECIPE_PLAN' | 'FULL_PLAN', string> = {
  RECIPE_PLAN: 'MomMenu — რეცეპტების წვდომა',
  FULL_PLAN: 'MomMenu — სრული პაკეტი',
};

// ─── OAuth2 token cache ─────────────────────────────────────────────────────
// Cache and reuse the access token until near expiry instead of fetching one
// per call — expires_in is seconds, per the auth endpoint's response.

let cachedToken: { value: string; expiresAt: number } | null = null;
const TOKEN_EXPIRY_BUFFER_MS = 30_000;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - TOKEN_EXPIRY_BUFFER_MS > Date.now()) {
    return cachedToken.value;
  }

  const clientId = process.env.BOG_CLIENT_ID;
  const clientSecret = process.env.BOG_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('BOG is not configured (missing BOG_CLIENT_ID / BOG_CLIENT_SECRET env vars)');
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BOG auth failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  cachedToken = {
    value: json.access_token as string,
    expiresAt: Date.now() + Number(json.expires_in ?? 0) * 1000,
  };
  return cachedToken.value;
}

async function apiHeaders(idempotencyKey?: string): Promise<Record<string, string>> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    // Explicit, not left to fetch()'s own default — BOG strictly validates this
    // against [ka, en] and rejects anything else (including "*", which is what
    // an unset header can end up resolving to server-side).
    'Accept-Language': 'ka',
  };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  return headers;
}

// Encodes which user/plan a payment is for into external_order_id, since BOG
// (like Quickpay) has no structured custom-data field like Lemon Squeezy's
// `custom.user_id`. cuids are lowercase alphanumeric only, so splitting on
// "_" is safe.
export function encodeOrderId(userId: string, plan: 'RECIPE_PLAN' | 'FULL_PLAN'): string {
  return `mm_${userId}_${plan}`;
}

export function decodeOrderId(externalOrderId: string | null | undefined): { userId: string; plan: 'RECIPE_PLAN' | 'FULL_PLAN' } | null {
  if (!externalOrderId) return null;
  const m = externalOrderId.match(/^mm_([a-z0-9]+)_(RECIPE_PLAN|FULL_PLAN)$/);
  if (!m) return null;
  return { userId: m[1], plan: m[2] as 'RECIPE_PLAN' | 'FULL_PLAN' };
}

// Renewal charges are resolved back to a user by decoding the userId embedded
// here (mirrors encodeOrderId's reasoning) rather than via `bogParentOrderId`,
// since the callback for a renewal carries the NEW order id, not the parent's.
function encodeRenewalOrderId(userId: string): string {
  return `mm_renew_${userId}_${Date.now()}`;
}

export function decodeRenewalOrderId(externalOrderId: string | null | undefined): { userId: string } | null {
  if (!externalOrderId) return null;
  const m = externalOrderId.match(/^mm_renew_([a-z0-9]+)_\d+$/);
  if (!m) return null;
  return { userId: m[1] };
}

// ─── Create the order that tokenizes the card (trial or direct) ───────────
// CONFIRMED (via BOG's own docs, not a guess): POST .../orders/:parent_order_id/subscribe
// always inherits amount/currency/buyer/capture-mode from the ORIGINAL order it's attached
// to — there is no way to override these on a renewal charge. So the parent order created
// here MUST already be at the real plan price, not a nominal trial amount.
//
// CONFIRMED live against BOG's production API (not a guess): capture mode is ALSO
// inherited by /subscribe. That means a "manual" (preauthorization) parent produces
// "blocked" (held, not charged) renewal orders too — every renewal needs an explicit
// approvePreauthorization() call to actually collect the money (see the webhook handler).
//
// Two entry points, one shared helper:
// - createTrialOrder: capture "manual" (preauthorization). The webhook releases the hold
//   (cancelPreauthorization) the moment the card-save is confirmed, so the customer is
//   never actually charged during the 7-day free trial — BOG only places a temporary hold
//   that disappears, it never shows as a real transaction+refund pair. Renewal 7 days
//   later goes through the same parent order and gets approved (captured) for real.
// - createDirectOrder: capture "automatic", real immediate charge, no trial. Used for
//   accounts that already used their free trial once (see User.bogTrialUsed) — a repeat
//   purchase should charge immediately, not grant a second trial.
async function createOrder(opts: {
  plan: 'RECIPE_PLAN' | 'FULL_PLAN';
  userId: string;
  email: string;
  name: string;
  capture: 'manual' | 'automatic';
}): Promise<{ url: string; orderId: string }> {
  const amount = PLAN_AMOUNTS[opts.plan];
  if (!amount) {
    throw new Error(`No BOG GEL amount configured for ${opts.plan}`);
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const planAmount = Number(amount);

  const headers = await apiHeaders(crypto.randomUUID());
  const res = await fetch(`${API_BASE}/ecommerce/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      callback_url: `${appUrl}/api/webhooks/bog`,
      external_order_id: encodeOrderId(opts.userId, opts.plan),
      buyer: {
        full_name: opts.name,
        masked_email: opts.email,
      },
      purchase_units: {
        currency: 'GEL',
        total_amount: planAmount,
        basket: [
          {
            product_id: opts.plan.toLowerCase(),
            description: PLAN_DESCRIPTIONS[opts.plan],
            quantity: 1,
            unit_price: planAmount,
          },
        ],
      },
      redirect_urls: {
        success: `${appUrl}/dashboard?sub=success`,
        fail: `${appUrl}/dashboard?sub=failed`,
      },
      capture: opts.capture,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BOG order creation failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  const orderId = json.id as string;
  const redirectUrl = json?._links?.redirect?.href as string;
  if (!orderId || !redirectUrl) {
    throw new Error('BOG order creation returned an unexpected response shape');
  }

  // Enable card-saving on this order BEFORE redirecting the customer to pay.
  const subHeaders = await apiHeaders();
  const subRes = await fetch(`${API_BASE}/orders/${orderId}/subscriptions`, {
    method: 'PUT',
    headers: subHeaders,
  });
  if (!subRes.ok) {
    const text = await subRes.text();
    throw new Error(`BOG enable-subscription failed (${subRes.status}): ${text}`);
  }

  return { url: redirectUrl, orderId };
}

export function createTrialOrder(opts: { plan: 'RECIPE_PLAN' | 'FULL_PLAN'; userId: string; email: string; name: string }) {
  return createOrder({ ...opts, capture: 'manual' });
}

export function createDirectOrder(opts: { plan: 'RECIPE_PLAN' | 'FULL_PLAN'; userId: string; email: string; name: string }) {
  return createOrder({ ...opts, capture: 'automatic' });
}

// ─── Charge the saved card (renewal) ───────────────────────────────────────
// Server-to-server recurring charge against a previously tokenized card.
// Result is async — BOG confirms success/failure via webhook, not this response.
//
// CONFIRMED via BOG's docs (POST .../ecommerce/orders/:parent_order_id/subscribe):
// only `callback_url` and `external_order_id` are accepted in the body — amount,
// currency, and buyer info are ALWAYS inherited from the parent order, with no
// override. This is safe and correct as long as the parent order (see
// createTrialOrder above) was created at the real plan price, which it now is —
// do not attempt to pass purchase_units/amount here, BOG will ignore it.
export async function chargeSavedCard(opts: {
  parentOrderId: string;
  plan: 'RECIPE_PLAN' | 'FULL_PLAN';
  userId: string;
}): Promise<{ orderId: string; raw: any }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const headers = await apiHeaders(crypto.randomUUID());
  const res = await fetch(`${API_BASE}/ecommerce/orders/${opts.parentOrderId}/subscribe`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      callback_url: `${appUrl}/api/webhooks/bog`,
      external_order_id: encodeRenewalOrderId(opts.userId),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BOG recurring charge failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  return { orderId: (json.id as string) ?? opts.parentOrderId, raw: json };
}

// ─── Payment details / status ──────────────────────────────────────────────
// Used by the webhook handler when the callback body doesn't carry enough
// detail (card type, exact status), and to look up card_type for the
// commission calculation.
export async function getPaymentDetails(orderId: string) {
  const headers = await apiHeaders();
  const res = await fetch(`${API_BASE}/receipt/${orderId}`, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BOG payment details lookup failed (${res.status}): ${text}`);
  }
  return res.json();
}

// ─── Refund ─────────────────────────────────────────────────────────────────
// Refunds an already-CAPTURED (real, completed) charge. No longer used by the trial
// flow (see cancelPreauthorization below) — kept for admin/manual use on real charges
// (e.g. a completed direct-order or renewal that needs to be refunded after the fact).
// CONFIRMED: refunds draw from the merchant's own settled balance, not a direct reversal
// of the original transaction — a refund can be rejected with code 163 ("Not enough
// funds available in the account") if the merchant account hasn't settled enough yet,
// even though the original charge succeeded. Retry later if this happens.
// Endpoint: POST /payments/v1/payment/refund/:order_id (note: different base path
// segment, "payment" not "payments", from the rest of this client — confirmed from
// docs, not a typo). Body `{ amount }` is optional; omitting it refunds in full.
export async function refundOrder(orderId: string, amount?: string) {
  const headers = await apiHeaders(crypto.randomUUID());
  const res = await fetch(`https://api.bog.ge/payments/v1/payment/refund/${orderId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(amount ? { amount } : {}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BOG refund failed (${res.status}): ${text}`);
  }
  return res.json();
}

// ─── Preauthorization release / capture ────────────────────────────────────
// CONFIRMED live against BOG's production API: a "manual" capture order only places a
// temporary hold on the card (order_status "blocked") — no money moves. These two
// endpoints resolve that hold one way or the other:
//
// cancelPreauthorization — releases the hold with zero charge to the customer. Used for
// the trial-verification order the instant the card-save is confirmed, so the free trial
// never shows as a real charge+refund pair, just a hold that disappears.
//
// approvePreauthorization — actually captures (collects) the held amount, turning the
// hold into a real, completed transaction. Used for the renewal charge 7 days later:
// since /subscribe inherits the parent's "manual" capture mode, every renewal also comes
// back "blocked" first and needs this call to actually collect the money.
export async function cancelPreauthorization(orderId: string) {
  const headers = await apiHeaders(crypto.randomUUID());
  const res = await fetch(`https://api.bog.ge/payments/v1/payment/authorization/cancel/${orderId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BOG cancel-preauthorization failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function approvePreauthorization(orderId: string) {
  const headers = await apiHeaders(crypto.randomUUID());
  const res = await fetch(`https://api.bog.ge/payments/v1/payment/authorization/approve/${orderId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BOG approve-preauthorization failed (${res.status}): ${text}`);
  }
  return res.json();
}

// ─── Webhook signature verification ────────────────────────────────────────
// BOG signs the raw callback body with SHA256withRSA; the signature arrives
// base64-encoded in the `Callback-Signature` header. Verify against BOG's RSA
// public key, which we store base64-encoded (of the PEM) in BOG_PUBLIC_KEY to
// avoid multiline .env issues, and decode here. Verify over the raw,
// un-parsed body — never the re-serialized JSON.
const SIGNATURE_HEADER = 'callback-signature';

export function verifyWebhookSignature(rawBody: string, headers: Headers): boolean {
  const publicKeyB64 = process.env.BOG_PUBLIC_KEY;
  const signatureB64 = headers.get(SIGNATURE_HEADER);
  if (!publicKeyB64 || !signatureB64) return false;

  try {
    const publicKeyPem = Buffer.from(publicKeyB64, 'base64').toString('utf8');
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(rawBody, 'utf8');
    verifier.end();
    return verifier.verify(publicKeyPem, signatureB64, 'base64');
  } catch (err) {
    console.error('BOG webhook signature verification threw:', (err as Error).message);
    return false;
  }
}

// ─── Commission calculation ─────────────────────────────────────────────────
// BOG commission: 2% (minimum 0.10₾) for local Georgian cards, 3.5% for
// Amex/international cards. cardType comes from the payment-details response
// (see getPaymentDetails) — treat anything identifiably Amex or explicitly
// flagged international as the 3.5% tier, default to the local 2% tier
// otherwise (safer default once real card_type values are observed in
// production — revisit if BOG's actual values need tighter matching).
export function computeCommission(grossAmount: number, cardType?: string | null): { commissionAmount: number; netAmount: number } {
  const type = (cardType || '').toUpperCase();
  const isInternational = type.includes('AMEX') || type.includes('AMERICAN EXPRESS') || type.includes('INTERNATIONAL');
  const rate = isInternational ? 0.035 : 0.02;
  let commissionAmount = grossAmount * rate;
  if (!isInternational) commissionAmount = Math.max(commissionAmount, 0.1);
  commissionAmount = Math.round(commissionAmount * 100) / 100;
  const netAmount = Math.round((grossAmount - commissionAmount) * 100) / 100;
  return { commissionAmount, netAmount };
}
