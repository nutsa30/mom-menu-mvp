import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const APP_ID   = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!;
const REST_KEY = process.env.ONESIGNAL_REST_API_KEY!;
const SECRET   = process.env.CRON_SECRET || 'mm2026';

// Georgia Standard Time = UTC+4, no DST
function geoHour() { return (new Date().getUTCHours() + 4) % 24; }
function geoDay()  {
  const ms = Date.now() + 4 * 3600_000;
  return new Date(ms).getUTCDay(); // 0=კვირა
}

async function getMealType(hour: number, day: number): Promise<string | null> {
  const schedule = await prisma.pushSchedule.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
  if (day === 0 && hour === schedule.weeklyHour) return 'weekly';
  if (hour === schedule.breakfastHour) return 'breakfast';
  if (hour === schedule.lunchHour)     return 'lunch';
  if (hour === schedule.snackHour)     return 'snack';
  if (hour === schedule.dinnerHour)    return 'dinner';
  return null;
}

async function sendNotification(title: string, body: string, url = 'https://mommenu.ge') {
  return fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${REST_KEY}`,
    },
    body: JSON.stringify({
      app_id: APP_ID,
      included_segments: ['All'],
      headings: { ka: title, en: title },
      contents: { ka: body,  en: body  },
      url,
      chrome_web_icon: 'https://mommenu.ge/icon-192x192.png',
    }),
  });
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!SECRET || secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hour     = geoHour();
  const day      = geoDay();
  const mealType = await getMealType(hour, day);

  if (!mealType) {
    return NextResponse.json({ skipped: true, hour, day });
  }

  // Load active templates from DB
  const templates = await prisma.pushTemplate.findMany({
    where: { mealType, active: true },
    orderBy: { sortOrder: 'asc' },
  });

  if (templates.length === 0) {
    return NextResponse.json({ skipped: true, reason: 'no active templates', mealType });
  }

  const msg = templates[new Date().getDate() % templates.length];
  const url = mealType === 'weekly' ? 'https://mommenu.ge/dashboard' : 'https://mommenu.ge';

  const res  = await sendNotification(msg.title, msg.body, url);
  const data = await res.json().catch(() => ({}));

  return NextResponse.json({ ok: res.ok, hour, day, mealType, title: msg.title, onesignal: data });
}
