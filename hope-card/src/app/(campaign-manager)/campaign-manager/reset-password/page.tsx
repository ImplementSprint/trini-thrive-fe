'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, Suspense } from 'react';
import { ArrowLeft, ArrowRight, Lock, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useTransition } from 'react';
import AuthShell from '@/campaign-manager-components/AuthShell';
import Link from 'next/link';
import { resetPasswordAction } from '../actions/auth';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const otp = searchParams.get('otp') || '';

  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Please ensure both passwords match perfectly.");
      return;
    }

    if (!email || !otp) {
      setError('Invalid session. Please try the forgot password flow again.');
      return;
    }

    setError('');
    startTransition(async () => {
      const result = await resetPasswordAction(email, otp, password);

      if (result?.error) {
        setError(result.error);
      } else {
        setShowToast(true);
        setTimeout(() => {
          router.push('/');
        }, 2500);
      }
    });
  };

  return (
    <AuthShell
      title="Create New Password"
      description="Your new password must be different from previously used passwords."
      footerRightLabel="Verified"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Your New Password</span>
          <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
            <Lock size={16} className="text-[#bcb3b0]" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="........"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#8f7f7b] disabled:opacity-60"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isPending} className="text-[#bcb3b0] hover:text-[#8f7f7b] transition disabled:opacity-60">
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Retype Your New Password</span>
          <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
            <Lock size={16} className="text-[#bcb3b0]" />
            <input
              type={showRetypePassword ? "text" : "password"}
              placeholder="........"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              disabled={isPending}
              className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#8f7f7b] disabled:opacity-60"
              required
            />
            <button type="button" onClick={() => setShowRetypePassword(!showRetypePassword)} disabled={isPending} className="text-[#bcb3b0] hover:text-[#8f7f7b] transition disabled:opacity-60">
              {showRetypePassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </label>

        {error && (
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#d72617]">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#a6493f] text-[13px] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_8px_18px_rgba(166,73,63,0.28)] transition hover:bg-[#963f37] disabled:opacity-60"
        >
          {isPending ? 'Updating...' : 'Update Password'}
          {!isPending && <ArrowRight size={16} />}
        </button>
      </form>
      
      <div className="mt-8 text-center text-[13px] text-[#8f817d]">
        <Link href="/campaign-manager/create-account" className="inline-flex items-center gap-2 font-semibold text-[#f0a4a0] hover:text-[#e4807b]">
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>
      </div>

      {showToast && (
        <div className="fixed bottom-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#2a1c1a] px-6 py-3.5 text-[13px] font-medium text-[#f5ece8] shadow-[0_16px_42px_rgba(42,28,26,0.5)]">
          <CheckCircle2 size={16} className="text-[#f0a4a0]" />
          Password successfully changed!
        </div>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthShell title="Create New Password" description="Your new password must be different from previously used passwords." footerRightLabel="Verified"><div /></AuthShell>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
