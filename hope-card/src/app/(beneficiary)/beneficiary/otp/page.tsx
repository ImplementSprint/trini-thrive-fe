"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Clock, ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  S, BeneficiaryStyle, AmbientCard, CardLogo,
  PrimaryBtn, BeneficiaryFooter, FieldLabel, TextInput,
} from "@/app/(beneficiary)/beneficiary/shared/beneficiary-shared";

const BACKEND = process.env.NEXT_PUBLIC_BENEFICIARY_BACKEND_URL ?? "";

// ─── OTP Digit ────────────────────────────────────────────────────────────────
interface OtpDigitProps {
  index: number;
  value: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (i: number, v: string) => void;
  onKeyDown: (i: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const OtpDigit = React.memo<OtpDigitProps>(({ index, value, inputRef, onChange, onKeyDown }) => (
  <input
    ref={inputRef}
    type="number"
    inputMode="numeric"
    maxLength={1}
    aria-label={`OTP Digit ${index + 1}`}
    value={value}
    autoFocus={index === 0}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, e.target.value)}
    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => onKeyDown(index, e)}
    style={{
      width: "100%",
      aspectRatio: "1",
      textAlign: "center",
      fontSize: "1.25rem",
      fontWeight: 700,
      background: S.surfaceContainerLow,
      border: `1px solid ${S.outlineVariant}4d`,
      borderRadius: "0.75rem",
      color: S.onSurface,
      outline: "none",
      fontFamily: "Plus Jakarta Sans, sans-serif",
      transition: "border-color 0.15s, box-shadow 0.15s",
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = S.primary;
      e.currentTarget.style.boxShadow = `0 0 0 4px ${S.primaryContainer}33`;
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = `${S.outlineVariant}4d`;
      e.currentTarget.style.boxShadow = "none";
    }}
  />
));
OtpDigit.displayName = "OtpDigit";

// ─── Constants ────────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;
const OTP_DIGIT_IDS = ['d0', 'd1', 'd2', 'd3', 'd4', 'd5'] as const;

type Step = "email" | "otp" | "password";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter();

  // Clear stale persona cookie on mount
  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const persona = cookies.find(c => c.startsWith('persona='))?.split('=')[1];
    if (persona && persona !== 'beneficiary') {
      document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    }
  }, []);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const refs = useRef<Array<React.RefObject<HTMLInputElement | null>>>(
    new Array(OTP_LENGTH).fill(null).map(() => React.createRef<HTMLInputElement>())
  );

  useEffect(() => {
    if (step !== "otp") return;
    setResendSeconds(RESEND_SECONDS);
    setCanResend(false);
    const interval = setInterval(() => {
      setResendSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleChange = useCallback((i: number, val: string) => {
    const digit = val.replaceAll(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });
    if (digit && i < OTP_LENGTH - 1) refs.current[i + 1].current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1].current?.focus();
    },
    [digits]
  );

  const postJson = async (path: string, body: Record<string, string>) => {
    const res = await fetch(`${BACKEND}/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setIsSubmitting(true);
    try {
      const { ok, data } = await postJson("forgot-password", { email: email.trim() });
      if (!ok) {
        setError(data?.message || "Failed to send verification code. Please try again.");
        return;
      }
      setStep("otp");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setError(null);
    setCanResend(false);
    setDigits(new Array(OTP_LENGTH).fill(""));
    const { ok, data } = await postJson("forgot-password", { email: email.trim() });
    if (!ok) {
      setError(data?.message || "Failed to resend code.");
      setCanResend(true);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) { setError("Please enter the complete 6-digit code."); return; }
    setError(null);
    setIsSubmitting(true);
    try {
      const { ok, data } = await postJson("verify-reset-otp", { email: email.trim(), otp });
      if (!ok) {
        setError(data?.message || "Invalid or expired code. Please try again.");
        return;
      }
      setResetToken(data.reset_token);
      setStep("password");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Reset password
  const handleUpdatePassword = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!/\d/.test(newPassword)) { setError("Password must contain at least one number."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setIsSubmitting(true);
    try {
      const { ok, data } = await postJson("reset-password", {
        reset_token: resetToken,
        new_password: newPassword,
      });
      if (!ok) {
        setError(data?.message || "Failed to update password. Please try again.");
        return;
      }
      router.replace("/beneficiary/login?reset=true");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const errorBannerStyle: React.CSSProperties = {
    borderRadius: "0.75rem",
    background: S.errorContainer,
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    color: S.onErrorContainer,
    margin: 0,
    fontFamily: "Plus Jakarta Sans, sans-serif",
  };

  const backBtnStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    fontSize: "0.875rem",
    fontWeight: 700,
    color: S.primary,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    cursor: "pointer",
    fontFamily: "Plus Jakarta Sans, sans-serif",
  };

  return (
    <div style={{
      background: S.surface,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      fontFamily: "Plus Jakarta Sans, sans-serif",
      color: S.onSurface,
    }}>
      <BeneficiaryStyle />
      <main style={{ width: "100%", maxWidth: "42rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <AmbientCard maxWidth="42rem">

          {/* ── Step 1: Email ── */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div style={{ width: "100%", textAlign: "center" }}>
                <CardLogo />
                <h1 style={{ fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.03em", color: S.onSurface, margin: "0 0 0.5rem" }}>
                  Reset Password
                </h1>
                <p style={{ fontSize: "1rem", fontWeight: 500, color: S.onSurfaceVariant, opacity: 0.8, maxWidth: "24rem", margin: "0 auto", lineHeight: 1.5 }}>
                  Enter your registered email address and we&apos;ll send you a verification code.
                </p>
              </div>
              <div style={{ width: "100%", maxWidth: "28rem", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div>
                  <FieldLabel>Email Address</FieldLabel>
                  <TextInput
                    type="email"
                    placeholder="name@hopecard.com"
                    leadIcon={<Mail size={20} />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p style={errorBannerStyle}>{error}</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <PrimaryBtn label={isSubmitting ? "Sending..." : "Send Verification Code"} disabled={isSubmitting} />
                  <div style={{ textAlign: "center" }}>
                    <a href="/beneficiary/login" style={{ ...backBtnStyle, textDecoration: "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}>
                      <ArrowLeft size={16} /> Back to Login
                    </a>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div style={{ width: "100%", textAlign: "center" }}>
                <CardLogo />
                <h1 style={{ fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.03em", color: S.onSurface, margin: "0 0 0.5rem" }}>
                  Enter Verification Code
                </h1>
                <p style={{ fontSize: "1rem", fontWeight: 500, color: S.onSurfaceVariant, opacity: 0.8, maxWidth: "24rem", margin: "0 auto", lineHeight: 1.5 }}>
                  We&apos;ve sent a 6-digit code to{" "}
                  <strong style={{ color: S.onSurface }}>{email}</strong>.
                  Please enter it below.
                </p>
              </div>
              <div style={{ width: "100%", maxWidth: "28rem", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                  {OTP_DIGIT_IDS.map((id, i) => (
                    <OtpDigit
                      key={id}
                      index={i}
                      value={digits[i]}
                      inputRef={refs.current[i]}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                    />
                  ))}
                </div>
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {canResend ? (
                    <p style={{ fontSize: "0.875rem", color: S.onSurfaceVariant, margin: 0 }}>
                      Didn&apos;t receive the code?
                    </p>
                  ) : (
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: `${S.onSurfaceVariant}cc`, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", margin: 0 }}>
                      <Clock size={16} />
                      Resend code in <strong style={{ color: S.primary }}>{formatTime(resendSeconds)}</strong>
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "0.875rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: canResend ? S.primary : `${S.onSurfaceVariant}66`,
                      cursor: canResend ? "pointer" : "not-allowed",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    Resend OTP
                  </button>
                </div>
                {error && <p style={errorBannerStyle}>{error}</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <PrimaryBtn label={isSubmitting ? "Verifying..." : "Verify Code"} disabled={isSubmitting} />
                  <div style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={() => { setStep("email"); setError(null); setDigits(new Array(OTP_LENGTH).fill("")); }}
                      style={backBtnStyle}
                    >
                      <ArrowLeft size={16} /> Change Email
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* ── Step 3: New Password ── */}
          {step === "password" && (
            <form onSubmit={handleUpdatePassword} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div style={{ width: "100%", textAlign: "center" }}>
                <CardLogo />
                <h1 style={{ fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.03em", color: S.onSurface, margin: "0 0 0.5rem" }}>
                  Set New Password
                </h1>
                <p style={{ fontSize: "1rem", fontWeight: 500, color: S.onSurfaceVariant, opacity: 0.8, maxWidth: "24rem", margin: "0 auto", lineHeight: 1.5 }}>
                  Create a new password for your account. Use at least 8 characters including a number.
                </p>
              </div>
              <div style={{ width: "100%", maxWidth: "28rem", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div>
                  <FieldLabel>New Password</FieldLabel>
                  <div style={{ position: "relative" }}>
                    <TextInput
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      leadIcon={<Lock size={20} />}
                      style={{ paddingRight: "3rem" }}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: S.onSurfaceVariant, display: "flex" }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <FieldLabel>Confirm New Password</FieldLabel>
                  <div style={{ position: "relative" }}>
                    <TextInput
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      leadIcon={<Lock size={20} />}
                      style={{ paddingRight: "3rem" }}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: S.onSurfaceVariant, display: "flex" }}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {error && <p style={errorBannerStyle}>{error}</p>}
                <PrimaryBtn label={isSubmitting ? "Updating..." : "Update Password"} disabled={isSubmitting} />
              </div>
            </form>
          )}

        </AmbientCard>
        <BeneficiaryFooter />
      </main>
    </div>
  );
}
