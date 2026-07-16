import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendPasswordChangedEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "invalid_code" }, { status: 400 });

    const tokenHash = crypto.createHash("sha256").update(user.id + ":" + code).digest("hex");

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record) return NextResponse.json({ error: "invalid_code" }, { status: 400 });
    if (record.usedAt) return NextResponse.json({ error: "token_used" }, { status: 400 });
    if (record.expiresAt < new Date()) return NextResponse.json({ error: "token_expired" }, { status: 400 });

    await prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    await sendPasswordChangedEmail(record.user.email, record.user.name);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
