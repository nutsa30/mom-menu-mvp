'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { SubscriptionStatus } from '@prisma/client';

export async function createPromoCode(data: {
  code: string;
  planType: SubscriptionStatus;
  discountPercent: number;
  maxUses: number | null;
}) {
  await requireAdmin();
  await prisma.promoCode.create({ data });
  revalidatePath('/admin/promo');
  revalidatePath('/admin/users');
}

export async function togglePromoCode(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.promoCode.update({ where: { id }, data: { isActive } });
  revalidatePath('/admin/promo');
}

export async function deletePromoCode(id: string) {
  await requireAdmin();
  await prisma.promoCode.delete({ where: { id } });
  revalidatePath('/admin/promo');
  revalidatePath('/admin/users');
}
