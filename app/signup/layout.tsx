import { localizedMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

const georgianMetadata: Metadata = {
  title: 'რეგისტრაცია — mom menu',
  robots: { index: false, follow: false },
};

export async function generateMetadata(): Promise<Metadata> { return localizedMetadata(georgianMetadata, "Create an account — MomMenu", "Create an account with MomMenu.", "/signup"); }

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
