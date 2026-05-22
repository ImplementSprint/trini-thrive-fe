import type { ReactNode } from 'react';
import '@/siteman-styles/globals.css';

export default function SitemanLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
