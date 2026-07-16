import { prisma } from "@/lib/prisma";
import { sendSubscriptionExpiringEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.CRON_SECRET || "mm2026";
const DAY_MS = 24 * 3600_000;
const TRIAL_DAYS = 7; // free trial days before first payment

// Georgia Standard Time = UTC+4
function geoDate(offsetDays = 0): Date {
  return new Date(Date.now() + 4 * 3600_000 + offsetDays * DAY_MS);
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // "3 days from now" in Georgia time — this is the day we're warning about
  const warningTargetDay = geoDate(3).getUTCDate(); // e.g. 14

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

    const firstPaymentDate = new Date(user.subscriptionStartedAt.getTime() + TRIAL_DAYS * DAY_MS);

    // Still in free trial — skip
    if (Date.now() < firstPaymentDate.getTime()) continue;

    // Renewal happens every month on the same day as first payment
    const renewalDay = new Date(firstPaymentDate.getTime() + 4 * 3600_000).getUTCDate();

    // Send warning email when today + 3 days = renewal day
    if (warningTargetDay !== renewalDay) continue;

    try {
      await sendSubscriptionExpiringEmail(user.email, user.name);
      sent++;
    } catch {}
  }

  return NextResponse.json({ ok: true, sent, checked: users.length });
}
