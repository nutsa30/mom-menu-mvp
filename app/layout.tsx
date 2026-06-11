import './globals.css';
import type { Metadata } from 'next';
import NavWrapper from '@/components/NavWrapper';
import FooterWrapper from '@/components/FooterWrapper';
import Analytics from '@/components/Analytics';
import CookieBanner from '@/components/CookieBanner';
import { Suspense } from 'react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mommenu.ge';
const DEFAULT_OG = `/og?title=mom+menu&sub=Personal+Meal+Plans+for+Children`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'mom menu — ბავშვის კვების გეგმა',
    template: '%s | mom menu',
  },
  description: 'პერსონალური ყოველდღიური კვების გეგმა თქვენი ბავშვისთვის. ასობით რეცეპტი, ალერგენების გათვალისწინება, საყიდლების სია — ყველაფერი ერთ აპში.',
  keywords: [
    'ბავშვის კვება', 'კვების გეგმა ბავშვისთვის', 'ბავშვის მენიუ',
    'ბავშვის რეცეპტები', 'დამატებითი კვება', 'ჩვილის კვება',
    'mom menu', 'mommenu.ge', 'child meal plan georgia', 'baby food georgia',
  ],
  authors: [{ name: 'mom menu', url: SITE_URL }],
  creator: 'mom menu',
  publisher: 'mom menu',
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'ka_GE',
    alternateLocale: ['en_US'],
    siteName: 'mom menu',
    title: 'mom menu — ბავშვის კვების გეგმა',
    description: 'პერსონალური ყოველდღიური კვების გეგმა თქვენი ბავშვისთვის. ასობით რეცეპტი, ალერგენების გათვალისწინება, საყიდლების სია.',
    url: SITE_URL,
    images: [{ url: DEFAULT_OG, width: 1200, height: 630, alt: 'mom menu — ბავშვის კვების გეგმა' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mom menu — ბავშვის კვების გეგმა',
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'mom menu',
  url: SITE_URL,
  logo: `${SITE_URL}/og?title=mom+menu`,
  contactPoint: { '@type': 'ContactPoint', email: 'info@mommenu.ge', contactType: 'customer service' },
  sameAs: [`${SITE_URL}`],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'mom menu',
  url: SITE_URL,
  description: 'პერსონალური ყოველდღიური კვების გეგმა თქვენი ბავშვისთვის',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/blog?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, seo] = await Promise.all([
    getSession(),
    prisma.seoSettings.findUnique({ where: { id: 'singleton' } }).catch(() => null),
  ]);

  const gaId  = seo?.gaId  || process.env.NEXT_PUBLIC_GA_ID  || 'G-YXNN1XCX9V';
  const gtmId = seo?.gtmId || process.env.NEXT_PUBLIC_GTM_ID || '';
  const googleVerification = seo?.googleVerification;

  return (
    <html lang="ka">
      <head>
        {googleVerification && (
          <meta name="google-site-verification" content={googleVerification} />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen overflow-x-hidden">
        {/* GTM noscript fallback */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        <Suspense fallback={null}>
          <NavWrapper isLoggedIn={!!session} />
        </Suspense>
        {children}
        <FooterWrapper />
        <Suspense fallback={null}>
          <CookieBanner />
        </Suspense>
        <Suspense fallback={null}>
          <Analytics gaId={gaId} gtmId={gtmId} />
        </Suspense>
      </body>
    </html>
  );
}
