import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chargeSavedCard, BillingInterval } from '@/lib/bog';

const SECRET = process.env.CRON_SECRET || 'mm2026';

// Charges every BOG-billed subscription (trial or interval renewal) whose
// renewal date has arrived. The actual result (paid/failed) comes back
// asynchronously via the webhook — this endpoint only triggers the charge.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!SECRET || secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const due = await prisma.user.findMany({
    where: {
      bogParentOrderId: { not: null },
      subscriptionCanceledAt: null,
      subscriptionStatus: { in: ['RECIPE_PLAN', 'FULL_PLAN'] },
      subscriptionRenewsAt: { lte: new Date() },
    },
  });

  const results = { charged: 0, failed: 0 };
  for (const user of due) {
    if (!user.bogParentOrderId) continue;
    try {
      await chargeSavedCard({
        parentOrderId: user.bogParentOrderId,
        interval: (user.billingIntervalMonths ?? 1) as BillingInterval,
        userId: user.id,
      });
      results.charged++;
    } catch (err: any) {
      console.error('BOG renewal charge failed to initiate:', user.id, err.message);
      results.failed++;
    }
  }

  return NextResponse.json({ due: due.length, ...results });
}
