import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validTimeZone } from '@/lib/market';
import { oncePerLocalDay } from '@/lib/communication-delivery';
import { sendWeeklyMenuEmail, sendBirthdayEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (process.env.MOMMENU_SANDBOX === '1') return NextResponse.json({ skipped: true, sandbox: true });
  const now = new Date();
  const [users, schedule, templates] = await Promise.all([
    prisma.user.findMany({ where: { market: 'INTL', isBlocked: false }, include: { children: { select: { birthDate: true } } } }),
    prisma.pushSchedule.findUnique({ where: { id: 'singleton' } }),
    prisma.pushTemplate.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
  ]);
  let sent = 0; let failed = 0;
  for (const user of users) {
    const timeZone = validTimeZone(user.timeZone) ? user.timeZone : 'UTC';
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23', weekday: 'short' }).formatToParts(now).map(p => [p.type,p.value]));
    const date = `${parts.year}-${parts.month}-${parts.day}`;
    const hour = Number(parts.hour);
    try {
      if (parts.weekday === 'Sun' && hour === 18 && ['FULL_PLAN','RECIPE_PLAN'].includes(user.subscriptionStatus)) {
        if (await oncePerLocalDay(user.id, 'weekly-email', date, () => sendWeeklyMenuEmail(user.email, user.name))) sent++;
      }
      if (hour === 12 && user.children.some(c => c.birthDate.getUTCMonth()+1 === Number(parts.month) && c.birthDate.getUTCDate() === Number(parts.day) && Number(parts.year) > c.birthDate.getUTCFullYear())) {
        if (await oncePerLocalDay(user.id, 'birthday-email', date, () => sendBirthdayEmail(user.email))) sent++;
      }
      if (!schedule || schedule.paused || !process.env.ONESIGNAL_REST_API_KEY || !process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) continue;
      const kinds = [
        ...(parts.weekday === 'Sun' && hour === schedule.weeklyHour ? ['weekly'] : []),
        ...(['breakfast','lunch','snack','dinner'] as const).filter(kind => hour === schedule[`${kind}Hour`]),
      ];
      for (const kind of kinds) {
        const choices = templates.filter(t => t.mealType === kind);
        const message = choices[Number(parts.day) % choices.length];
        if (!message) continue;
        const english = user.locale === 'en';
        if (english && (!message.titleEn || !message.bodyEn || /[\u10A0-\u10FF]/.test(message.titleEn + message.bodyEn))) continue;
        if (await oncePerLocalDay(user.id, `push-${kind}`, date, async () => {
          const response = await fetch('https://api.onesignal.com/notifications', {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Key ${process.env.ONESIGNAL_REST_API_KEY}` },
            body: JSON.stringify({ app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID, include_aliases: { external_id: [user.id] }, target_channel: 'push', headings: { en: english ? message.titleEn : message.title }, contents: { en: english ? message.bodyEn : message.body }, url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mommenu.ge'}/dashboard?lang=${english ? 'en' : 'ka'}` }),
          });
          if (!response.ok) throw new Error(`Push provider returned ${response.status}`);
        })) sent++;
      }
    } catch { failed++; }
  }
  return NextResponse.json({ sent, failed, checked: users.length }, { status: failed ? 503 : 200 });
}
