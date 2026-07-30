import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";
import { NextResponse } from "next/server";

const PLAN_LABELS: Record<string, string> = {
  RECIPE_PLAN: "რეცეპტების წვდომა",
  FULL_PLAN: "სრული პაკეტი",
};

const PLAN_PRICES: Record<string, number> = {
  RECIPE_PLAN: 15,
  FULL_PLAN: 30,
};

// This endpoint no longer grants paid plans directly — real purchases go through
// /api/subscription/checkout (Lemon Squeezy). It only handles: (1) a valid gift/promo
// code activating a plan for free, and (2) downgrading to FREE for accounts that were
// never billed (gifted/promo access). Paying subscribers must cancel via the Lemon
// Squeezy customer portal (/api/subscription/portal) so their real billing actually stops.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { plan, promoCode } = body;

  if (!plan || !["FREE", "RECIPE_PLAN", "FULL_PLAN"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id: session.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing.lsSubscriptionId) {
    return NextResponse.json({ error: "use_portal" }, { status: 409 });
  }

  let promoCodeId: string | undefined;

  if (plan !== "FREE") {
    if (!promoCode) {
      return NextResponse.json({ error: "promo_required" }, { status: 400 });
    }
    const promo = await prisma.promoCode.findUnique({
      where: { code: promoCode.trim().toUpperCase() },
      include: { _count: { select: { users: true } } },
    });
    if (
      !promo ||
      !promo.isActive ||
      promo.planType !== plan ||
      (promo.maxUses !== null && promo._count.users >= promo.maxUses)
    ) {
      return NextResponse.json({ error: "invalid_promo" }, { status: 400 });
    }
    promoCodeId = promo.id;
  }

  const startDate = new Date();

  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      subscriptionStatus: plan,
      subscriptionStartedAt: plan === "FREE" ? null : startDate,
      subscriptionCanceledAt: null,
      isGifted: plan !== "FREE",
      ...(promoCodeId && { promoCodeId }),
    },
  });

  if (plan !== "FREE") {
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    sendSubscriptionConfirmationEmail(
      user.email,
      user.name,
      PLAN_LABELS[plan],
      PLAN_PRICES[plan],
      startDate,
      endDate,
    ).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
