import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { approved, contentEn } = await req.json();
  const account = await prisma.user.findUnique({ where: { id: session.id }, select: { role: true } });
  if (account?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const data: { approved?: boolean; contentEn?: string | null } = {};
  if (typeof approved === 'boolean') data.approved = approved;
  if (typeof contentEn === 'string') {
    if (contentEn.length > 10000 || /[\u10A0-\u10FF]/.test(contentEn)) return NextResponse.json({ error: 'English translation required' }, { status: 400 });
    data.contentEn = contentEn.trim() || null;
  }
  const testimonial = await prisma.testimonial.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(testimonial);
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.testimonial.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
