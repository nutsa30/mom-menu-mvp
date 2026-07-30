import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createCheckout } from '@/lib/lemonsqueezy';
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

  try {
    const url = await createCheckout({
      plan,
      userId: user.id,
      email: user.email,
      name: user.name,
      discountCode: discountCode || undefined,
    });
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('Lemon Squeezy checkout error:', err.message);
    return NextResponse.json({ error: 'checkout_failed' }, { status: 502 });
  }
}
