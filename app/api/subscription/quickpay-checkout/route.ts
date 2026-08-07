import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createSubscriptionPayment } from '@/lib/quickpay';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await req.json();
  if (plan !== 'RECIPE_PLAN' && plan !== 'FULL_PLAN') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (user.subscriptionStatus === plan && (user.lsSubscriptionId || user.qpSubscriptionToken)) {
    // Already has this exact plan active on some processor — buying it again would
    // just start a fresh checkout without cancelling the running one.
    return NextResponse.json({ error: 'already_subscribed' }, { status: 400 });
  }

  if (user.subscriptionStatus === 'FULL_PLAN' && plan === 'RECIPE_PLAN') {
    return NextResponse.json({ error: 'downgrade_not_allowed' }, { status: 400 });
  }

  try {
    const url = await createSubscriptionPayment({
      plan,
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('Quickpay checkout error:', err.message);
    return NextResponse.json({ error: 'checkout_failed' }, { status: 502 });
  }
}
