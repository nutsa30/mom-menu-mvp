'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateHomePage(data: Record<string, string | number | null>) {
  await requireAdmin();
  // Convert sale price fields: empty string → null, non-empty string → integer
  const salePriceFields = ['plan1SalePrice', 'plan2SalePrice'];
  const cleaned = { ...data };
  for (const field of salePriceFields) {
    if (field in cleaned) {
      const val = cleaned[field];
      cleaned[field] = val === '' || val === null || val === undefined
        ? null
        : parseInt(String(val), 10) || null;
    }
  }
  await prisma.homePageSettings.upsert({
    where: { id: 'singleton' },
    update: cleaned as any,
    create: { id: 'singleton', ...(cleaned as any) },
  });
  revalidatePath('/');
  revalidatePath('/admin/homepage');
}
