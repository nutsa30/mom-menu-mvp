import type { Metadata } from 'next';
import ContactClient from './client';

export const metadata: Metadata = {
  title: 'კონტაქტი — MomMenu',
  description: 'დაგვიკავშირდი! კითხვა, წინადადება ან უბრალოდ გინდა ისაუბრო — ჩაგვწერე.',
  openGraph: { title: 'კონტაქტი — MomMenu', url: '/contact' },
};

export default function ContactPage({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const locale = searchParams.lang === 'en' ? 'en' : 'ka';

  return (
    <main className="min-h-screen" style={{ background: '#465940' }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,.15)', borderBottom: '1px solid rgba(253,251,240,.1)' }}>
        <div className="max-w-5xl mx-auto px-5 py-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
            style={{ background: 'rgba(253,251,240,.12)', color: 'rgba(253,251,240,.7)' }}>
            ✉️ {locale === 'ka' ? 'კონტაქტი' : 'Contact'}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#FDFBF0] leading-tight mb-4">
            {locale === 'ka' ? 'გვესაუბრე' : 'Talk to us'}
          </h1>
          <p className="text-[#FDFBF0]/65 text-lg max-w-lg">
            {locale === 'ka'
              ? 'ვმუშაობთ, რომ MomMenu ყოველდღე უკეთესი გახდეს. შენი ხმა მნიშვნელოვანია.'
              : 'We work every day to make MomMenu better. Your voice matters.'}
          </p>
        </div>
      </div>

      {/* Form + Info */}
      <ContactClient locale={locale} />
    </main>
  );
}
