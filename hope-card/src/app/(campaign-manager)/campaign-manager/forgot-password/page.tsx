'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, Mail, AlertCircle } from 'lucide-react';
import { useTransition } from 'react';
import AuthShell from '@/campaign-manager-components/AuthShell';
import { sendOTPAction, verifyOTPAction } from '../actions/auth';

const OTP_LENGTH = 6;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(Array.from({ length: OTP_LENGTH }, () => ''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSendCodeClick = () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    startTransition(async () => {
      const formData = new FormData();
      formData.set('email', email);
      const result = await sendOTPAction(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3500);
      }
    });
  };

  const updateDigit = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, '').slice(-1);
    const nextCode = [...code];
    nextCode[index] = nextValue;
    setCode(nextCode);

    if (nextValue && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    updateDigit(index, event.target.value);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmitCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const otpCode = code.join('');
    if (otpCode.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits.');
      return;
    }

    setError('');
    startTransition(async () => {
      const result = await verifyOTPAction(email, otpCode);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        // Pass email and OTP to reset-password page via query params
        const params = new URLSearchParams({
          email: email,
          otp: otpCode,
        });
        router.push(`/reset-password?${params.toString()}`);
      }
    });
  };

  return (
    <AuthShell
      title="Reset Password"
      description="Enter your email address and the 6-digit recovery code."
      footerRightLabel="Verified"
    >
      <form onSubmit={handleSubmitCode} className="space-y-6">
        <div className="space-y-2">
          <label className="block space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Email Address</span>
            <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
              <Mail size={16} className="text-[#bcb3b0]" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
            </div>
          </label>
          <div className="flex justify-end pr-1">
            <button
              type="button"
              onClick={handleSendCodeClick}
              disabled={isPending}
              className="rounded-lg bg-[#f0a4a0] px-4 py-1.5 text-[10px] font-extrabold tracking-[0.06em] text-white uppercase transition hover:bg-[#e4807b] disabled:opacity-60"
            >
              {isPending ? 'Sending...' : 'Send Code'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#d72617]">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763] block">Recovery Code</span>
          <div className="flex justify-between gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                value={digit}
                onChange={(event) => handleChange(index, event)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                inputMode="numeric"
                maxLength={1}
                required
                className="h-[48px] w-[48px] rounded-xl bg-[#f5f2f1] text-center text-[18px] font-bold text-[#6d4a44] outline-none transition focus:ring-2 focus:ring-[#d7a29a] sm:h-[56px] sm:w-[56px] sm:text-[20px]"
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#a6493f] text-[13px] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_8px_18px_rgba(166,73,63,0.28)] transition hover:bg-[#963f37] disabled:opacity-60"
        >
          {isPending ? 'Verifying...' : 'Verify Code'}
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
          <Mail size={16} className="text-[#f0a4a0]" />
          Recovery code sent to your email!
        </div>
      )}
    </AuthShell>
  );
}
