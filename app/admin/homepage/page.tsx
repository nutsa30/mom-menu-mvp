import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import HomepageAdminClient from './HomepageAdminClient';

export default async function HomepageAdminPage() {
  await requireAdmin();

  // Always upsert so Prisma fills in @default values on first visit
  const raw = await prisma.homePageSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {},
  });

  const { updatedAt, id, ...settings } = raw;

  return <HomepageAdminClient settings={settings as any} />;
}
