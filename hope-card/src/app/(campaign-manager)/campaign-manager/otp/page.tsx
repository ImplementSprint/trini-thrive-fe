'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import AuthShell from '@/campaign-manager-components/AuthShell';

const OTP_LENGTH = 6;

export default function OtpPage() {
  const router = useRouter();
  const [code, setCode] = useState(Array.from({ length: OTP_LENGTH }, () => ''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Stale cookie check: clear any non-campaign-manager persona on mount
  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const persona = cookies.find(c => c.startsWith('persona='))?.split('=')[1];
    if (persona && persona !== 'campaign-manager') {
      document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    }
  }, []);

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

  const handleVerify = () => {
    document.cookie = 'persona=campaign-manager; path=/; SameSite=Strict';
    router.push('/campaign-manager/dashboard');
  };

  return (
    <AuthShell
      title="Verify Your Identity"
      description="We&apos;ve sent a 6-digit code to your email. Please enter it below to continue."
      footerRightLabel="Identity Verified"
    >
      <div className="flex justify-center gap-3">
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
            className="h-14 w-14 rounded-full bg-[#f5f2f1] text-center text-[20px] font-bold text-[#6d4a44] outline-none transition focus:ring-2 focus:ring-[#d7a29a]"
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleVerify}
        className="mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#a6493f] text-[13px] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_8px_18px_rgba(166,73,63,0.28)] transition hover:bg-[#963f37]"
      >
        Verify
        <ArrowRight size={16} />
      </button>

      <div className="mt-8 text-center">
        <p className="text-[12px] font-medium text-[#8f817d]">Didn&apos;t receive the code?</p>
        <div className="mt-5 flex items-center justify-center gap-5 text-[12px]">
          <button type="button" className="font-semibold text-[#f0a4a0]">
            Resend Code
          </button>
          <span className="rounded-full bg-[#f5f2f1] px-4 py-1.5 font-medium text-[#8f817d]">01:59</span>
        </div>
      </div>
    </AuthShell>
  );
}
