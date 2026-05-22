import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get('childId');

  if (!childId) {
    return NextResponse.json(
      { error: 'childId is required' },
      { status: 400 }
    );
  }

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