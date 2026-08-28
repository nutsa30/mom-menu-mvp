import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/emails/recipients?subject=... — powers the "select who to send to"
// picker in Email Center. Returns every registered user (email + name), plus, when a
// subject is given, which of those emails already successfully received a campaign with
// that exact subject — so a campaign split across several days (send to some today, the
// rest tomorrow) can show "already sent" instead of risking a duplicate send.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subject = req.nextUrl.searchParams.get("subject")?.trim() ?? "";

  const users = await prisma.user.findMany({
    select: { email: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  let alreadySent: string[] = [];
  if (subject) {
    const rows = await prisma.emailRecipient.findMany({
      where: {
        status: { in: ["SENT", "DELIVERED"] },
        campaign: { subject: { equals: subject, mode: "insensitive" } },
      },
      select: { email: true },
      distinct: ["email"],
    });
    alreadySent = rows.map((r) => r.email);
  }

  return NextResponse.json({
    users: users.map((u) => ({ email: u.email, name: u.name?.trim() || u.email.split("@")[0] })),
    alreadySent,
  });
}
