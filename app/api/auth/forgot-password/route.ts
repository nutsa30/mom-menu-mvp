import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import crypto from "crypto";

const GENERIC = NextResponse.json({
  message: "თუ ეს ელფოსტა რეგისტრირებულია, აღდგენის ბმული გაიგზავნება.",
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return GENERIC;

    // Delete existing unused tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const resetUrl = `https://mommenu.ge/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(email, resetUrl);
  } catch {
    // Swallow errors — always return generic response to prevent enumeration
  }

  return GENERIC;
}
