import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import PromoAdminClient from './PromoAdminClient';

export default async function PromoAdminPage() {
  await requireAdmin();

  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { users: true } } },
  });

  return <PromoAdminClient codes={codes as any} />;
}
