import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAgeGroup } from '@/lib/meal';

const SECRET = process.env.CRON_SECRET || 'mm2026';

// Child.ageGroup is a stored field, computed once from birthDate at creation/edit time —
// nothing ever recomputes it as the child actually ages, so a baby saved as FROM_6 would
// stay tagged FROM_6 forever (never "graduating" into age-appropriate meal plans/recipes)
// unless a parent happened to re-save the birthDate. This runs daily and brings every
// child's stored ageGroup back in sync with their real current age.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!SECRET || secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const children = await prisma.child.findMany({ select: { id: true, birthDate: true, ageGroup: true } });

  let updated = 0;
  for (const child of children) {
    const correct = getAgeGroup(child.birthDate);
    if (correct !== child.ageGroup) {
      await prisma.child.update({ where: { id: child.id }, data: { ageGroup: correct } });
      updated++;
    }
  }

  return NextResponse.json({ checked: children.length, updated });
}
