import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'რეგისტრაცია — mom menu',
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
