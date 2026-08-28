import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { layout } from "@/lib/email";
import { NextResponse } from "next/server";

const TEST_RECIPIENTS = ["info@mommenu.ge", "nutsarogava30@gmail.com"];

const FROM_NAME: Record<string, string> = {
  "info@mommenu.ge": "MomMenu",
  "support@mommenu.ge": "MomMenu Support",
  "no-reply@mommenu.ge": "MomMenu Notifications",
};

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, htmlContent, senderEmail = "info@mommenu.ge" } = await req.json();

  if (!subject?.trim() || !htmlContent?.trim()) {
    return NextResponse.json({ error: "Subject and content are required" }, { status: 400 });
  }

  const testSubject = `[TEST] ${subject}`;
  const wrappedHtml = layout(htmlContent);
  const fromLabel = FROM_NAME[senderEmail] ?? "MomMenu";

  const results = await Promise.allSettled(
    TEST_RECIPIENTS.map((email) =>
      resend.emails.send({
        from: `${fromLabel} <${senderEmail}>`,
        to: email,
        subject: testSubject,
        html: wrappedHtml,
      }),
    ),
  );

  // Same fix as the real send path (app/api/admin/emails/route.ts): resend.emails.send()
  // resolves ("fulfilled") even when Resend's API rejected the request — the actual
  // success/failure is in `.value.error`, which the old check here never looked at.
  const anySuccess = results.some(
    (r) => r.status === "fulfilled" && !(r.value as { error: unknown }).error,
  );

  await prisma.emailCampaign.create({
    data: {
      subject: testSubject,
      htmlContent,
      senderEmail,
      status: anySuccess ? "SENT" : "FAILED",
      type: "TEST",
      audienceType: "specific",
      audienceFilter: TEST_RECIPIENTS.join(", "),
      recipientCount: 0,
      sentAt: new Date(),
    },
  });

  if (!anySuccess) {
    return NextResponse.json({ error: "სატესტო მეილის გაგზავნა ვერ მოხერხდა." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
