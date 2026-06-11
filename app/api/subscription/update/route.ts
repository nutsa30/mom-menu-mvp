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

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { plan, promoCode } = body;

  if (!plan || !["FREE", "RECIPE_PLAN", "FULL_PLAN"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  let promoCodeId: string | undefined;

  if (promoCode) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: promoCode.trim().toUpperCase() },
      include: { _count: { select: { users: true } } },
    });
    if (
      promo &&
      promo.isActive &&
      promo.planType === plan &&
      (promo.maxUses === null || promo._count.users < promo.maxUses)
    ) {
      promoCodeId = promo.id;
    }
  }

  const startDate = new Date();

  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      subscriptionStatus: plan,
      subscriptionStartedAt: plan === "FREE" ? null : startDate,
      subscriptionCanceledAt: null,
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
