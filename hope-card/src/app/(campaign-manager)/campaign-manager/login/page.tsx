'use client';

import Link from 'next/link';
import { ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import AuthShell from '@/campaign-manager-components/AuthShell';
import { loginAction } from '../actions/auth';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function LoginForm() {
  const searchParams = useSearchParams();
  const confirmed = searchParams.get('confirmed');
  const urlError = searchParams.get('error');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  // Stale cookie check: clear any non-campaign-manager persona on mount
  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const persona = cookies.find(c => c.startsWith('persona='))?.split('=')[1];
    if (persona && persona !== 'campaign-manager') {
      document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsPending(true);

    const fd = new FormData(event.currentTarget);
    try {
      const result = await loginAction(fd);
      if (result?.error) {
        setError(result.error);
        setIsPending(false);
      }
      // If result is null or success, redirect() was called in the server action
      // Next.js will handle the redirect
    } catch (error: any) {
      // redirect() throws NEXT_REDIRECT which is expected; persona cookie is set server-side
      if (!error?.digest?.includes('NEXT_REDIRECT')) {
        console.error('Login error:', error);
        setError('An unexpected error occurred. Please try again.');
        setIsPending(false);
      }
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      description="Continue your journey of making an impact today."
      footerRightLabel="Verified"
    >
      {confirmed === 'true' && (
        <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-center text-[10px] font-semibold text-green-700">
          Email confirmed! Your account is currently under review.
        </p>
      )}

      {urlError === 'confirmation_failed' && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-center text-[10px] font-semibold text-red-700">
          Email confirmation failed or the link has expired. Please request a new one.
        </p>
      )}

      {urlError === 'missing_code' && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-center text-[10px] font-semibold text-red-700">
          Invalid confirmation link. Please use the link from your email.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Email Address</span>
          <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
            <Mail size={16} className="text-[#bcb3b0]" />
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
              required
            />
          </div>
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Password</span>
            <Link href="/campaign-manager/forgot-password" className="text-[11px] font-semibold text-[#f0a4a0] hover:text-[#e4807b]">
              Forgot Password?
            </Link>
          </div>
          <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
            <Lock size={16} className="text-[#bcb3b0]" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="........"
              className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#8f7f7b]"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#bcb3b0] hover:text-[#8f7f7b] transition">
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-center text-[9px] font-bold uppercase tracking-wider text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#a6493f] text-[13px] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_8px_18px_rgba(166,73,63,0.28)] transition hover:bg-[#963f37] disabled:opacity-60"
        >
          {isPending ? 'Signing In...' : 'Sign In'}
          {!isPending && <ArrowRight size={16} />}
        </button>
      </form>

      <p className="mt-8 text-center text-[13px] text-[#8f817d]">
        Don&apos;t have an account?{' '}
        <Link href="/campaign-manager/create-account" className="font-semibold text-[#f0a4a0]">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShell title="Welcome Back" description="Continue your journey of making an impact today." footerRightLabel="Verified"><div /></AuthShell>}>
      <LoginForm />
    </Suspense>
  );
}
