import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const plan = await prisma.mealPlan.create({
    data: {
      titleKa: body.titleKa,
      titleEn: body.titleEn,
      ageGroup: body.ageGroup,
      dayOffset: Number(body.dayOffset ?? 0),
      isActive: true,
      items: body.items?.length
        ? {
            create: body.items.map((item: any, i: number) => ({
              dishId: item.dishId,
              mealType: item.mealType,
              sortOrder: i + 1,
            })),
          }
        : undefined,
    },
    include: { items: { include: { dish: true }, orderBy: { sortOrder: 'asc' } } },
  });
  return NextResponse.json(plan);
}

export async function GET() {
  try {
    const plans = await prisma.mealPlan.findMany({
      where: { isActive: true },
      include: { items: { include: { dish: true } } },
      orderBy: { dayOffset: 'asc' },
    });
    return NextResponse.json(plans);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch meal plans' }, { status: 500 });
  }
}
