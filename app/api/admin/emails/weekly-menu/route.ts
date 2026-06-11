import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { layout } from "@/lib/email";
import { NextResponse } from "next/server";

const WEEKLY_MENU_SUBJECT = "🗓 თქვენი კვირის კვების გეგმა მზადაა!";

const WEEKLY_MENU_BODY = `
  <h2 style="margin:0 0 16px;font-size:22px;font-weight:800;">🗓 კვირის კვების გეგმა მზადაა!</h2>
  <p style="margin:0 0 14px;font-size:15px;line-height:1.7;">
    გამარჯობა! ახალი კვირა დაიწყო და თქვენი ბავშვის კვების გეგმა განახლდა.
  </p>
  <p style="margin:0 0 28px;font-size:15px;line-height:1.7;">
    შედით პირად კაბინეტში, რომ ნახოთ კვირის სრული მენიუ, რეცეპტები და საყიდლების სია.
  </p>
  <div style="text-align:center;margin:28px 0;">
    <a href="https://mommenu.ge/dashboard" style="display:inline-block;background:#465940;color:#FDFBF0;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;">
      კვების გეგმის ნახვა →
    </a>
  </div>
  <p style="margin:0;font-size:13px;color:#888;text-align:center;">
    კარგი კვირა გისურვებთ! 🌿
  </p>
`;

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeUsers = await prisma.user.findMany({
    where: { subscriptionStatus: { in: ["RECIPE_PLAN", "FULL_PLAN"] } },
    select: { email: true },
  });

  if (activeUsers.length === 0) {
    return NextResponse.json({ error: "No active subscribers found" }, { status: 400 });
  }

  const recipients = activeUsers.map((u) => u.email);
  const wrappedHtml = layout(WEEKLY_MENU_BODY);

  const campaign = await prisma.emailCampaign.create({
    data: {
      subject: WEEKLY_MENU_SUBJECT,
      htmlContent: WEEKLY_MENU_BODY,
      senderEmail: "info@mommenu.ge",
      status: "SENDING",
      audienceType: "active",
      recipientCount: recipients.length,
    },
  });

  await prisma.emailRecipient.createMany({
    data: recipients.map((email) => ({
      campaignId: campaign.id,
      email,
      status: "PENDING" as const,
    })),
  });

  const results = await Promise.allSettled(
    recipients.map((email) =>
      resend.emails.send({
        from: "MomMenu <info@mommenu.ge>",
        to: email,
        subject: WEEKLY_MENU_SUBJECT,
        html: wrappedHtml,
      }),
    ),
  );

  let sentCount = 0;
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === "fulfilled") {
      sentCount++;
      await prisma.emailRecipient.updateMany({
        where: { campaignId: campaign.id, email: recipients[i] },
        data: { status: "SENT", sentAt: new Date() },
      });
    } else {
      await prisma.emailRecipient.updateMany({
        where: { campaignId: campaign.id, email: recipients[i] },
        data: { status: "FAILED" },
      });
    }
  }

  await prisma.emailCampaign.update({
    where: { id: campaign.id },
    data: {
      status: sentCount === 0 ? "FAILED" : "SENT",
      sentAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, sent: sentCount, total: recipients.length });
}
