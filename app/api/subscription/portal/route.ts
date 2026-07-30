import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getSubscriptionPortalUrl } from '@/lib/lemonsqueezy';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user?.lsSubscriptionId) {
    return NextResponse.json({ error: 'no_subscription' }, { status: 404 });
  }

  try {
    const url = await getSubscriptionPortalUrl(user.lsSubscriptionId);
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('Lemon Squeezy portal error:', err.message);
    return NextResponse.json({ error: 'portal_failed' }, { status: 502 });
  }
}
