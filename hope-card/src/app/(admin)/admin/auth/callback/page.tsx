'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/admin-lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from URL (Supabase automatically handles this)
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          // Session might not be available immediately, wait a moment
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !sessionData.session) {
            setError('Failed to authenticate. Please try again.');
            setLoading(false);
            return;
          }
        }

        // Get user info
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Store user info in localStorage
          localStorage.setItem('admin_token', data.session?.access_token || '');
          localStorage.setItem('admin_info', JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'Admin User',
          }));

          // Redirect to dashboard
          router.push('/admin/dashboard');
        } else {
          setError('User not found');
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An error occurred during authentication');
        setLoading(false);
      }
    };

    handleCallback();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Signing you in...</h2>
          <p>Please wait while we authenticate your session.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'red' }}>
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/admin/login')} style={{ padding: '10px 20px', marginTop: '20px' }}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
