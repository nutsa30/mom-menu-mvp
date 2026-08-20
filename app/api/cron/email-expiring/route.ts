import { prisma } from "@/lib/prisma";
import { sendSubscriptionExpiringEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.CRON_SECRET || "mm2026";
const DAY_MS = 24 * 3600_000;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Warn 3 days before the actual next charge (subscriptionRenewsAt is the source of
  // truth the renewal cron itself uses — whether that charge is the end of a 7-day
  // trial or a regular monthly renewal makes no difference here, it's the same field
  // either way). Compare by calendar day in Georgia time, not exact millisecond, so a
  // few hours of cron-run-time drift doesn't cause a day to be skipped or double-sent.
  const nowGeo = new Date(Date.now() + 4 * 3600_000);
  const targetDayGeo = new Date(nowGeo.getTime() + 3 * DAY_MS);
  const targetDateStr = targetDayGeo.toISOString().slice(0, 10); // YYYY-MM-DD

  const users = await prisma.user.findMany({
    where: {
      subscriptionStatus: { in: ["RECIPE_PLAN", "FULL_PLAN"] },
      subscriptionCanceledAt: null,
      subscriptionRenewsAt: { not: null },
    },
    select: { email: true, name: true, subscriptionRenewsAt: true },
  });

  let sent = 0;
  for (const user of users) {
    if (!user.subscriptionRenewsAt) continue;
    const renewsAtGeo = new Date(user.subscriptionRenewsAt.getTime() + 4 * 3600_000);
    if (renewsAtGeo.toISOString().slice(0, 10) !== targetDateStr) continue;

    try {
      await sendSubscriptionExpiringEmail(user.email, user.name);
      sent++;
    } catch {}
  }

  return NextResponse.json({ ok: true, sent, checked: users.length });
}
