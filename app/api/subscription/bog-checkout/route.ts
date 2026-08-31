import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createTrialOrder, createDirectOrder, isBillingInterval } from '@/lib/bog';
import { ageInMonths } from '@/lib/meal';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { interval, promoCode } = await req.json();
    if (!isBillingInterval(interval)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id }, include: { children: true } });
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // A promo code shortens the trial to 3 days (see the "isBlocked" branch of the BOG
    // webhook, which checks user.promoCodeId) AND permanently discounts every charge on
    // THIS subscription — first payment and every renewal, since BOG's renewal API always
    // inherits the parent order's original (already-discounted) amount. Only linked once,
    // before the account's first-ever trial checkout, same constraint redeemReferralCode()
    // enforces for referral codes (lib/referral.ts) — typing a code in on a later,
    // already-trialed purchase can't retroactively shorten a trial that's already happened.
    // Canceling clears promoCodeId (see app/subscription/cancel/route.ts) — a later
    // resubscribe without re-entering a code pays full price, as a discount tied to a
    // subscription that already ended shouldn't silently carry over to a new one.
    let discountPercent: number | null = null;
    if (promoCode && typeof promoCode === 'string' && !user.bogTrialUsed && !user.promoCodeId) {
      const promo = await prisma.promoCode.findUnique({ where: { code: promoCode.trim().toUpperCase() } });
      if (promo && promo.isActive && promo.planType === 'FULL_PLAN') {
        const uses = await prisma.user.count({ where: { promoCodeId: promo.id } });
        if (promo.maxUses === null || uses < promo.maxUses) {
          await prisma.user.update({ where: { id: user.id }, data: { promoCodeId: promo.id } });
          discountPercent = promo.discountPercent;
        }
      }
    } else if (user.promoCodeId) {
      // Already linked from an earlier checkout on this same still-open subscription
      // (e.g. switching billing interval without canceling first) — keep the same discount.
      const promo = await prisma.promoCode.findUnique({ where: { id: user.promoCodeId } });
      discountPercent = promo?.discountPercent ?? null;
    }

    // Site content only starts at 6 months — if every child on the account is younger
    // than that, there's nothing a package would unlock yet.
    if (user.children.length > 0 && !user.children.some((c) => ageInMonths(c.birthDate) >= 6)) {
      return NextResponse.json({ error: 'child_too_young', message: 'პაკეტის შეძენა შესაძლებელი იქნება, როცა ბავშვი 6 თვის გახდება.' }, { status: 400 });
    }

    if (
      user.subscriptionStatus === 'FULL_PLAN' &&
      user.billingIntervalMonths === interval &&
      user.subscriptionCanceledAt === null &&
      (user.lsSubscriptionId || user.qpSubscriptionToken || user.bogParentOrderId)
    ) {
      // Already has this exact tier active on some processor — buying it again would
      // just start a fresh checkout without cancelling the running one.
      return NextResponse.json({ error: 'already_subscribed' }, { status: 400 });
    }

    // First-ever purchase on this account gets a 7-day free trial (preauthorized hold,
    // released once the card-save is confirmed — never actually charged). Any purchase
    // after that (re-subscribing post-cancellation, switching tiers, etc.) charges
    // immediately, no trial.
    const createOrder = user.bogTrialUsed ? createDirectOrder : createTrialOrder;
    const { url } = await createOrder({
      interval,
      userId: user.id,
      email: user.email,
      name: user.name,
      discountPercent,
    });
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('BOG checkout error:', err.message);
    // Status 400 (not 502/503/504) — Cloudflare intercepts those from the origin and
    // replaces the body with its own HTML error page, which broke error reporting
    // during the Quickpay integration, so this mirrors that fix.
    return NextResponse.json({ error: 'checkout_failed', detail: err.message }, { status: 400 });
  }
}
