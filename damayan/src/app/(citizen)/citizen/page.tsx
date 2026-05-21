'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CitizenPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/citizen/login'); }, [router]);
  return null;
}
