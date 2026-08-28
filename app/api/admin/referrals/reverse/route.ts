import { getSession } from '@/lib/auth';
import { reverseReferralCreditOnCancel } from '@/lib/referral';
import { NextResponse } from 'next/server';

// POST /api/admin/referrals/reverse { referredUserId }
// Manual escape hatch for the one case the automatic system can't see: a payment that
// got refunded/charged back from OUTSIDE the app (bank dispute, or a refund issued
// directly through BOG rather than the user cancelling from the site). There's no
// webhook wired up for that scenario, so an admin who notices it (via the bank or BOG's
// own dashboard) can reverse the referral credit it generated from here.
//
// Reuses the exact same function the normal-cancellation path calls (lib/referral
// .reverseReferralCreditOnCancel) — same idempotency guard (never double-reverses the
// same referral), same "no-op if nothing was ever actually earned" behavior.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const referredUserId = typeof body?.referredUserId === 'string' ? body.referredUserId : '';
  if (!referredUserId) {
    return NextResponse.json({ error: 'referredUserId required' }, { status: 400 });
  }

  await reverseReferralCreditOnCancel(referredUserId);
  return NextResponse.json({ success: true });
}
