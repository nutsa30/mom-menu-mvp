import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

function randomPassword(len = 10) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Return success anyway to avoid email enumeration
    return NextResponse.json({ success: true });
  }

  const tempPassword = randomPassword();
  const passwordHash = await hashPassword(tempPassword);
  await prisma.user.update({ where: { email }, data: { passwordHash } });

  await sendEmail(
    email,
    'mom menu â€” áƒ“áƒ áƒáƒ”áƒ‘áƒ˜áƒ—áƒ˜ áƒžáƒáƒ áƒáƒšáƒ˜',
    `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#465940;border-radius:16px;">
      <h2 style="color:#465940;margin-bottom:8px;">mom menu</h2>
      <p style="color:#555;">áƒ¨áƒ”áƒœáƒ˜ áƒ“áƒ áƒáƒ”áƒ‘áƒ˜áƒ—áƒ˜ áƒžáƒáƒ áƒáƒšáƒ˜áƒ:</p>
      <div style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#465940;background:#F4F0EA;padding:16px 24px;border-radius:12px;margin:16px 0;text-align:center;">
        ${tempPassword}
      </div>
      <p style="color:#555;font-size:14px;">áƒ¨áƒ”áƒ¡áƒ•áƒšáƒ˜áƒ¡ áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’ áƒ’áƒ—áƒ®áƒáƒ• áƒ“áƒáƒ£áƒ§áƒáƒ•áƒœáƒ”áƒ‘áƒšáƒ˜áƒ• áƒ¨áƒ”áƒªáƒ•áƒáƒšáƒ áƒžáƒáƒ áƒáƒšáƒ˜.</p>
      <p style="color:#aaa;font-size:12px;margin-top:24px;">áƒ—áƒ£ áƒáƒ› áƒ›áƒáƒ—áƒ®áƒáƒ•áƒœáƒáƒ¡ áƒ•áƒ”áƒ  áƒªáƒœáƒáƒ‘, áƒ£áƒ’áƒ£áƒšáƒ•áƒ”áƒ‘áƒ”áƒšáƒ§áƒáƒ•áƒ˜ áƒ”áƒ¡ áƒ”áƒ›áƒ”áƒ˜áƒšáƒ˜.</p>
    </div>
    `
  );

  return NextResponse.json({ success: true });
}

