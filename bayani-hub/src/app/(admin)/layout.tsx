'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider } from '@/admin-lib/auth-context';
import '@/admin-styles/globals.css';

const ADMIN_PUBLIC_ROUTES = ['/admin/login'];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('admin-token')
        : null;
    const isPublic = ADMIN_PUBLIC_ROUTES.includes(pathname ?? '');

    if (!token && !isPublic) {
      router.replace('/admin/login');
    } else {
      setAuthChecked(true);
    }
  }, [pathname, router]);

  if (!authChecked) return null;

  return (
    <AuthProvider>
      <div className="page-transition-wrapper">{children}</div>
    </AuthProvider>
  );
}
