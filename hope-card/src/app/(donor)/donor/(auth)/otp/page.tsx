"use client";

import React, { useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { C, AuthShell, SubmitBtn, MobileLogo } from "@/donor-components/auth-shared";

// ─── OTP Input ─────────────────────────────────────────────────────────────────
interface OtpInputProps {
  index: number;
  value: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const OtpDigit = React.memo<OtpInputProps>(({ index, value, inputRef, onChange, onKeyDown }) => (
  <input
    ref={inputRef}
    type="text"
    inputMode="numeric"
    maxLength={1}
    value={value}
    placeholder="·"
    autoFocus={index === 0}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, e.target.value)}
    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => onKeyDown(index, e)}
    style={{
      width: "100%",
      aspectRatio: "1",
      textAlign: "center",
      fontSize: "1.5rem",
      fontWeight: 700,
      background: C.surfaceContainerHighest,
      border: "none",
      borderRadius: "1rem",
      outline: "none",
      color: C.onPrimaryFixed,
      fontFamily: "Manrope, sans-serif",
      transition: "background 0.15s, box-shadow 0.15s",
    }}
    onFocus={(e) => {
      e.currentTarget.style.background = C.surfaceContainerLowest;
      e.currentTarget.style.boxShadow = `0 0 0 1px ${C.primary}33`;
    }}
    onBlur={(e) => {
      e.currentTarget.style.background = C.surfaceContainerHighest;
      e.currentTarget.style.boxShadow = "none";
    }}
  />
));
OtpDigit.displayName = "OtpDigit";

// ─── Page Component ────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(45);
  
  const inputRefs = useRef<Array<React.RefObject<HTMLInputElement | null>>>(
    Array.from({ length: OTP_LENGTH }, () => React.createRef<HTMLInputElement>())
  );

  const handleChange = useCallback((index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].current?.focus();
    }
  }, []);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1].current?.focus();
    }
  }, [digits]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullCode = digits.join('');
    if (fullCode.length < 6) {
      setErrorMessage('Please enter the full 6-digit code');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/auth/verify-numeric-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      // Redirect to change password page after successful verification
      router.push(`/donor/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.sessionToken)}`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendTimer > 0) return;
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/auth/generate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setResendTimer(45);
      setErrorMessage('');
      // Start countdown
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to resend code');
    }
  };

  // Mask email for display
  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'your email';

  return (
    <AuthShell>
      {/* Form Panel */}
      <div
        style={{
          padding: "clamp(2rem, 5vw, 5rem)",
          background: C.surfaceContainerLowest,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Mobile logo */}
        <MobileLogo />

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          {/* Shield icon */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "3.5rem",
              height: "3.5rem",
              background: C.surfaceContainerLow,
              borderRadius: "1rem",
              marginBottom: "1.5rem",
              color: C.primary,
            }}
          >
            <ShieldCheck size={28} />
          </div>

          <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.875rem", fontWeight: 700, color: C.onPrimaryFixed, margin: "0 0 0.5rem" }}>
            Verification Code
          </h2>
          <p style={{ color: C.onSurfaceVariant, margin: 0, lineHeight: 1.6, fontFamily: "Manrope, sans-serif" }}>
            We've sent a 6-digit code to{" "}
            <span style={{ color: C.onPrimaryFixed, fontWeight: 600 }}>{maskedEmail}</span>
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div style={{ 
            padding: "1rem", 
            marginBottom: "1.5rem", 
            background: "#fef2f2", 
            border: "1px solid #fecaca", 
            borderRadius: "0.75rem",
            color: "#991b1b",
            fontSize: "0.875rem",
            fontFamily: "Manrope, sans-serif"
          }}>
            {errorMessage}
          </div>
        )}

        {/* OTP inputs */}
        <form onSubmit={handleVerify}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", marginBottom: "2.5rem" }}>
            {digits.map((digit, i) => (
              <OtpDigit
                key={i}
                index={i}
                value={digit}
                inputRef={inputRefs.current[i]}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
            ))}
          </div>

          {/* Submit + Resend */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "1.25rem",
                borderRadius: "1rem",
                background: C.coralRose,
                color: C.onPrimary,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "1.125rem",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 24px rgba(242,141,131,0.3)",
                transition: "box-shadow 0.3s, transform 0.3s",
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(242,141,131,0.4)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(242,141,131,0.3)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <div style={{ textAlign: "center" }}>
              <p style={{ color: C.onSurfaceVariant, fontWeight: 500, fontSize: "0.875rem", margin: "0 0 0.25rem", fontFamily: "Manrope, sans-serif" }}>
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0}
                style={{
                  background: "none",
                  border: "none",
                  cursor: resendTimer > 0 ? "not-allowed" : "pointer",
                  color: resendTimer > 0 ? C.onSurfaceVariant : C.coralRose,
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  fontFamily: "Manrope, sans-serif",
                  opacity: resendTimer > 0 ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (resendTimer === 0) e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Resend Code{" "}
                {resendTimer > 0 && (
                  <span style={{ color: C.onSurfaceVariant, fontWeight: 400, marginLeft: "0.25rem" }}>
                    (00:{resendTimer.toString().padStart(2, '0')})
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Back link */}
        <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => router.push('/donor/login')}
            style={{
              background: "none",
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: C.onSurfaceVariant,
              fontWeight: 500,
              fontSize: "0.875rem",
              textDecoration: "none",
              transition: "color 0.15s",
              fontFamily: "Manrope, sans-serif",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.onPrimaryFixed)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.onSurfaceVariant)}
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

export default function OTPScreen() {
  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>Loading...</div>}>
      <OTPForm />
    </Suspense>
  );
}
