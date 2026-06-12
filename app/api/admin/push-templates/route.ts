import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  await requireAdmin();
  const templates = await prisma.pushTemplate.findMany({ orderBy: [{ mealType: 'asc' }, { sortOrder: 'asc' }] });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const { mealType, title, body } = await req.json();
  if (!mealType || !title || !body) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const count = await prisma.pushTemplate.count({ where: { mealType } });
  const t = await prisma.pushTemplate.create({ data: { mealType, title, body, sortOrder: count } });
  return NextResponse.json(t);
}

export async function PUT(req: NextRequest) {
  await requireAdmin();
  const { id, title, body, active } = await req.json();
  const t = await prisma.pushTemplate.update({ where: { id }, data: { title, body, active } });
  return NextResponse.json(t);
}

export async function DELETE(req: NextRequest) {
  await requireAdmin();
  const { id } = await req.json();
  await prisma.pushTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
