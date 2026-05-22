'use client';

import { usePathname } from 'next/navigation';

const AUTH_PATHS = ['/admin/login', '/admin/signup', '/admin/forgot-password'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.some(p => pathname.startsWith(p));

  if (isAuth) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      {children}
    </div>
  );
}
