import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { reverseReferralCreditOnCancel } from '@/lib/referral';
import { NextResponse } from 'next/server';
import type { CancellationReason } from '@prisma/client';

// Kept in sync with the options offered by the cancel-reason modal in
// components/DashboardClient.tsx (CancelReasonModal) and the CancellationReason enum
// in prisma/schema.prisma.
const VALID_REASONS: CancellationReason[] = [
  'PRICE', 'NOT_NEEDED', 'NOT_USED_ENOUGH', 'MISSING_FEATURES', 'DISLIKED_MENU', 'TECHNICAL_ISSUE', 'OTHER',
];

// Cancels future billing without cutting off access early: subscriptionStatus stays
// FULL_PLAN (or RECIPE_PLAN) so the user keeps whatever they already paid for through
// subscriptionRenewsAt. The bog-renew cron checks subscriptionCanceledAt before charging
// anyone — once it sees this set, it skips the charge and downgrades them to CANCELED
// itself, right when their paid period actually ends, instead of here at cancel-click time.
//
// A reason is required — the frontend forces the user through a reason-select step before
// this ever gets called, so admin can later see who canceled and why (app/admin/cancellations).
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const reason = body?.reason as CancellationReason | undefined;
  const reasonText = typeof body?.reasonText === 'string' ? body.reasonText.trim().slice(0, 1000) : '';

  if (!reason || !VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: 'reason_required' }, { status: 400 });
  }
  if (reason === 'OTHER' && !reasonText) {
    return NextResponse.json({ error: 'reason_text_required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || (user.subscriptionStatus !== 'FULL_PLAN' && user.subscriptionStatus !== 'RECIPE_PLAN')) {
    return NextResponse.json({ error: 'no_active_subscription' }, { status: 400 });
  }
  if (user.subscriptionCanceledAt) {
    return NextResponse.json({ success: true, accessUntil: user.subscriptionRenewsAt, alreadyCanceled: true });
  }

  const [updated] = await prisma.$transaction([
    prisma.user.update({
      where: { id: session.id },
      data: { subscriptionCanceledAt: new Date() },
    }),
    prisma.subscriptionCancellation.create({
      data: {
        userId: session.id,
        plan: user.subscriptionStatus,
        reason,
        reasonText: reason === 'OTHER' ? reasonText : (reasonText || null),
      },
    }),
  ]);

  // If this user was themselves a referral, canceling now backs their referrer's 1.70₾
  // out of that referrer's active balance (a no-op if it was never actually earned yet —
  // e.g. canceling during the trial, before any real payment ever happened).
  try {
    await reverseReferralCreditOnCancel(session.id);
  } catch (err: any) {
    console.error('Referral credit reversal on cancel failed', { userId: session.id, error: err.message });
  }

  return NextResponse.json({ success: true, accessUntil: updated.subscriptionRenewsAt });
}
