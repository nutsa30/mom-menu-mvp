import { NextRequest, NextResponse } from 'next/server';

const APP_ID   = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!;
const REST_KEY = process.env.ONESIGNAL_REST_API_KEY!;
const SECRET   = process.env.CRON_SECRET ?? '';

// Georgia Standard Time = UTC+4, no DST
function geoHour() { return (new Date().getUTCHours() + 4) % 24; }
function geoDay()  {
  const ms = Date.now() + 4 * 3600_000;
  return new Date(ms).getUTCDay(); // 0=კვირა
}

const MSGS = {
  breakfast: [
    { title: '☀️ საუზმის დრო!',    body: 'დილა მშვიდობისა! პატარა საუზმის მოლოდინშია — დღევანდელი მენიუ გაქვს?' },
    { title: '🥣 გუდ მორნინგ!',    body: 'საუზმე ყველაზე მნიშვნელოვანი კვებაა. MomMenu-ზე ახალი იდეები გელოდება.' },
    { title: '☀️ საუზმის დრო!',    body: 'ჯანსაღი საუზმე — ბედნიერი პატარა! MomMenu-ზე შეამოწმე.' },
  ],
  lunch: [
    { title: '🍽️ სადილის დრო!',   body: 'სადილი დადგა! პატარასთვის ახალი რეცეპტი MomMenu-ზე გელოდება.' },
    { title: '🥗 სადილი!',         body: 'შუადღე — სადილის დრო! MomMenu-ზე კვების გეგმა შეამოწმე.' },
    { title: '🍽️ სადილის დრო!',   body: 'ჯანსაღი სადილი — ბედნიერი ბავშვი. დღეს რას გააჭამ პატარას?' },
  ],
  snack: [
    { title: '🍎 სნექ-ტაიმი!',     body: 'შუადღის მცირე საჭმლის დრო! ჯანსაღი სნექი — MomMenu-ზე ნახე.' },
    { title: '🥕 შუადღის საჭმელი!', body: 'პატარა მშიერია? ჯანსაღი სნექის იდეები MomMenu-ზე გელოდება.' },
  ],
  dinner: [
    { title: '🌙 ვახშმის დრო!',    body: 'დღე მიდის — ვახშამი კი გეგმია? MomMenu-ზე ახალი რეცეპტი გელოდება.' },
    { title: '🍲 ვახშამი!',        body: 'ვახშმის დრო! პატარასთვის ბოლო კვება — ჯანსაღი და გემრიელი.' },
    { title: '🌙 ვახშმის დრო!',    body: 'კარგი ვახშამი — კარგი ძილი! MomMenu-ზე ახალი რეცეპტები გელოდება.' },
  ],
  weekly: [
    { title: '📅 კვირის კვების გეგმა!', body: 'ახალი კვირა — ახალი შანსი! მომავალი კვირის კვება MomMenu-ზე დაგეგმე.' },
  ],
};

function pick<T>(arr: T[]): T {
  return arr[new Date().getDate() % arr.length];
}

async function sendNotification(title: string, body: string, url = 'https://mommenu.ge') {
  const res = await fetch('https://onesignal.com/api/v1/notifications', {
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
  return res;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!SECRET || secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hour = geoHour();
  const day  = geoDay();

  let msg: { title: string; body: string } | null = null;
  let url = 'https://mommenu.ge';

  if (day === 0 && hour === 10) {          // კვირა 10:00 — კვირის გეგმა
    msg = pick(MSGS.weekly);
    url = 'https://mommenu.ge/dashboard';
  } else if (hour === 8)  { msg = pick(MSGS.breakfast); }
  else if (hour === 12)   { msg = pick(MSGS.lunch);     }
  else if (hour === 15)   { msg = pick(MSGS.snack);     }
  else if (hour === 18)   { msg = pick(MSGS.dinner);    }

  if (!msg) {
    return NextResponse.json({ skipped: true, hour, day });
  }

  const res  = await sendNotification(msg.title, msg.body, url);
  const data = await res.json().catch(() => ({}));

  return NextResponse.json({ ok: res.ok, hour, day, title: msg.title, onesignal: data });
}
