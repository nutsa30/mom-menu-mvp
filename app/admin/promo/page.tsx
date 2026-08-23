import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { PLAN_AMOUNTS, PLAN_AMOUNTS_BY_INTERVAL } from '@/lib/bog';
import PromoAdminClient from './PromoAdminClient';

export default async function PromoAdminPage() {
  await requireAdmin();

  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { users: true } } },
  });

  const planAmounts = {
    RECIPE_PLAN: Number(PLAN_AMOUNTS.RECIPE_PLAN ?? 15),
    intervals: {
      1: Number(PLAN_AMOUNTS_BY_INTERVAL[1] ?? 17),
      3: Number(PLAN_AMOUNTS_BY_INTERVAL[3] ?? 39),
      6: Number(PLAN_AMOUNTS_BY_INTERVAL[6] ?? 59),
    },
  };

  return <PromoAdminClient codes={codes as any} planAmounts={planAmounts} />;
}
