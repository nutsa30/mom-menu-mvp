import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAgeGroup } from '@/lib/meal';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', message: 'სესია ამოიწურა - გაიარე ავტორიზაცია თავიდან.' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Bad request', message: 'მონაცემები ვერ წაიკითხა. სცადე თავიდან.' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.allergies !== undefined) updateData.allergies = body.allergies;
    if (body.dislikes !== undefined) updateData.dislikes = body.dislikes;
    if (body.likes !== undefined) updateData.likes = body.likes;
    if (body.milkType !== undefined) updateData.milkType = body.milkType;
    if (body.milkStopped !== undefined) updateData.milkStopped = body.milkStopped;
    if (body.textureStage !== undefined) updateData.textureStage = body.textureStage;
    if (body.birthDate !== undefined) {
      const bd = new Date(body.birthDate);
      if (Number.isNaN(bd.getTime())) {
        return NextResponse.json({ error: 'Invalid birthDate', message: 'დაბადების თარიღი არასწორია. შეიყვანე დღე, თვე და წელი სრულად.' }, { status: 400 });
      }
      if (bd.getTime() > Date.now()) {
        return NextResponse.json({ error: 'Invalid birthDate', message: 'დაბადების თარიღი მომავალში ვერ იქნება.' }, { status: 400 });
      }
      updateData.birthDate = bd;
      updateData.ageGroup = getAgeGroup(bd);
    }

    const child = await prisma.child.updateMany({
      where: { id: params.id, userId: session.id },
      data: updateData,
    });

    if (child.count === 0) {
      return NextResponse.json({ error: 'Not found', message: 'ბავშვი ვერ მოიძებნა.' }, { status: 404 });
    }

    const updated = await prisma.child.findUnique({ where: { id: params.id } });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/children/[id] failed', err);
    return NextResponse.json({ error: 'Server error', message: 'სერვერზე შეცდომა მოხდა. სცადე თავიდან.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.child.deleteMany({ where: { id: params.id, userId: session.id } });
  return NextResponse.json({ success: true });
}
