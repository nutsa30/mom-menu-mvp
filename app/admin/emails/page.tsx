import { prisma } from "@/lib/prisma";
import EmailCenterClient from "./client";

export default async function AdminEmailsPage() {
  const [campaigns, sent, failed, scheduled, draft] = await Promise.all([
    prisma.emailCampaign.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.emailCampaign.count({ where: { status: "SENT" } }),
    prisma.emailCampaign.count({ where: { status: "FAILED" } }),
    prisma.emailCampaign.count({ where: { status: "SCHEDULED" } }),
    prisma.emailCampaign.count({ where: { status: "DRAFT" } }),
  ]);

  return (
    <EmailCenterClient
      initialCampaigns={JSON.parse(JSON.stringify(campaigns))}
      initialStats={{ sent, failed, scheduled, draft }}
    />
  );
}
