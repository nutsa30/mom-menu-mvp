import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/heartbeat — called once every time the dashboard actually loads (see
// DashboardClient's mount effect). This is the real "is this person using the site"
// signal admin/analytics' active-user counts are built from, instead of subscription
// dates (when someone paid, not when they last opened the app) or dish "ჭამა" votes
// (an optional click most parents skip, so it badly undercounts real usage).
//
// Crucially this fires identically whether the site is open in a normal browser tab or
// launched from a home-screen PWA icon — it's just a plain fetch from client JS to our
// own backend — unlike Google Analytics, which can silently miss standalone PWA sessions.
// Throttled to at most once per ~15 minutes per user so a page full of re-renders/tab
// switches doesn't turn this into a write on every render.
const THROTTLE_MS = 15 * 60 * 1000;

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { lastActiveAt: true } });
  const now = new Date();
  if (!user?.lastActiveAt || now.getTime() - new Date(user.lastActiveAt).getTime() > THROTTLE_MS) {
    await prisma.user.update({ where: { id: session.id }, data: { lastActiveAt: now } });
  }

  return NextResponse.json({ ok: true });
}
