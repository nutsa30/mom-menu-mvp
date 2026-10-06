import { NextResponse } from 'next/server';
import { getSession } from './auth';
import { prisma } from './prisma';
import { hasPaidAccess } from './paid-access';

export async function adminWriteError(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const account = await prisma.user.findUnique({ where: { id: session.id }, select: { role: true, isBlocked: true } });
  if (account?.role !== 'ADMIN' || account.isBlocked) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (req.headers.get('origin') !== new URL(req.url).origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  return null;
}

export async function paidApiError(fullOnly = false) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const account = await prisma.user.findUnique({ where: { id: session.id }, select: {
    role: true, subscriptionStatus: true, isBlocked: true, paymentFailedAt: true, subscriptionRenewsAt: true,
  } });
  if (!hasPaidAccess(account, fullOnly)) return NextResponse.json({ error: 'Paid plan required' }, { status: 403 });
  return null;
}
