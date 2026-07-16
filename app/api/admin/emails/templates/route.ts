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
];

async function adminGuard() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await adminGuard();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ensure all 4 templates exist in DB (create defaults if missing)
  await Promise.all(
    TEMPLATE_KEYS.map((key) =>
      prisma.emailTemplate.upsert({
        where: { key },
        create: {
          key,
          subjectKa: TEMPLATE_DEFAULTS[key].subject,
          subjectEn: TEMPLATE_DEFAULTS[key].subject,
          bodyKa: TEMPLATE_DEFAULTS[key].body,
          bodyEn: TEMPLATE_DEFAULTS[key].body,
        },
        update: {},
      }),
    ),
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
