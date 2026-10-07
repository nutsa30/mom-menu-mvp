import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orderId = new URL(req.url).searchParams.get('orderId');
  if (!orderId || orderId.length > 200) return NextResponse.json({ error: 'Invalid order' }, { status: 400 });
  const payment = await prisma.payment.findFirst({
    where: { userId: session.id, bogOrderId: orderId, status: 'SUCCESS' },
    select: { bogOrderId: true, grossAmount: true, currency: true, billingIntervalMonths: true },
  });
  // A bank redirect is not proof of payment. Only a verified callback writes SUCCESS.
  return NextResponse.json(payment ? {
    transaction_id: payment.bogOrderId, value: payment.grossAmount, currency: payment.currency,
    items: [{ item_id: `plan_${payment.billingIntervalMonths || 1}m`, item_name: `${payment.billingIntervalMonths || 1}-month plan`, price: payment.grossAmount, quantity: 1 }],
  } : { pending: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
