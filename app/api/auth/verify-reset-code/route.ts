import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "invalid_code" }, { status: 400 });

    const tokenHash = crypto.createHash("sha256").update(user.id + ":" + code).digest("hex");
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record) return NextResponse.json({ error: "invalid_code" }, { status: 400 });
    if (record.usedAt) return NextResponse.json({ error: "token_used" }, { status: 400 });
    if (record.expiresAt < new Date()) return NextResponse.json({ error: "token_expired" }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
