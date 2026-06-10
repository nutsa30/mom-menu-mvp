import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function getAgeGroup(birthDate: Date) {
  const months =
    (new Date().getFullYear() - birthDate.getFullYear()) * 12 +
    (new Date().getMonth() - birthDate.getMonth());
  if (months < 9) return 'FROM_6';
  if (months < 12) return 'FROM_9';
  if (months < 24) return 'FROM_12';
  return 'FROM_24';
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updateData: Record<string, any> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.allergies !== undefined) updateData.allergies = body.allergies;
  if (body.dislikes !== undefined) updateData.dislikes = body.dislikes;
  if (body.likes !== undefined) updateData.likes = body.likes;
  if (body.milkType !== undefined) updateData.milkType = body.milkType;
  if (body.milkStopped !== undefined) updateData.milkStopped = body.milkStopped;
  if (body.birthDate !== undefined) {
    const bd = new Date(body.birthDate);
    updateData.birthDate = bd;
    updateData.ageGroup = getAgeGroup(bd);
  }

  const child = await prisma.child.updateMany({
    where: { id: params.id, userId: session.id },
    data: updateData,
  });

  if (child.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.child.findUnique({ where: { id: params.id } });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.child.deleteMany({ where: { id: params.id, userId: session.id } });
  return NextResponse.json({ success: true });
}
