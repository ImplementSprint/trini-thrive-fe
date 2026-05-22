import type { ReactNode } from 'react';
import './enduser-globals.css';
import { AuthProvider } from '@/enduser-lib/auth-context';

export default function EnduserLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
