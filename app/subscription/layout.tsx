import { localizedMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

const georgianMetadata: Metadata = {
  title: 'გამოწერა — mom menu',
  robots: { index: false, follow: false },
};

export async function generateMetadata(): Promise<Metadata> { return localizedMetadata(georgianMetadata, "Choose your MomMenu plan — MomMenu", "Choose your MomMenu plan with MomMenu.", "/subscription"); }

export default function SubscriptionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
