import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redeemReferralCode } from '@/lib/referral';
import { NextResponse } from 'next/server';

const ERROR_MESSAGES: Record<string, string> = {
  not_found: 'ასეთი პრომოკოდი ვერ მოიძებნა.',
  self: 'საკუთარი პრომოკოდის გამოყენება შეუძლებელია.',
  already_used: 'თქვენ უკვე გაქტიურებული გაქვთ სხვის პრომოკოდი — ცვლილება შეუძლებელია.',
  already_paid: 'პრომოკოდის გააქტიურება შესაძლებელია მხოლოდ პირველი გამოწერის დაწყებამდე.',
};

// POST /api/referral/redeem { code } — the one place a friend's code ever gets attached
// to this account. See lib/referral.redeemReferralCode for the permanence/self-referral
// guards; this route only translates the result into a Georgian-facing response.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const code = typeof body?.code === 'string' ? body.code.trim() : '';
  if (!code) return NextResponse.json({ error: 'code_required', message: 'შეიყვანეთ პრომოკოდი.' }, { status: 400 });

  const result = await redeemReferralCode(session.id, code);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, message: ERROR_MESSAGES[result.error] }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
