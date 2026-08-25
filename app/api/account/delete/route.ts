import { prisma } from '@/lib/prisma';
import { getSession, clearAuthCookie } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Self-service account deletion. Cancels whatever subscription is active (the User row
// itself, and with it bogParentOrderId, is removed — so the bog-renew cron can never charge
// this account again) and permanently records the email as trial-used if it was, so
// deleting and re-registering can't be used to farm a second 7-day free trial.
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  if (user.bogTrialUsed) {
    await prisma.usedTrialEmail.upsert({
      where: { email: user.email },
      create: { email: user.email },
      update: {},
    });
  }

  await prisma.user.delete({ where: { id: user.id } });
  await clearAuthCookie();

  return NextResponse.json({ success: true });
}
