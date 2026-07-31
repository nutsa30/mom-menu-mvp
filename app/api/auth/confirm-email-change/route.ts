import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setAuthCookie } from '@/lib/auth';

const BASE = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.redirect(`${BASE}/verify-email?error=1`);

  const user = await prisma.user.findUnique({ where: { pendingEmailToken: token } });
  if (!user || !user.pendingEmail) return NextResponse.redirect(`${BASE}/verify-email?error=1`);

  // Someone else may have claimed this address while the link was unused
  const taken = await prisma.user.findUnique({ where: { email: user.pendingEmail } });
  if (taken && taken.id !== user.id) {
    await prisma.user.update({ where: { id: user.id }, data: { pendingEmail: null, pendingEmailToken: null } });
    return NextResponse.redirect(`${BASE}/verify-email?error=1`);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { email: user.pendingEmail, pendingEmail: null, pendingEmailToken: null },
  });

  await setAuthCookie({ id: updated.id, email: updated.email, name: updated.name, role: updated.role });

  const dest = updated.role === 'ADMIN' ? '/admin/settings' : '/dashboard';
  return NextResponse.redirect(`${BASE}${dest}?emailChanged=1`);
}
