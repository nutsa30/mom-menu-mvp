import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import HowItWorksAdminClient from './HowItWorksAdminClient';

export default async function HowItWorksAdminPage() {
  await requireAdmin();

  const [steps, faqs, settingsRaw] = await Promise.all([
    prisma.howItWorksStep.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.howItWorksFaq.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.howItWorksSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton' },
      update: {},
    }),
  ]);

  const HIW_DEFAULTS = {
    heroTitleKa:    'სამი წუთი — და კვირის მენიუ მზადაა',
    heroTitleEn:    'Three minutes and your weekly menu is ready',
    heroSubtitleKa: 'mom menu იღებს შვილის ინფორმაციას და შენ ნაცვლად ადგენს ყოველდღიურ, ბალანსირებულ კვების გეგმას.',
    heroSubtitleEn: "mom menu takes your child's info and builds a balanced daily meal plan so you don't have to.",
    ctaTitleKa:     'მზად ხარ?',
    ctaTitleEn:     'Ready to get started?',
    ctaSubtitleKa:  'პირველი კვირა — უფასოდ.',
    ctaSubtitleEn:  'Your first week — on us.',
  };

  const settings = Object.fromEntries(
    Object.entries(HIW_DEFAULTS).map(([k, def]) => [k, (settingsRaw as any)[k] ?? def])
  );

  return <HowItWorksAdminClient steps={steps} faqs={faqs} settings={settings} />;
}
