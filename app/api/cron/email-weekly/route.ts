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

  // Only on Sunday at 18:00 Georgia time
  if (day !== 0 || hour !== 18) {
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
