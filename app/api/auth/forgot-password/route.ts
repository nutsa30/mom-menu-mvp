import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import crypto from "crypto";

const GENERIC = NextResponse.json({
  message: "თუ ეს ელფოსტა რეგისტრირებულია, კოდი გაიგზავნება.",
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return GENERIC;

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const tokenHash = crypto.createHash("sha256").update(user.id + ":" + code).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    await sendPasswordResetEmail(email, code);
  } catch {
    // Swallow errors — always return generic response
  }

  return GENERIC;
}
