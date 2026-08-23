import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Cancels future billing without cutting off access early: subscriptionStatus stays
// FULL_PLAN (or RECIPE_PLAN) so the user keeps whatever they already paid for through
// subscriptionRenewsAt. The bog-renew cron checks subscriptionCanceledAt before charging
// anyone — once it sees this set, it skips the charge and downgrades them to CANCELED
// itself, right when their paid period actually ends, instead of here at cancel-click time.
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || (user.subscriptionStatus !== 'FULL_PLAN' && user.subscriptionStatus !== 'RECIPE_PLAN')) {
    return NextResponse.json({ error: 'no_active_subscription' }, { status: 400 });
  }
  if (user.subscriptionCanceledAt) {
    return NextResponse.json({ success: true, accessUntil: user.subscriptionRenewsAt, alreadyCanceled: true });
  }

  const updated = await prisma.user.update({
    where: { id: session.id },
    data: { subscriptionCanceledAt: new Date() },
  });

  return NextResponse.json({ success: true, accessUntil: updated.subscriptionRenewsAt });
}
