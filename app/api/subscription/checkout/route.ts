import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createCheckout, hasBeenCustomerBefore } from '@/lib/lemonsqueezy';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan, discountCode } = await req.json();
  if (plan !== 'RECIPE_PLAN' && plan !== 'FULL_PLAN') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (user.subscriptionStatus === plan && user.lsSubscriptionId) {
    // Already has this exact plan active — buying it again would just start a fresh
    // 7-day trial and cancel the running subscription, letting a paying customer
    // reset their trial forever instead of ever being charged.
    return NextResponse.json({ error: 'already_subscribed' }, { status: 400 });
  }

  if (user.subscriptionStatus === 'FULL_PLAN' && plan === 'RECIPE_PLAN') {
    // Downgrading isn't a direct switch — cancel Full Plan first (access continues
    // until the paid period ends), then Recipe Plan becomes available once the
    // subscription actually expires and the account drops to FREE.
    return NextResponse.json({ error: 'downgrade_not_allowed' }, { status: 400 });
  }

  try {
    // Skip the trial if: this account has subscribed before, OR this email has ever
    // been a Lemon Squeezy customer of ours (catches someone registering a second
    // account with the same billing email to reset their trial).
    const skipTrial = !!user.subscriptionStartedAt || (await hasBeenCustomerBefore(user.email));

    const url = await createCheckout({
      plan,
      userId: user.id,
      email: user.email,
      name: user.name,
      discountCode: discountCode || undefined,
      skipTrial,
    });
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('Lemon Squeezy checkout error:', err.message);
    return NextResponse.json({ error: 'checkout_failed' }, { status: 502 });
  }
}
