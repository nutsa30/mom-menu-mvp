import { prisma } from '@/lib/prisma';
import { getSession, clearAuthCookie } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { CancellationReason } from '@prisma/client';

// Kept in sync with the options offered by the reason modal in components/DashboardClient.tsx
// (DeleteAccountReasonModal), the CancellationReason enum in schema.prisma, and the same list
// used by app/subscription/cancel/route.ts — one shared reason vocabulary for both "canceled
// the subscription" and "deleted the whole account".
const VALID_REASONS: CancellationReason[] = [
  'PRICE', 'NOT_NEEDED', 'NOT_USED_ENOUGH', 'MISSING_FEATURES', 'DISLIKED_MENU', 'TECHNICAL_ISSUE', 'WANT_DIFFERENT_PLAN', 'OTHER',
];

// Self-service account deletion. Cancels whatever subscription is active (the User row
// itself, and with it bogParentOrderId, is removed — so the bog-renew cron can never charge
// this account again) and permanently records the email as trial-used if it was, so
// deleting and re-registering can't be used to farm a second 7-day free trial.
//
// A reason is required, same as /subscription/cancel — the frontend forces a reason-select
// step before this is ever called, so admin can see who deleted their account and why on
// admin/cancellations (tagged there as "ანგარიშის წაშლა", alongside plain cancellations).
//
// Before the User row goes away: this user's own Payment rows are snapshotted
// (deletedUserEmail/deletedUserName) so their revenue/payment history stays visible in admin
// after the row is gone — Payment.userId itself just goes null (see schema.prisma, onDelete:
// SetNull), the Payment rows are never deleted.
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
  if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { userId: user.id },
      data: { deletedUserEmail: user.email, deletedUserName: user.name },
    }),
    prisma.accountDeletion.create({
      data: {
        userEmail: user.email,
        userName: user.name,
        plan: user.subscriptionStatus,
        reason,
        reasonText: reason === 'OTHER' ? reasonText : (reasonText || null),
      },
    }),
    ...(user.bogTrialUsed
      ? [prisma.usedTrialEmail.upsert({
          where: { email: user.email },
          create: { email: user.email },
          update: {},
        })]
      : []),
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  await clearAuthCookie();

  return NextResponse.json({ success: true });
}
