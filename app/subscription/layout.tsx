import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'გამოწერა — mom menu',
  robots: { index: false, follow: false },
};

export default function SubscriptionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
