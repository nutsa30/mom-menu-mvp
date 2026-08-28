import crypto from 'crypto';
import { prisma } from './prisma';
import { refundOrder } from './bog';

// ─── Referral / promo-code program ──────────────────────────────────────────
// Every registered user gets one permanent, unique "referral code" (distinct from the
// admin-managed global PromoCode model). Sharing it gets a friend 10% off their first
// payment and a 3-day trial instead of 7; the code owner earns a flat 1.70₾ credit the
// moment — and only the moment — that friend's first real payment succeeds. Credit
// accumulates forever and is consumed (refunded back) against the owner's own future
// payments. See CreditLedgerEntry in schema.prisma for the full audit trail this writes.
//
// IMPORTANT technical constraint this whole module works around: BOG's recurring-charge
// API (POST .../orders/:parent_order_id/subscribe) always inherits the PARENT order's
// original amount — there is no way to charge a reduced amount on a renewal. So neither
// the referred user's 10% discount nor the owner's credit can be applied by changing what
// gets charged. Instead, the full price is always charged first, and the discount/credit
// is immediately refunded back via BOG's partial-refund endpoint (refundOrder in lib/bog).
// Net cost to the customer is identical either way — the only difference is BOG's 2%
// commission is computed on the pre-refund gross amount, a few tetri more than a true
// reduced-price charge would have cost.

export const REFERRAL_CREDIT_AMOUNT = 1.7;
export const REFERRAL_DISCOUNT_PERCENT = 10;
export const REFERRED_TRIAL_DAYS = 3;
export const STANDARD_TRIAL_DAYS = 7;

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I — avoids visual ambiguity
const CODE_LENGTH = 7;

function randomCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

// Called once, right after a new User row is created (signup + Google callback). Retries
// on the rare unique-constraint collision instead of trusting randomness alone.
export async function ensureReferralCode(userId: string): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = randomCode();
    try {
      await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
      return code;
    } catch (err: any) {
      if (err?.code === 'P2002') continue; // code collision — try another
      throw err;
    }
  }
  throw new Error('Could not generate a unique referral code after 8 attempts');
}

// Owner's current available balance — the single source of truth, always recomputed from
// the ledger rather than cached on User, so it can never drift out of sync with the audit
// trail (EARNED entries positive, USED/REVERSED entries negative).
export async function getAvailableCredit(ownerId: string): Promise<number> {
  const agg = await prisma.creditLedgerEntry.aggregate({
    where: { ownerId },
    _sum: { amount: true },
  });
  return Math.round((agg._sum.amount ?? 0) * 100) / 100;
}

// Whether this user is still owed their 10%-off-first-payment (referred, but hasn't had
// a real successful charge yet). Used by both the user-facing stats tab and the admin
// view so the "next charge" preview they show is accurate for a referred user still in
// trial, instead of quoting the full package price and contradicting the page's own
// "you'll get 10% off" promise.
export function hasPendingReferralDiscount(user: { referredByUserId: string | null; referralFirstPaymentAt: Date | null }): boolean {
  return !!user.referredByUserId && !user.referralFirstPaymentAt;
}

type RedeemResult =
  | { ok: true }
  | { ok: false; error: 'not_found' | 'self' | 'already_used' | 'already_paid' };

// Redeeming a code is the ONE moment referredByUserId is ever set — permanently, and only
// if it isn't set already. Only available before the user's first checkout (bogParentOrderId
// still null) since trial length is decided the instant that checkout starts.
export async function redeemReferralCode(userId: string, rawCode: string): Promise<RedeemResult> {
  const code = rawCode.trim().toUpperCase();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: 'not_found' };
  if (user.referredByUserId) return { ok: false, error: 'already_used' };
  if (user.bogParentOrderId) return { ok: false, error: 'already_paid' };

  const owner = await prisma.user.findUnique({ where: { referralCode: code } });
  if (!owner) return { ok: false, error: 'not_found' };
  if (owner.id === userId) return { ok: false, error: 'self' };

  await prisma.user.update({ where: { id: userId }, data: { referredByUserId: owner.id } });
  return { ok: true };
}

// ─── Applying discount/credit on a real successful payment ─────────────────────────
// Call this right after creating a SUCCESS Payment row (both the first-purchase direct-
// charge branch and the renewal branch in the BOG webhook use the same shape of payment,
// so both call this the same way). Everything here is additive/idempotent as long as it's
// only ever called once per Payment row — which is guaranteed by the webhook's existing
// "does a Payment with this bogOrderId already exist" check happening before Payment.create.
export async function applyReferralAdjustments(opts: {
  paymentId: string;
  orderId: string;
  userId: string;
  grossAmount: number;
}): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: opts.userId } });
  if (!user) return;

  // ── (1) Figure out both amounts WITHOUT calling BOG yet ─────────────────────────
  // A user can be a first-time referred payer AND already have their own banked credit
  // (as someone else's referrer) on the very same payment. Rather than issuing two
  // separate partial refunds against the same BOG order — untested, and not guaranteed
  // to be supported — both amounts are combined into a single refundOrder() call below.
  let discountApplied = 0;
  let isFirstPayment = false;
  if (user.referredByUserId && !user.referralFirstPaymentAt) {
    // Gated on "is this truly the first SUCCESS payment this user has ever had" — the
    // trial's preauthorization hold is recorded as REFUNDED, never SUCCESS, so this only
    // fires once, on the real first charge, never on any later renewal.
    const priorSuccessCount = await prisma.payment.count({
      where: { userId: user.id, status: 'SUCCESS', id: { not: opts.paymentId } },
    });
    if (priorSuccessCount === 0) {
      discountApplied = Math.round(opts.grossAmount * (REFERRAL_DISCOUNT_PERCENT / 100) * 100) / 100;
      isFirstPayment = true;
    }
  }

  const availableCredit = await getAvailableCredit(user.id);
  const remainingCapacity = Math.round((opts.grossAmount - discountApplied) * 100) / 100;
  const creditToApply = Math.max(0, Math.round(Math.min(availableCredit, remainingCapacity) * 100) / 100);

  // ── (2) One combined refund call for whatever is owed back ──────────────────────
  const totalRefund = Math.round((discountApplied + creditToApply) * 100) / 100;
  let refundFailed = false;
  if (totalRefund > 0) {
    try {
      await refundOrder(opts.orderId, totalRefund.toFixed(2));
    } catch (err: any) {
      console.error('Referral: combined discount/credit refund failed', {
        userId: user.id, orderId: opts.orderId, discountApplied, creditToApply, error: err.message,
      });
      refundFailed = true;
    }
  }

  // ── (3) Record the effects ───────────────────────────────────────────────────────
  // The first-payment reward (referrer's +1.70₾, and referralFirstPaymentAt) is recorded
  // regardless of whether the refund itself succeeded — it's a one-time event that must be
  // marked exactly once, with discountRefundFailed left as the signal for manual follow-up.
  // Credit consumption stays retry-safe: the USED entry is only written on refund success,
  // so a failed refund leaves the balance untouched for the next payment cycle to retry.
  if (isFirstPayment) {
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { referralFirstPaymentAt: new Date() } }),
      prisma.creditLedgerEntry.create({
        data: {
          ownerId: user.referredByUserId!,
          referredUserId: user.id,
          type: 'EARNED',
          amount: REFERRAL_CREDIT_AMOUNT,
          sourcePaymentId: opts.paymentId,
          note: `${user.name} — პირველი წარმატებული გადახდა`,
        },
      }),
    ]);
  }

  if (creditToApply > 0 && !refundFailed) {
    await prisma.creditLedgerEntry.create({
      data: {
        ownerId: user.id,
        type: 'USED',
        amount: -creditToApply,
        appliedPaymentId: opts.paymentId,
        note: 'გამოყენებულია საკუთარ გადახდაზე',
      },
    });
  }

  await prisma.payment.update({
    where: { id: opts.paymentId },
    data: {
      discountAmount: discountApplied > 0 ? discountApplied : null,
      discountRefundFailed: discountApplied > 0 ? refundFailed : false,
      creditAppliedAmount: (creditToApply > 0 && !refundFailed) ? creditToApply : null,
      creditRefundFailed: creditToApply > 0 ? refundFailed : false,
    },
  });
}

// Called when a referred user cancels their subscription (see app/subscription/cancel).
// Backs the 1.70₾ out of the owner's balance if — and only if — it was ever actually
// earned (a trial-only cancel never earned anything, so this is a no-op for it).
export async function reverseReferralCreditOnCancel(referredUserId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: referredUserId } });
  if (!user?.referredByUserId) return;

  const earned = await prisma.creditLedgerEntry.findFirst({
    where: { ownerId: user.referredByUserId, referredUserId, type: 'EARNED' },
  });
  if (!earned) return; // never actually earned (canceled during trial, or payment failed)

  const alreadyReversed = await prisma.creditLedgerEntry.findFirst({
    where: { ownerId: user.referredByUserId, referredUserId, type: 'REVERSED' },
  });
  if (alreadyReversed) return; // idempotency guard — never double-reverse the same referral

  await prisma.creditLedgerEntry.create({
    data: {
      ownerId: user.referredByUserId,
      referredUserId,
      type: 'REVERSED',
      amount: -earned.amount,
      sourcePaymentId: earned.sourcePaymentId,
      note: `${user.name} გააუქმა გამოწერა — კრედიტი გაუქმდა`,
    },
  });
}
