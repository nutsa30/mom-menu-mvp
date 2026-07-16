import { prisma } from "@/lib/prisma";
import { sendSubscriptionExpiringEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.CRON_SECRET || "mm2026";
const DAY_MS = 24 * 3600_000;
const TRIAL_DAYS = 7;   // free trial before first payment
const CYCLE_DAYS = 30;  // recurring payment every 30 days

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = Date.now();

  const users = await prisma.user.findMany({
    where: {
      subscriptionStatus: { in: ["RECIPE_PLAN", "FULL_PLAN"] },
      subscriptionStartedAt: { not: null },
    },
    select: { email: true, name: true, subscriptionStartedAt: true },
  });

  let sent = 0;
  for (const user of users) {
    if (!user.subscriptionStartedAt) continue;

    // First payment happened TRIAL_DAYS after activation
    const firstPaymentMs = user.subscriptionStartedAt.getTime() + TRIAL_DAYS * DAY_MS;
    const daysSinceFirstPayment = Math.floor((now - firstPaymentMs) / DAY_MS);

    // Still in free trial — no payment yet
    if (daysSinceFirstPayment < 0) continue;

    // Which day of the current 30-day cycle (0–29)?
    const dayInCycle = daysSinceFirstPayment % CYCLE_DAYS;

    // Send warning email 3 days before renewal (day 27 of each cycle)
    if (dayInCycle !== CYCLE_DAYS - 3) continue;

    try {
      await sendSubscriptionExpiringEmail(user.email, user.name);
      sent++;
    } catch {}
  }

  return NextResponse.json({ ok: true, sent, checked: users.length });
}
