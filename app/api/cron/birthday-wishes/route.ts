import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBirthdayEmail } from '@/lib/email';

const SECRET = process.env.CRON_SECRET || 'mm2026';

// Georgia Standard Time = UTC+4, no DST
function geoToday() {
  const d = new Date(Date.now() + 4 * 3600_000);
  return { month: d.getUTCMonth(), date: d.getUTCDate(), year: d.getUTCFullYear() };
}

// Sends the birthday-wish email to a child's parent on the exact calendar day of their
// birthday anniversary — matches month+day against today, and requires at least a full
// year to have passed so a newborn doesn't get "happy birthday'd" the day they're born.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!SECRET || secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { month, date, year } = geoToday();

  const children = await prisma.child.findMany({
    include: { user: { select: { email: true } } },
  });

  const birthdayKids = children.filter((c) => {
    const bd = c.birthDate;
    const sameDay = bd.getUTCMonth() === month && bd.getUTCDate() === date;
    const atLeastOneYear = year - bd.getUTCFullYear() >= 1;
    return sameDay && atLeastOneYear;
  });

  let sent = 0;
  for (const child of birthdayKids) {
    try {
      await sendBirthdayEmail(child.user.email);
      sent++;
    } catch {}
  }

  return NextResponse.json({ checked: children.length, sent });
}
