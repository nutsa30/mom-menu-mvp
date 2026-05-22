import './globals.css';
import type { Metadata } from 'next';
import NavWrapper from '@/components/NavWrapper';
import Analytics from '@/components/Analytics';
import CookieBanner from '@/components/CookieBanner';
import { Suspense } from 'react';
import { getSession } from '@/lib/auth';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://momeals.ge';
const DEFAULT_OG = `/og?title=moMeals&sub=Personal+Meal+Plans+for+Children`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'moMeals — ბავშვის კვების გეგმა',
    template: '%s | moMeals',
  },
  description: 'პერსონალური ყოველდღიური კვების გეგმა თქვენი ბავშვისთვის. ასობით რეცეპტი, ალერგენების გათვალისწინება, საყიდლების სია — ყველაფერი ერთ აპში.',
  keywords: [
    'ბავშვის კვება', 'კვების გეგმა ბავშვისთვის', 'ბავშვის მენიუ',
    'ბავშვის რეცეპტები', 'დამატებითი კვება', 'ჩვილის კვება',
    'moMeals', 'momeals.ge', 'child meal plan georgia', 'baby food',
  ],
  authors: [{ name: 'moMeals', url: SITE_URL }],
  creator: 'moMeals',
  publisher: 'moMeals',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'ka_GE',
    alternateLocale: ['en_US'],
    siteName: 'moMeals',
    title: 'moMeals — ბავშვის კვების გეგმა',
    description: 'პერსონალური ყოველდღიური კვების გეგმა თქვენი ბავშვისთვის. ასობით რეცეპტი, ალერგენების გათვალისწინება, საყიდლების სია.',
    url: SITE_URL,
    images: [{ url: DEFAULT_OG, width: 1200, height: 630, alt: 'moMeals — ბავშვის კვების გეგმა' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'moMeals — ბავშვის კვების გეგმა',
    description: 'პერსონალური ყოველდღიური კვების გეგმა თქვენი ბავშვისთვის.',
    images: [DEFAULT_OG],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="ka">
      <body className="min-h-screen overflow-x-hidden">
        <NavWrapper isLoggedIn={!!session} />
        {children}
        <Suspense fallback={null}>
          <CookieBanner />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
