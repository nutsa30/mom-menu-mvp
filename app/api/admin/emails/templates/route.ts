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

export async function PUT(req: Request) {
  const session = await adminGuard();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key, subjectKa, bodyKa } = await req.json();

  if (!key || !subjectKa?.trim() || !bodyKa?.trim()) {
    return NextResponse.json({ error: "key, subjectKa, bodyKa are required" }, { status: 400 });
  }

  if (!TEMPLATE_KEYS.includes(key)) {
    return NextResponse.json({ error: "Invalid template key" }, { status: 400 });
  }

  const template = await prisma.emailTemplate.update({
    where: { key },
    data: { subjectKa, bodyKa },
  });

  return NextResponse.json(template);
}
