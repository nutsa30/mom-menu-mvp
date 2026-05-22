import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import HowItWorksAdminClient from './HowItWorksAdminClient';

export default async function HowItWorksAdminPage() {
  await requireAdmin();

  const [steps, faqs, settings] = await Promise.all([
    prisma.howItWorksStep.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.howItWorksFaq.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.howItWorksSettings.findUnique({ where: { id: 'singleton' } }),
  ]);

  return <HowItWorksAdminClient steps={steps} faqs={faqs} settings={settings} />;
}
