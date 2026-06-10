import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'რეგისტრაცია — mom menu',
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
