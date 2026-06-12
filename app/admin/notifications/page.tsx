import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NotificationsClient from './client';

export default async function AdminNotificationsPage() {
  await requireAdmin();
  const templates = await prisma.pushTemplate.findMany({
    orderBy: [{ mealType: 'asc' }, { sortOrder: 'asc' }],
  });
  return <NotificationsClient initial={JSON.parse(JSON.stringify(templates))} />;
}
