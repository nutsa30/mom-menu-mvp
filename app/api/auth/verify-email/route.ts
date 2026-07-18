import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setAuthCookie } from '@/lib/auth';

const BASE = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.redirect(`${BASE}/verify-email?error=1`);

  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } });
  if (!user) return NextResponse.redirect(`${BASE}/verify-email?error=1`);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null },
  });

  await setAuthCookie({ id: user.id, email: user.email, name: user.name, role: user.role });

  return NextResponse.redirect(`${BASE}/dashboard?lang=ka&new=1`);
}
