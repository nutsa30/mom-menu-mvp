import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTemplate, layout } from '@/lib/email';
import { ENGLISH_EMAILS } from '@/lib/email-en';
import { resend } from '@/lib/resend';
import { money, planPrice } from '@/lib/market';

async function preview(req: NextRequest) {
  const session = await getSession();
  const account = session && await prisma.user.findUnique({ where: { id: session.id }, select: { role: true, email: true } });
  if (!account || account.role !== 'ADMIN') return null;
  const key = req.nextUrl.searchParams.get('key') || 'welcome';
  if (!Object.prototype.hasOwnProperty.call(ENGLISH_EMAILS, key)) throw new Error('Unknown template');
  const locale = req.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'ka';
  const interval = Number(req.nextUrl.searchParams.get('interval') || 1);
  if (interval !== 1 && interval !== 3 && interval !== 6) throw new Error('Invalid interval');
  const market = locale === 'en' ? 'INTL' : 'GE';
  const template = await getTemplate(key, locale);
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://mommenu.ge';
  const start = new Date('2026-10-05T12:00:00Z');
  const end = new Date(start.getTime() + interval * 30 * 86400000);
  const formatDate = (date: Date) => date.toLocaleDateString(locale === 'en' ? 'en-US' : 'ka-GE', { timeZone: 'Asia/Tbilisi', month: 'long', day: 'numeric', year: 'numeric' });
  const variables: Record<string, string> = { name: locale === 'en' ? 'Sample Parent' : 'საცდელი მომხმარებელი', code: '123456', planName: locale === 'en' ? `${interval}-month plan` : `${interval} თვის გეგმა`, amount: money(planPrice(market, interval), market === 'GE' ? 'GEL' : 'USD', locale), startDate: formatDate(start), endDate: formatDate(end), link: `${base}/dashboard?lang=${locale}`, blogTitle: locale === 'en' ? 'A sample article' : 'საცდელი სტატია', blogUrl: `${base}/blog?lang=${locale}`, appUrl: base };
  const body = template.body.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `[${key}]`);
  return { html: layout(body, locale), subject: `[TEST] ${template.subject}`, email: account.email };
}
export async function GET(req: NextRequest) {
  try {
    const result = await preview(req);
    if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ subject: result.subject, html: result.html }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch { return NextResponse.json({ error: 'Invalid preview request' }, { status: 400 }); }
}
export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== req.nextUrl.origin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const result = await preview(req);
  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const response = await resend.emails.send({ from: process.env.RESEND_FROM_EMAIL || 'MomMenu <info@mommenu.ge>', to: result.email, subject: result.subject, html: result.html });
  return NextResponse.json({ success: !response.error, sandbox: process.env.MOMMENU_SANDBOX === '1' });
}
