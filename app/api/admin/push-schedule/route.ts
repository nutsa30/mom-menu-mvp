import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  await requireAdmin();
  const schedule = await prisma.pushSchedule.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
  return NextResponse.json(schedule);
}

export async function PUT(req: NextRequest) {
  await requireAdmin();
  const { breakfastHour, lunchHour, snackHour, dinnerHour, weeklyHour } = await req.json();
  const schedule = await prisma.pushSchedule.upsert({
    where: { id: 'singleton' },
    update: { breakfastHour, lunchHour, snackHour, dinnerHour, weeklyHour },
    create: { id: 'singleton', breakfastHour, lunchHour, snackHour, dinnerHour, weeklyHour },
  });
  return NextResponse.json(schedule);
}
