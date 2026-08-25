import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { content } = await req.json();
  const text = String(content || '').trim();
  if (!text) return NextResponse.json({ error: 'empty' }, { status: 400 });
  if (text.length > 500) return NextResponse.json({ error: 'too_long' }, { status: 400 });

  const existing = await prisma.testimonial.findFirst({ where: { userId: session.id } });
  if (existing) return NextResponse.json({ error: 'already_submitted' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { name: true } });
  if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await prisma.testimonial.create({
    data: { userId: session.id, authorName: user.name, content: text },
  });

  return NextResponse.json({ success: true });
}
