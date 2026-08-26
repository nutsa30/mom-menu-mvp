import { prisma } from "@/lib/prisma";
import { sendWeeklyMenuEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.CRON_SECRET || "mm2026";

// Georgia Standard Time = UTC+4
function geoHour() { return (new Date().getUTCHours() + 4) % 24; }
function geoDay()  { return new Date(Date.now() + 4 * 3600_000).getUTCDay(); } // 0 = Sunday

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const day = geoDay();
  const hour = geoHour();

  // vercel.json schedules this route exactly once a week (Sunday 14:00 UTC = 18:00
  // Georgia time) — the day check alone is enough to guard against a misconfigured
  // secret being hit manually on the wrong day. The old exact hour===18 check added
  // nothing (there's only one scheduled invocation to begin with) but meant a few
  // minutes of Vercel cron jitter past the hour boundary would silently skip the
  // week's email entirely.
  if (day !== 0) {
    return NextResponse.json({ skipped: true, day, hour });
  }

  const users = await prisma.user.findMany({
    where: { subscriptionStatus: { in: ["RECIPE_PLAN", "FULL_PLAN"] } },
    select: { email: true, name: true },
  });

  let sent = 0;
  for (const user of users) {
    try {
      await sendWeeklyMenuEmail(user.email, user.name);
      sent++;
    } catch {}
  }

  return NextResponse.json({ ok: true, sent });
}
