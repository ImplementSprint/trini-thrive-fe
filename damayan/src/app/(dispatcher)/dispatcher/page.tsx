'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DispatcherPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/dispatcher/login'); }, [router]);
  return null;
}
