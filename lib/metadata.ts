import type { Metadata } from 'next';
import { getExperience } from './experience';
export async function localizedMetadata(georgian: Metadata, title: string, description: string, path = '/'): Promise<Metadata> {
  const { locale } = await getExperience();
  if (locale === 'ka') return georgian;
  const url = `${path}?lang=en`;
  return { ...georgian, title, description, manifest: '/site-en.webmanifest', keywords: ['Mommenu','baby food','toddler recipes','child meal plan'], alternates: { canonical: url, languages: { ka: `${path}?lang=ka`, en: url, 'x-default': path } }, openGraph: { ...georgian.openGraph, title, description, locale: 'en_US', url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }] }, twitter: { ...georgian.twitter, title, description } };
}
