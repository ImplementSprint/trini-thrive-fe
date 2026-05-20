'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { C, AuthShell, MobileLogo } from '@/donor-components/auth-shared';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const sessionToken = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setErrorMessage('Password is required'); return; }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/auth/reset-password-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sessionToken, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      router.push('/donor/login');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <div
        style={{
          padding: 'clamp(2rem, 5vw, 5rem)',
          background: C.surfaceContainerLowest,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <MobileLogo />

        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.875rem', fontWeight: 700, color: C.onPrimaryFixed, margin: '0 0 0.5rem' }}>
            Reset Password
          </h2>
          <p style={{ color: C.onSurfaceVariant, margin: 0, fontFamily: 'Manrope, sans-serif' }}>
            Enter your new password below.
          </p>
        </div>

        {errorMessage && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', color: '#991b1b', fontSize: '0.875rem', fontFamily: 'Manrope, sans-serif' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: C.onSurfaceVariant, paddingLeft: '0.25rem', fontFamily: 'Manrope, sans-serif' }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: C.onSurfaceVariant, display: 'flex' }}>
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '3rem',
                  paddingRight: '3rem',
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                  borderRadius: '1rem',
                  background: C.surfaceContainerHighest,
                  border: 'none',
                  outline: 'none',
                  color: C.onSurface,
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.background = C.surfaceContainerLowest; e.currentTarget.style.boxShadow = `0 0 0 1px ${C.primary}33`; }}
                onBlur={(e) => { e.currentTarget.style.background = C.surfaceContainerHighest; e.currentTarget.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.onSurfaceVariant, display: 'flex' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1.25rem',
              borderRadius: '1rem',
              background: C.coralRose,
              color: C.onPrimary,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 700,
              fontSize: '1.125rem',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(242,141,131,0.3)',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => router.push('/donor/login')}
            style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: C.onSurfaceVariant, fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordScreen() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
