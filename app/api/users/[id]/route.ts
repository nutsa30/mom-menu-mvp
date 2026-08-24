import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Regular user can only update their own name / email
  if (session.id === params.id) {
    // Check email uniqueness if provided
    if (body.email !== undefined) {
      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing && existing.id !== params.id) {
        return NextResponse.json({ error: 'email_taken' }, { status: 400 });
      }
    }
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
      },
      select: { id: true, name: true, email: true, role: true, isBlocked: true, subscriptionStatus: true },
    });
    return NextResponse.json(user);
  }

  // Admin-only: block/role changes on other users
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Flat day-multiples per interval — same convention as the real BOG billing cycle
  // (lib/webhooks/bog/route.ts's INTERVAL_MS), so a gifted tier expires on the same
  // schedule a real subscription on that tier would.
  const GIFT_INTERVAL_DAYS: Record<number, number> = { 1: 30, 3: 90, 6: 180 };
  const billingIntervalMonths: number | null = body.billingIntervalMonths ?? null;

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(body.isBlocked !== undefined && { isBlocked: body.isBlocked }),
      ...(body.role !== undefined && { role: body.role }),
      ...(body.subscriptionStatus !== undefined && {
        subscriptionStatus: body.subscriptionStatus,
        isGifted: body.isGifted ?? false,
        subscriptionStartedAt: body.subscriptionStatus !== 'FREE' ? new Date() : null,
        subscriptionCanceledAt: body.subscriptionStatus === 'FREE' ? new Date() : null,
        billingIntervalMonths: body.subscriptionStatus !== 'FREE' ? billingIntervalMonths : null,
        subscriptionRenewsAt:
          body.subscriptionStatus !== 'FREE' && billingIntervalMonths
            ? new Date(Date.now() + GIFT_INTERVAL_DAYS[billingIntervalMonths] * 24 * 60 * 60 * 1000)
            : null,
        // A re-gift must never let the bog-renew cron try to charge a real card on file
        // from a previous, unrelated real subscription this account may have had.
        ...(body.isGifted && { bogParentOrderId: null }),
      }),
      // Standalone toggle — corrects a stale "gifted" flag (e.g. left over from an
      // earlier promo grant) without touching the user's actual subscription dates,
      // unlike the bundled subscriptionStatus branch above.
      ...(body.subscriptionStatus === undefined && body.isGifted !== undefined && { isGifted: body.isGifted }),
    },
    select: { id: true, name: true, email: true, role: true, isBlocked: true, subscriptionStatus: true },
  });
  return NextResponse.json(user);
}
