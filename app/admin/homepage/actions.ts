'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateHomePage(data: Record<string, string | number>) {
  await requireAdmin();
  await prisma.homePageSettings.upsert({
    where: { id: 'singleton' },
    update: data as any,
    create: { id: 'singleton', ...(data as any) },
  });
  revalidatePath('/');
  revalidatePath('/admin/homepage');
}
