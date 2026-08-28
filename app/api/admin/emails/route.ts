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

type Recipient = { email: string; name: string };

function fallbackName(email: string) {
  return email.split("@")[0];
}

async function resolveRecipients(
  audienceType: string,
  audienceFilter?: string,
): Promise<Recipient[]> {
  switch (audienceType) {
    case "all": {
      const users = await prisma.user.findMany({ select: { email: true, name: true } });
      return users.map((u) => ({ email: u.email, name: u.name ?? fallbackName(u.email) }));
    }
    case "active": {
      const users = await prisma.user.findMany({
        where: { subscriptionStatus: { in: ["RECIPE_PLAN", "FULL_PLAN"] } },
        select: { email: true, name: true },
      });
      return users.map((u) => ({ email: u.email, name: u.name ?? fallbackName(u.email) }));
    }
    case "inactive": {
      const users = await prisma.user.findMany({
        where: { subscriptionStatus: "FREE" },
        select: { email: true, name: true },
      });
      return users.map((u) => ({ email: u.email, name: u.name ?? fallbackName(u.email) }));
    }
    case "age_group": {
      const users = await prisma.user.findMany({
        where: { children: { some: { ageGroup: audienceFilter as any } } },
        select: { email: true, name: true },
      });
      return users.map((u) => ({ email: u.email, name: u.name ?? fallbackName(u.email) }));
    }
    default: {
      if (!audienceFilter) return [];
      const emails = audienceFilter.split(",").map((e) => e.trim()).filter(Boolean);
      const dbUsers = await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true, name: true },
      });
      const nameMap = Object.fromEntries(dbUsers.map((u) => [u.email, u.name ?? fallbackName(u.email)]));
      return emails.map((email) => ({ email, name: nameMap[email] ?? fallbackName(email) }));
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
    data: recipients.map(({ email }) => ({
      campaignId: campaign.id,
      email,
      status: "PENDING" as const,
    })),
  });

  const fromLabel = FROM_NAME[senderEmail] ?? "MomMenu";

  // IMPORTANT: resend.emails.send() does NOT throw/reject on an API-level failure (bad
  // address, unverified domain, rate limit, suppression list, etc.) — it resolves with
  // { data: null, error: {...} } instead. A send that Resend genuinely rejected therefore
  // still shows up as "fulfilled" to Promise.allSettled. Checking only `.status ===
  // "fulfilled"` (the old behavior here) counted every one of those as a successful send,
  // which is exactly how a campaign could show 111/111 "SENT" while some recipients never
  // actually got anything — Resend rejected the request and this code never looked.
  //
  // Firing all N requests fully in parallel also makes hitting Resend's own rate limit
  // more likely for a larger recipient list — sending in small batches keeps well under it
  // without depending on any Resend SDK behavior beyond emails.send(), which is already
  // proven to work.
  const BATCH_SIZE = 20;
  const BATCH_DELAY_MS = 600;
  type SendOutcome = { email: string; ok: boolean; messageId: string | null; error: string | null };
  const outcomes: SendOutcome[] = [];

  for (let start = 0; start < recipients.length; start += BATCH_SIZE) {
    const batch = recipients.slice(start, start + BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map(({ email, name }) =>
        resend.emails.send({
          from: `${fromLabel} <${senderEmail}>`,
          to: email,
          subject,
          html: layout(htmlContent.replace(/\{\{name\}\}/g, name)),
        }),
      ),
    );

    for (let i = 0; i < settled.length; i++) {
      const { email } = batch[i];
      const result = settled[i];
      if (result.status === "fulfilled") {
        const { data, error } = result.value as { data: { id: string } | null; error: { message?: string; name?: string } | null };
        if (error) {
          outcomes.push({ email, ok: false, messageId: null, error: error.message ?? error.name ?? "Resend API error" });
        } else {
          outcomes.push({ email, ok: true, messageId: data?.id ?? null, error: null });
        }
      } else {
        const reason = result.reason as any;
        outcomes.push({ email, ok: false, messageId: null, error: reason?.message ?? String(reason) });
      }
    }

    if (start + BATCH_SIZE < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  let sentCount = 0;
  const failedEmails: string[] = [];

  for (const outcome of outcomes) {
    if (outcome.ok) {
      sentCount++;
      await prisma.emailRecipient.updateMany({
        where: { campaignId: campaign.id, email: outcome.email },
        data: { status: "SENT", sentAt: new Date(), resendMessageId: outcome.messageId },
      });
    } else {
      failedEmails.push(outcome.email);
      await prisma.emailRecipient.updateMany({
        where: { campaignId: campaign.id, email: outcome.email },
        data: { status: "FAILED", errorMessage: outcome.error?.slice(0, 500) },
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
