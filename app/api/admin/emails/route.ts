import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { layout } from "@/lib/email";
import { NextResponse } from "next/server";

// A campaign send can take a while now that it's paced to stay under Resend's rate
// limit (see below) — ask Vercel for the most runtime it'll give a serverless function.
// On the Hobby plan this is capped at 60s regardless; Pro/Enterprise allow more.
export const maxDuration = 60;

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
  // { data: null, error: {...} } instead. Always check `.error`, never trust "fulfilled"
  // alone — that's exactly how a campaign could once show 111/111 "SENT" while some
  // recipients never actually got anything.
  //
  // Sending in parallel (even in small batches of ~20) massively exceeds Resend's actual
  // rate limit (2 requests/second by default) and produces a wave of genuine "Too many
  // requests" failures — confirmed live on this account. So this sends one email at a
  // time, paced well under that limit, and retries a request specifically a few times
  // with backoff if — and only if — it failed because of rate limiting (a bad address or
  // any other real rejection fails immediately, no point retrying that).
  const SEND_DELAY_MS = 600; // ~1.6 req/sec — safely under Resend's 2 req/sec default
  const MAX_RATE_LIMIT_RETRIES = 3;

  function isRateLimitError(err: any): boolean {
    const text = String(err?.message ?? err?.name ?? "").toLowerCase();
    return text.includes("rate limit") || text.includes("too many request");
  }

  let sentCount = 0;
  const failedEmails: string[] = [];

  for (let i = 0; i < recipients.length; i++) {
    const { email, name } = recipients[i];
    const html = layout(htmlContent.replace(/\{\{name\}\}/g, name));
    let outcome: { ok: boolean; messageId: string | null; error: string | null } | null = null;

    for (let attempt = 0; outcome === null; attempt++) {
      try {
        const { data, error } = await resend.emails.send({
          from: `${fromLabel} <${senderEmail}>`,
          to: email,
          subject,
          html,
        });
        if (!error) {
          outcome = { ok: true, messageId: data?.id ?? null, error: null };
        } else if (isRateLimitError(error) && attempt < MAX_RATE_LIMIT_RETRIES) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1))); // 1s, 2s, 3s backoff
        } else {
          outcome = { ok: false, messageId: null, error: error.message ?? error.name ?? "Resend API error" };
        }
      } catch (err: any) {
        if (isRateLimitError(err) && attempt < MAX_RATE_LIMIT_RETRIES) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        } else {
          outcome = { ok: false, messageId: null, error: err?.message ?? String(err) };
        }
      }
    }

    // Write this recipient's result immediately (not batched at the end) — if a very
    // large audience means this function runs out of time before finishing the loop,
    // whatever was already processed still has an accurate status instead of being lost.
    if (outcome.ok) {
      sentCount++;
      await prisma.emailRecipient.updateMany({
        where: { campaignId: campaign.id, email },
        data: { status: "SENT", sentAt: new Date(), resendMessageId: outcome.messageId },
      });
    } else {
      failedEmails.push(email);
      await prisma.emailRecipient.updateMany({
        where: { campaignId: campaign.id, email },
        data: { status: "FAILED", errorMessage: outcome.error?.slice(0, 500) },
      });
    }

    if (i < recipients.length - 1) {
      await new Promise((r) => setTimeout(r, SEND_DELAY_MS));
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
