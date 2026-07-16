import { prisma } from "@/lib/prisma";
import { sendSubscriptionExpiringEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.CRON_SECRET || "mm2026";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  // Subscription = 7-day free trial + 30-day paid period = 37 days total.
  // Send "expiring" email 3 days before end → started 34 days ago (±24h window).
  const windowEnd = new Date(now.getTime() - 34 * 24 * 3600_000);
  const windowStart = new Date(now.getTime() - 35 * 24 * 3600_000);

  const users = await prisma.user.findMany({
    where: {
      subscriptionStatus: { in: ["RECIPE_PLAN", "FULL_PLAN"] },
      subscriptionStartedAt: { gte: windowStart, lt: windowEnd },
    },
    select: { email: true, name: true },
  });

  let sent = 0;
  for (const user of users) {
    try {
      await sendSubscriptionExpiringEmail(user.email, user.name);
      sent++;
    } catch {}
  }

  return NextResponse.json({ ok: true, sent, checked: users.length });
}
