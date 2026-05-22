'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('admin_token');

    if (!token) {
      console.log('No admin_token found in localStorage, redirecting to login');
      setIsAuthorized(false);
      // Use a small delay to ensure redirect happens smoothly
      setTimeout(() => {
        router.push('/admin/login');
      }, 100);
      return;
    }

    console.log('admin_token found in localStorage, granting access');
    setIsAuthorized(true);
  }, [router]);

  // Show nothing while checking authorization
  if (isAuthorized === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#fef9f3'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #9b2c2c',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#666' }}>Loading...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Don't render if not authorized
  if (isAuthorized === false) {
    return null;
  }

  return <>{children}</>;
}
