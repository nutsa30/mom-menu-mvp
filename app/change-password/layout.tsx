import { localizedMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

const georgianMetadata: Metadata = {
  title: 'პაროლის შეცვლა — mom menu',
  robots: { index: false, follow: false },
};

export async function generateMetadata(): Promise<Metadata> { return localizedMetadata(georgianMetadata, "Change your password — MomMenu", "Change your password with MomMenu.", "/change-password"); }

export default function ChangePasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
