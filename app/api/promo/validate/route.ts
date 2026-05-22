import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { code, plan } = await req.json();
  if (!code || !plan) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { _count: { select: { users: true } } },
  });

  if (!promo || !promo.isActive)
    return NextResponse.json({ error: 'invalid' }, { status: 404 });

  if (promo.planType !== plan)
    return NextResponse.json({ error: 'wrong_plan' }, { status: 400 });

  if (promo.maxUses !== null && promo._count.users >= promo.maxUses)
    return NextResponse.json({ error: 'limit_reached' }, { status: 400 });

  return NextResponse.json({
    valid: true,
    discountPercent: promo.discountPercent,
    planType: promo.planType,
  });
}
