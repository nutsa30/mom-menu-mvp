'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function addWithdrawal(formData: FormData) {
  await requireAdmin();
  const amount = Number(formData.get('amount'));
  const noteRaw = String(formData.get('note') ?? '').trim();
  if (!Number.isFinite(amount) || amount <= 0) return;
  await prisma.withdrawal.create({ data: { amount, note: noteRaw || null } });
  revalidatePath('/admin/analytics');
}

export async function deleteWithdrawal(id: string) {
  await requireAdmin();
  await prisma.withdrawal.delete({ where: { id } });
  revalidatePath('/admin/analytics');
}
