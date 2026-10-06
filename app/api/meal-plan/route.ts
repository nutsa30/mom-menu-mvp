import { paidApiError } from '@/lib/api-access';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const accessError = await paidApiError(true);
  if (accessError) return accessError;
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get('childId');

  if (!childId) {
    return NextResponse.json(
      { error: 'childId is required' },
      { status: 400 }
    );
  }
  const session = await getSession();
  const child = await prisma.child.findFirst({ where: { id: childId, userId: session!.id } });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const latestPlan = await prisma.mealPlan.findFirst({
    where: { childId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          dish: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  });

  return NextResponse.json(latestPlan);
}
