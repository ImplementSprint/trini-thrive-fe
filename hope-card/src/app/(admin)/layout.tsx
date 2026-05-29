'use client';

import type { Metadata } from 'next';
import { usePathname } from 'next/navigation';
import Sidebar from '@/admin-components/layout/Sidebar';

const AUTH_PATHS = ['/admin/login', '/admin/verify', '/admin/forgot-password'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some(p => pathname === p || pathname.startsWith(p));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', position: 'fixed', inset: 0, background: '#f9f9f9' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
