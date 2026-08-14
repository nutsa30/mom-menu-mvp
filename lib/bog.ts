import crypto from 'crypto';

// ─── Bank of Georgia Payment Manager API client ────────────────────────────
// Docs: https://api.bog.ge/docs/en/payments/* (the /ipay/* tree is deprecated,
// do not use it). Mirrors the structure of lib/quickpay.ts so the two
// integrations stay easy to compare while Quickpay is unreachable from the UI.
//
// NOTE: real recurring payments must be manually activated per-merchant by
// BOG support on the older docs — confirm this is switched on for our
// merchant account once real BOG_CLIENT_ID/BOG_CLIENT_SECRET arrive.

const OAUTH_URL = 'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token';
const API_BASE = 'https://api.bog.ge/payments/v1';

export const PLAN_AMOUNTS: Record<'RECIPE_PLAN' | 'FULL_PLAN', string | undefined> = {
  RECIPE_PLAN: process.env.BOG_RECIPE_PLAN_AMOUNT_GEL,
  FULL_PLAN: process.env.BOG_FULL_PLAN_AMOUNT_GEL,
};

// Nominal amount charged to verify+tokenize the card during the 7-day trial.
// Refunded immediately once the order is confirmed paid (see webhook handler).
export const TRIAL_AMOUNT_GEL = process.env.BOG_TRIAL_AMOUNT_GEL || '0.10';

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

// ─── Create the trial (first-payment / card-tokenizing) order ─────────────
// Creates a nominal-amount order and immediately enables card-saving on it
// (must happen BEFORE the customer is redirected to pay), then returns the
// URL to redirect the customer to. The nominal amount gets refunded once the
// webhook confirms payment (see app/api/webhooks/bog/route.ts).
export async function createTrialOrder(opts: {
  plan: 'RECIPE_PLAN' | 'FULL_PLAN';
  userId: string;
  email: string;
  name: string;
}): Promise<{ url: string; orderId: string }> {
  if (!PLAN_AMOUNTS[opts.plan]) {
    throw new Error(`No BOG GEL amount configured for ${opts.plan}`);
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const trialAmount = Number(TRIAL_AMOUNT_GEL);

  const headers = await apiHeaders(`checkout_${opts.userId}_${Date.now()}`);
  const res = await fetch(`${API_BASE}/ecommerce/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      callback_url: `${appUrl}/api/webhooks/bog`,
      external_order_id: encodeOrderId(opts.userId, opts.plan),
      purchase_units: {
        currency: 'GEL',
        total_amount: trialAmount,
        basket: [
          {
            product_id: 'trial',
            quantity: 1,
            unit_price: trialAmount,
          },
        ],
      },
      redirect_urls: {
        success: `${appUrl}/dashboard?sub=success`,
        fail: `${appUrl}/dashboard?sub=failed`,
      },
      capture: 'automatic',
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

// ─── Charge the saved card (renewal) ───────────────────────────────────────
// Server-to-server recurring charge against a previously tokenized card.
// Result is async — BOG confirms success/failure via webhook, not this response.
//
// AMBIGUITY FLAG: BOG's docs for POST /ecommerce/orders/:parent_order_id/subscribe
// only document `callback_url` + `external_order_id` in the body, and state that
// amount/currency/buyer are inherited from the parent order. That means the
// trial order's nominal (e.g. 0.10 GEL) amount would be reused verbatim for
// renewals, which is wrong — renewals need the real plan price. The docs don't
// say whether the endpoint accepts an amount/purchase_units override. We send
// `purchase_units` in the same shape used at order-creation defensively, on the
// chance the endpoint honors it; if BOG's API ignores unknown fields and always
// inherits the parent amount, this call will silently charge the wrong amount
// (the trial amount) and MUST be re-verified against a real sandbox account
// before this goes live — see the flag in the final report for this task.
export async function chargeSavedCard(opts: {
  parentOrderId: string;
  plan: 'RECIPE_PLAN' | 'FULL_PLAN';
  userId: string;
}): Promise<{ orderId: string; raw: any }> {
  const amount = PLAN_AMOUNTS[opts.plan];
  if (!amount) throw new Error(`No BOG GEL amount configured for ${opts.plan}`);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const amountNum = Number(amount);

  const headers = await apiHeaders(`renew_${opts.parentOrderId}_${Date.now()}`);
  const res = await fetch(`${API_BASE}/ecommerce/orders/${opts.parentOrderId}/subscribe`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      callback_url: `${appUrl}/api/webhooks/bog`,
      external_order_id: encodeRenewalOrderId(opts.userId),
      // Defensive override attempt — see AMBIGUITY FLAG above.
      purchase_units: {
        currency: 'GEL',
        total_amount: amountNum,
        basket: [
          {
            product_id: opts.plan.toLowerCase(),
            quantity: 1,
            unit_price: amountNum,
          },
        ],
      },
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
// Used to refund the nominal trial-verification charge once the card is
// confirmed saved, so the customer isn't actually out that money during the
// free trial. Endpoint confirmed via WebFetch of api.bog.ge/docs/en/payments/refund
// (not in the task brief's summarized endpoint list): POST to
// /payments/v1/payment/refund/:order_id (note: different base path segment,
// "payment" not "payments", from the rest of this client — confirmed from docs,
// not a typo). Body `{ amount }` is optional; omitting it refunds the full amount,
// which is what we want for the trial charge, so no amount is passed.
export async function refundOrder(orderId: string, amount?: string) {
  const headers = await apiHeaders(`refund_${orderId}_${Date.now()}`);
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
