import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { TEMPLATE_DEFAULTS } from "@/lib/email";
import { NextResponse } from "next/server";

const TEMPLATE_KEYS = [
  "welcome",
  "subscription_confirmed",
  "subscription_expiring",
  "password_reset",
  "password_changed",
  "weekly_menu",
  "new_blog",
  "birthday_wish",
];

// Only periodic/broadcast reminders can be switched off from the admin UI — these are the
// only keys lib/email.ts's send functions actually check `enabled` for. Account-critical
// transactional emails (welcome, password reset/changed, subscription confirmed) are left
// out on purpose: silently turning those off would break signup/password-recovery/payment
// confirmation instead of just skipping a nice-to-have reminder.
const DISABLEABLE_KEYS = ["subscription_expiring", "weekly_menu", "new_blog", "birthday_wish"];

async function adminGuard() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await adminGuard();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ensure all templates exist in DB; reset stale (short) content to current defaults
  await Promise.all(
    TEMPLATE_KEYS.map(async (key) => {
      const defaults = TEMPLATE_DEFAULTS[key];
      if (!defaults) return;
      const existing = await prisma.emailTemplate.findUnique({ where: { key } });
      if (!existing) {
        return prisma.emailTemplate.create({
          data: {
            key,
            subjectKa: defaults.subject,
            subjectEn: defaults.subject,
            bodyKa: defaults.body,
            bodyEn: defaults.body,
          },
        });
      }
      // Reset if stale/short OR if body contains old resetUrl pattern
      const isStale = existing.bodyKa.length < defaults.body.length * 0.5
        || existing.bodyKa.includes('{{resetUrl}}')
        || existing.bodyKa.includes('resetUrl');
      if (isStale) {
        return prisma.emailTemplate.update({
          where: { key },
          data: { subjectKa: defaults.subject, bodyKa: defaults.body },
        });
      }
    }),
  );

  const templates = await prisma.emailTemplate.findMany({
    where: { key: { in: TEMPLATE_KEYS } },
    orderBy: { key: "asc" },
  });

  return NextResponse.json(templates);
}

// Content edits (subjectKa+bodyKa together) and the on/off toggle (enabled alone) both go
// through this one PUT — pass whichever of the two you're changing.
export async function PUT(req: Request) {
  const session = await adminGuard();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key, subjectKa, bodyKa, enabled } = await req.json();

  if (!key || !TEMPLATE_KEYS.includes(key)) {
    return NextResponse.json({ error: "Invalid template key" }, { status: 400 });
  }

  const data: { subjectKa?: string; bodyKa?: string; enabled?: boolean } = {};

  if (subjectKa !== undefined || bodyKa !== undefined) {
    if (!subjectKa?.trim() || !bodyKa?.trim()) {
      return NextResponse.json({ error: "subjectKa and bodyKa are required together" }, { status: 400 });
    }
    data.subjectKa = subjectKa;
    data.bodyKa = bodyKa;
  }

  if (typeof enabled === "boolean") {
    if (!DISABLEABLE_KEYS.includes(key)) {
      return NextResponse.json({ error: "This template can't be turned off" }, { status: 400 });
    }
    data.enabled = enabled;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const template = await prisma.emailTemplate.update({ where: { key }, data });

  return NextResponse.json(template);
}
