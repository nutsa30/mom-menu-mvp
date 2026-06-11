import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { layout } from "@/lib/email";
import { NextResponse } from "next/server";

async function adminGuard() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

async function resolveRecipients(
  audienceType: string,
  audienceFilter?: string,
): Promise<string[]> {
  switch (audienceType) {
    case "all": {
      const users = await prisma.user.findMany({ select: { email: true } });
      return users.map((u) => u.email);
    }
    case "active": {
      const users = await prisma.user.findMany({
        where: { subscriptionStatus: { in: ["RECIPE_PLAN", "FULL_PLAN"] } },
        select: { email: true },
      });
      return users.map((u) => u.email);
    }
    case "inactive": {
      const users = await prisma.user.findMany({
        where: { subscriptionStatus: "FREE" },
        select: { email: true },
      });
      return users.map((u) => u.email);
    }
    case "age_group": {
      const users = await prisma.user.findMany({
        where: { children: { some: { ageGroup: audienceFilter as any } } },
        select: { email: true },
      });
      return users.map((u) => u.email);
    }
    default: {
      if (!audienceFilter) return [];
      return audienceFilter
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
    }
  }
}

const FROM_NAME: Record<string, string> = {
  "info@mommenu.ge": "MomMenu",
  "support@mommenu.ge": "MomMenu Support",
  "no-reply@mommenu.ge": "MomMenu",
};

export async function GET() {
  const session = await adminGuard();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [campaigns, sent, failed, scheduled, draft] = await Promise.all([
    prisma.emailCampaign.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.emailCampaign.count({ where: { status: "SENT" } }),
    prisma.emailCampaign.count({ where: { status: "FAILED" } }),
    prisma.emailCampaign.count({ where: { status: "SCHEDULED" } }),
    prisma.emailCampaign.count({ where: { status: "DRAFT" } }),
  ]);

  return NextResponse.json({ campaigns, stats: { sent, failed, scheduled, draft } });
}

export async function POST(req: Request) {
  const session = await adminGuard();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    subject,
    htmlContent,
    senderEmail = "info@mommenu.ge",
    action = "send",
    audienceType = "specific",
    audienceFilter,
    scheduledAt,
  } = body;

  if (!subject?.trim() || !htmlContent?.trim()) {
    return NextResponse.json({ error: "Subject and content are required" }, { status: 400 });
  }

  if (action === "draft") {
    const campaign = await prisma.emailCampaign.create({
      data: { subject, htmlContent, senderEmail, status: "DRAFT", audienceType, audienceFilter },
    });
    return NextResponse.json({ success: true, campaign });
  }

  if (action === "schedule") {
    if (!scheduledAt) {
      return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 });
    }
    const campaign = await prisma.emailCampaign.create({
      data: {
        subject,
        htmlContent,
        senderEmail,
        status: "SCHEDULED",
        audienceType,
        audienceFilter,
        scheduledAt: new Date(scheduledAt),
      },
    });
    return NextResponse.json({ success: true, campaign });
  }

  // Send now
  const recipients = await resolveRecipients(audienceType, audienceFilter);
  if (recipients.length === 0) {
    return NextResponse.json({ error: "No recipients found" }, { status: 400 });
  }

  const campaign = await prisma.emailCampaign.create({
    data: {
      subject,
      htmlContent,
      senderEmail,
      status: "SENDING",
      audienceType,
      audienceFilter,
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

  const wrappedHtml = layout(htmlContent);
  const fromLabel = FROM_NAME[senderEmail] ?? "MomMenu";

  const results = await Promise.allSettled(
    recipients.map((email) =>
      resend.emails.send({
        from: `${fromLabel} <${senderEmail}>`,
        to: email,
        subject,
        html: wrappedHtml,
      }),
    ),
  );

  let sentCount = 0;
  const failedEmails: string[] = [];

  for (let i = 0; i < results.length; i++) {
    if (results[i].status === "fulfilled") {
      sentCount++;
      await prisma.emailRecipient.updateMany({
        where: { campaignId: campaign.id, email: recipients[i] },
        data: { status: "SENT", sentAt: new Date() },
      });
    } else {
      failedEmails.push(recipients[i]);
      await prisma.emailRecipient.updateMany({
        where: { campaignId: campaign.id, email: recipients[i] },
        data: { status: "FAILED" },
      });
    }
  }

  const finalStatus =
    sentCount === 0 ? "FAILED" : "SENT";

  await prisma.emailCampaign.update({
    where: { id: campaign.id },
    data: { status: finalStatus, sentAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    campaignId: campaign.id,
    sent: sentCount,
    failed: failedEmails.length,
  });
}
