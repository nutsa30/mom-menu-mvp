import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ContactClient from './client';

export const metadata: Metadata = {
  title: 'კონტაქტი — MomMenu',
  description: 'დაგვიკავშირდი! კითხვა, წინადადება ან უბრალოდ გინდა ისაუბრო — ჩაგვწერე.',
  openGraph: { title: 'კონტაქტი — MomMenu', url: '/contact' },
};

const DEFAULTS = {
  titleKa: 'გვესაუბრე', titleEn: 'Talk to us',
  subtitleKa: 'ვმუშაობთ, რომ MomMenu ყოველდღე უკეთესი გახდეს. შენი ხმა მნიშვნელოვანია.',
  subtitleEn: 'We work every day to make MomMenu better. Your voice matters.',
  introKa: 'კითხვა გაქვს? წინადადება? ჩაგვწერე — ვუპასუხებთ 24 საათის განმავლობაში.',
  introEn: 'Have a question or suggestion? Write to us — we respond within 24 hours.',
  email: 'info@mommenu.ge',
  responseTimeKa: '24 საათის განმავლობაში', responseTimeEn: 'Within 24 hours',
  workingHoursKa: 'ორშ — პარ, 10:00 – 18:00', workingHoursEn: 'Mon – Fri, 10:00 – 18:00',
};

export default async function ContactPage({ searchParams }: { searchParams: { lang?: string } }) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';

  const s = await prisma.contactSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...DEFAULTS },
    update: {},
  });

  return (
    <main className="min-h-screen" style={{ background: '#465940' }}>
      <div style={{ background: 'rgba(0,0,0,.15)', borderBottom: '1px solid rgba(253,251,240,.1)' }}>
        <div className="max-w-5xl mx-auto px-5 py-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
            style={{ background: 'rgba(253,251,240,.12)', color: 'rgba(253,251,240,.7)' }}>
            ✉️ {locale === 'ka' ? 'კონტაქტი' : 'Contact'}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#FDFBF0] leading-tight mb-4">
            {locale === 'ka' ? s.titleKa : s.titleEn}
          </h1>
          <p className="text-[#FDFBF0]/65 text-lg max-w-lg">
            {locale === 'ka' ? s.subtitleKa : s.subtitleEn}
          </p>
        </div>
      </div>

      <ContactClient locale={locale} settings={JSON.parse(JSON.stringify(s))} />
    </main>
  );
}
