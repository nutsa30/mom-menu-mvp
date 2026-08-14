import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NotificationsClient from './client';

const DEFAULT_SCHEDULE = { paused: false, breakfastHour: 8, lunchHour: 12, snackHour: 15, dinnerHour: 18, weeklyHour: 10 };

export default async function AdminNotificationsPage() {
  await requireAdmin();
  const templates = await prisma.pushTemplate.findMany({
    orderBy: [{ mealType: 'asc' }, { sortOrder: 'asc' }],
  });
  let schedule = DEFAULT_SCHEDULE;
  try {
    schedule = await prisma.pushSchedule.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton' },
    });
  } catch {}
  return (
    <NotificationsClient
      initial={JSON.parse(JSON.stringify(templates))}
      initialSchedule={JSON.parse(JSON.stringify(schedule))}
    />
  );
}
