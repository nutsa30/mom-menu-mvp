import { getAdminLocale } from '@/lib/adminI18n';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'როგორ მუშაობს — mom menu',
  description: 'სამი მარტივი ნაბიჯი: დაარეგისტრირე ბავშვი, მიუთითე ალერგენები და გემოვნება — და მიიღე პერსონალური კვების გეგმა. გაეცანი როგორ მუშაობს mom menu.',
  alternates: {
    canonical: '/how-it-works',
    languages: { 'ka': '/how-it-works?lang=ka', 'en': '/how-it-works?lang=en', 'x-default': '/how-it-works' },
  },
  openGraph: {
    title: 'როგორ მუშაობს — mom menu',
    description: 'სამი მარტივი ნაბიჯი პერსონალური კვების გეგმისთვის. გაეცანი როგორ მუშაობს mom menu.',
    url: '/how-it-works',
    images: [{ url: `/og?title=How+mom menu+Works&sub=3+steps+to+a+personalized+meal+plan+for+your+child`, width: 1200, height: 630, alt: 'How mom menu Works' }],
  },
};

export default async function HowItWorksPage({ searchParams }: { searchParams: { lang?: string } }) {
  const locale = getAdminLocale(searchParams.lang) as 'ka' | 'en';
  const session = await getSession();

  const [steps, faqs, settings] = await Promise.all([
    prisma.howItWorksStep.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.howItWorksFaq.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.howItWorksSettings.findUnique({ where: { id: 'singleton' } }),
  ]);

  const title = (s: any) => locale === 'ka' ? s.titleKa : s.titleEn;
  const desc = (s: any) => locale === 'ka' ? s.descKa : s.descEn;
  const question = (f: any) => locale === 'ka' ? f.questionKa : f.questionEn;
  const answer = (f: any) => locale === 'ka' ? f.answerKa : f.answerEn;

  const faqJsonLd = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.questionKa,
      acceptedAnswer: { '@type': 'Answer', text: f.answerKa },
    })),
  } : null;

  return (
    <>
    {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
    <main className="min-h-screen" style={{ background: '#465940' }}>

      {/* Hero */}
      <section className="border-b border-[#FDFBF0]/10 py-16 text-center px-6" style={{ background: '#465940' }}>
        <p className="text-[#FDFBF0]/70 font-bold text-sm uppercase tracking-widest mb-3">
          {locale === 'ka' ? 'როგორ მუშაობს' : 'How it works'}
        </p>
        <h1 className="text-4xl sm:text-5xl font-black text-[#FDFBF0] mb-4 leading-tight">
          {locale === 'ka' ? (settings?.heroTitleKa || 'სამი წუთი — და კვირის მენიუ მზადაა') : (settings?.heroTitleEn || 'Three minutes and your weekly menu is ready')}
        </h1>
        <p className="text-[#FDFBF0]/60 max-w-md mx-auto text-sm leading-relaxed">
          {locale === 'ka' ? (settings?.heroSubtitleKa || '') : (settings?.heroSubtitleEn || '')}
        </p>
      </section>

      {/* Steps */}
      {steps.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-16">
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={step.id} className="flex gap-5 bg-[#FDFBF0] rounded-2xl border border-[#FDFBF0]/20 shadow-sm p-6">
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-[#465940] flex items-center justify-center text-2xl">
                    {step.icon}
                  </div>
                  {i < steps.length - 1 && <div className="w-0.5 flex-1 bg-[#465940]/10 min-h-[24px]" />}
                </div>
                <div className="pt-1">
                  <p className="text-[10px] font-black text-[#465940]/60 tracking-widest mb-1">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="text-lg font-black text-[#465940] mb-1.5">{title(step)}</h3>
                  <p className="text-sm text-[#465940]/70 leading-relaxed">{desc(step)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section id="faq" className="border-t border-[#FDFBF0]/10 py-16 px-6" style={{ background: '#465940' }}>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-[#FDFBF0] mb-8 text-center">
              {locale === 'ka' ? 'ხშირი კითხვები' : 'Frequently asked questions'}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-[#FDFBF0] rounded-2xl p-5 border border-[#FDFBF0]/20">
                  <p className="font-bold text-[#465940] mb-1.5">— {question(faq)}</p>
                  <p className="text-sm text-[#465940]/70 leading-relaxed">{answer(faq)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-6 text-center" style={{ background: '#465940' }}>
        <h2 className="text-2xl font-black text-[#FDFBF0] mb-3">
          {locale === 'ka' ? (settings?.ctaTitleKa || 'მზად ხარ?') : (settings?.ctaTitleEn || 'Ready to get started?')}
        </h2>
        <p className="text-[#FDFBF0]/60 text-sm mb-7">
          {locale === 'ka' ? (settings?.ctaSubtitleKa || '') : (settings?.ctaSubtitleEn || '')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {session ? (
            <a
              href="/dashboard"
              className="font-bold px-8 py-3.5 rounded-full transition text-sm"
              style={{ background: '#FDFBF0', color: '#465940' }}
            >
              {locale === 'ka' ? 'ჩემი დეშბორდი →' : 'Go to Dashboard →'}
            </a>
          ) : (
            <>
              <a
                href={locale === 'ka' ? '/register' : '/register?lang=en'}
                className="font-bold px-8 py-3.5 rounded-full transition text-sm"
                style={{ background: '#FDFBF0', color: '#465940' }}
              >
                {locale === 'ka' ? 'დარეგისტრირდი' : 'Sign up'}
              </a>
              <a
                href={locale === 'ka' ? '/#pricing' : '/?lang=en#pricing'}
                className="border border-[#FDFBF0]/30 text-[#FDFBF0] hover:bg-[#FDFBF0]/10 font-bold px-8 py-3.5 rounded-full transition text-sm"
              >
                {locale === 'ka' ? 'ფასები' : 'View pricing'}
              </a>
            </>
          )}
        </div>
      </section>

    </main>
    </>
  );
}
