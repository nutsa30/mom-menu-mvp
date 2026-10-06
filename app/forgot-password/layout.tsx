import { localizedMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

const georgianMetadata: Metadata = {
  title: 'პაროლის აღდგენა — mom menu',
  robots: { index: false, follow: false },
};

export async function generateMetadata(): Promise<Metadata> { return localizedMetadata(georgianMetadata, "Reset your password — MomMenu", "Reset your password with MomMenu.", "/forgot-password"); }

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
