import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NotificationsClient from './client';

export default async function AdminNotificationsPage() {
  await requireAdmin();
  const [templates, schedule] = await Promise.all([
    prisma.pushTemplate.findMany({ orderBy: [{ mealType: 'asc' }, { sortOrder: 'asc' }] }),
    prisma.pushSchedule.upsert({ where: { id: 'singleton' }, update: {}, create: { id: 'singleton' } }),
  ]);
  return (
    <NotificationsClient
      initial={JSON.parse(JSON.stringify(templates))}
      initialSchedule={JSON.parse(JSON.stringify(schedule))}
    />
  );
}
