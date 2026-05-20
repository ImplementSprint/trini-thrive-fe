import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HopeCard Admin',
  description: 'HopeCard Administration Portal',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
