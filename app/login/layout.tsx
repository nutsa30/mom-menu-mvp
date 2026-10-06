import { localizedMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

const georgianMetadata: Metadata = {
  title: 'შესვლა — mom menu',
  robots: { index: false, follow: false },
};

export async function generateMetadata(): Promise<Metadata> { return localizedMetadata(georgianMetadata, "Sign in — MomMenu", "Sign in with MomMenu.", "/login"); }

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
