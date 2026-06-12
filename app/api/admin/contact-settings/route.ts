import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const DEFAULTS = {
  titleKa: 'გვესაუბრე',
  titleEn: 'Talk to us',
  subtitleKa: 'ვმუშაობთ, რომ MomMenu ყოველდღე უკეთესი გახდეს. შენი ხმა მნიშვნელოვანია.',
  subtitleEn: 'We work every day to make MomMenu better. Your voice matters.',
  introKa: 'კითხვა გაქვს? წინადადება? ჩაგვწერე — ვუპასუხებთ 24 საათის განმავლობაში.',
  introEn: 'Have a question or suggestion? Write to us — we respond within 24 hours.',
  email: 'info@mommenu.ge',
  responseTimeKa: '24 საათის განმავლობაში',
  responseTimeEn: 'Within 24 hours',
  workingHoursKa: 'ორშ — პარ, 10:00 – 18:00',
  workingHoursEn: 'Mon – Fri, 10:00 – 18:00',
};

export async function GET() {
  await requireAdmin();
  const s = await prisma.contactSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...DEFAULTS },
    update: {},
  });
  return NextResponse.json(s);
}

export async function PUT(req: NextRequest) {
  await requireAdmin();
  const body = await req.json();
  const s = await prisma.contactSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...DEFAULTS, ...body },
    update: body,
  });
  return NextResponse.json(s);
}
