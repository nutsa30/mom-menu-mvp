'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ── Settings ─────────────────────────────────────────────────────────────────

export async function updateSettings(data: {
  heroTitleKa: string; heroTitleEn: string;
  heroSubtitleKa: string; heroSubtitleEn: string;
  ctaTitleKa: string; ctaTitleEn: string;
  ctaSubtitleKa: string; ctaSubtitleEn: string;
}) {
  await requireAdmin();
  await prisma.howItWorksSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  });
  revalidatePath('/admin/how-it-works');
  revalidatePath('/how-it-works');
}

// ── Steps ────────────────────────────────────────────────────────────────────

export async function createStep(data: {
  icon: string; titleKa: string; titleEn: string; descKa: string; descEn: string; sortOrder: number;
}) {
  await requireAdmin();
  await prisma.howItWorksStep.create({ data });
  revalidatePath('/admin/how-it-works');
  revalidatePath('/how-it-works');
}

export async function updateStep(id: string, data: {
  icon: string; titleKa: string; titleEn: string; descKa: string; descEn: string; sortOrder: number;
}) {
  await requireAdmin();
  await prisma.howItWorksStep.update({ where: { id }, data });
  revalidatePath('/admin/how-it-works');
  revalidatePath('/how-it-works');
}

export async function deleteStep(id: string) {
  await requireAdmin();
  await prisma.howItWorksStep.delete({ where: { id } });
  revalidatePath('/admin/how-it-works');
  revalidatePath('/how-it-works');
}

// ── FAQs ─────────────────────────────────────────────────────────────────────

export async function createFaq(data: {
  questionKa: string; questionEn: string; answerKa: string; answerEn: string; sortOrder: number;
}) {
  await requireAdmin();
  await prisma.howItWorksFaq.create({ data });
  revalidatePath('/admin/how-it-works');
  revalidatePath('/how-it-works');
}

export async function updateFaq(id: string, data: {
  questionKa: string; questionEn: string; answerKa: string; answerEn: string; sortOrder: number;
}) {
  await requireAdmin();
  await prisma.howItWorksFaq.update({ where: { id }, data });
  revalidatePath('/admin/how-it-works');
  revalidatePath('/how-it-works');
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  await prisma.howItWorksFaq.delete({ where: { id } });
  revalidatePath('/admin/how-it-works');
  revalidatePath('/how-it-works');
}
