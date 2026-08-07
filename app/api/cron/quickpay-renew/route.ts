import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chargeSubscriptionToken, PLAN_AMOUNTS } from '@/lib/quickpay';

const SECRET = process.env.CRON_SECRET || 'mm2026';

const PLAN_LABELS: Record<string, string> = {
  RECIPE_PLAN: 'MomMenu — რეცეპტების წვდომა (განახლება)',
  FULL_PLAN: 'MomMenu — სრული პაკეტი (განახლება)',
};

// Charges every Quickpay-billed subscription whose renewal date has arrived.
// The actual result (paid/failed) comes back asynchronously via the webhook —
// this endpoint only triggers the charge.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!SECRET || secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const due = await prisma.user.findMany({
    where: {
      qpSubscriptionToken: { not: null },
      subscriptionCanceledAt: null,
      subscriptionStatus: { in: ['RECIPE_PLAN', 'FULL_PLAN'] },
      subscriptionRenewsAt: { lte: new Date() },
    },
  });

  const results = { charged: 0, failed: 0 };
  for (const user of due) {
    const amount = PLAN_AMOUNTS[user.subscriptionStatus as 'RECIPE_PLAN' | 'FULL_PLAN'];
    if (!amount || !user.qpSubscriptionToken) continue;
    try {
      await chargeSubscriptionToken(user.qpSubscriptionToken, {
        amount,
        description: PLAN_LABELS[user.subscriptionStatus],
      });
      results.charged++;
    } catch (err: any) {
      console.error('Quickpay renewal charge failed to initiate:', user.id, err.message);
      results.failed++;
    }
  }

  return NextResponse.json({ due: due.length, ...results });
}
