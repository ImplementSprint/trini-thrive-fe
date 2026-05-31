// app/login/login-form.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import { createClient } from "@/beneficiary-utils/supabase/client";
import { S, FieldLabel, TextInput, PrimaryBtn } from "@/app/(beneficiary)/beneficiary/shared/beneficiary-shared";

interface LoginFormProps {
  confirmed?: boolean;
  linkExpired?: boolean;
  passwordReset?: boolean;
}

type BlockCode = 'PENDING_APPROVAL' | 'REJECTED' | 'BANNED' | 'SUSPENDED';

interface BlockInfo {
  code: BlockCode;
  message: string;
  reason?: string | null;
}

export function LoginForm({ confirmed, linkExpired, passwordReset }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockInfo, setBlockInfo] = useState<BlockInfo | null>(null);
  const [hashLinkExpired, setHashLinkExpired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Clear stale persona cookie on mount
  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const persona = cookies.find(c => c.startsWith('persona='))?.split('=')[1];
    if (persona && persona !== 'beneficiary') {
      document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    }
  }, []);

  // Detect Supabase auth errors sent via URL hash (e.g. otp_expired from email confirmation)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const errorCode = params.get('error_code');
    const errorDesc = params.get('error_description') ?? '';
    if (errorCode === 'otp_expired' || params.get('error') === 'access_denied') {
      const msg = errorDesc
        ? decodeURIComponent(errorDesc.replace(/\+/g, ' '))
        : 'This confirmation link has expired or is invalid. Please sign up again.';
      setHashLinkExpired(true);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setError(msg);
    }
  }, []);

  const togglePassword = useCallback(() => setShowPassword((p) => !p), []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBlockInfo(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/beneficiary/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const BLOCK_CODES: BlockCode[] = ['PENDING_APPROVAL', 'REJECTED', 'BANNED', 'SUSPENDED'];
        if (data.code && BLOCK_CODES.includes(data.code as BlockCode)) {
          setBlockInfo({ code: data.code, message: data.message, reason: data.reason ?? null });
        } else {
          setError(data.message || data.error || 'Something went wrong, please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      if (!data.token) {
        setError('Something went wrong, please try again.');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('beneficiary_token', data.token);
      document.cookie = `beneficiary_token=${data.token}; path=/; SameSite=Strict`;

      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.signInWithPassword({ email, password });
      if (sessionError) {
        console.warn('Supabase session error:', sessionError.message);
      }

      document.cookie = 'persona=beneficiary; path=/; SameSite=Strict';
      router.push('/beneficiary/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong, please try again.');
      setIsSubmitting(false);
    }
  };

  const banner = (bg: string, color: string, border: string, children: React.ReactNode) => (
    <div style={{ borderRadius: "0.75rem", background: bg, padding: "0.875rem 1rem", fontSize: "0.875rem", color, border: `1px solid ${border}`, fontFamily: "Plus Jakarta Sans, sans-serif", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      {children}
    </div>
  );

  const infoBannerStyle = { borderRadius: "0.75rem", background: "#e8f4fd", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#1a5276", margin: 0, fontFamily: "Plus Jakarta Sans, sans-serif" };
  const errorBannerStyle = { borderRadius: "0.75rem", background: S.errorContainer, padding: "0.75rem 1rem", fontSize: "0.875rem", color: S.onErrorContainer, margin: 0, fontFamily: "Plus Jakarta Sans, sans-serif" };

  const renderBlockBanner = () => {
    if (!blockInfo) return null;
    const { code, message, reason } = blockInfo;

    if (code === 'PENDING_APPROVAL') {
      return banner("#e8f4fd", "#1a5276", "#aed6f1",
        <>
          <span style={{ fontWeight: 700 }}>Application Under Review</span>
          <span>{message}</span>
        </>
      );
    }
    if (code === 'REJECTED') {
      return banner(S.errorContainer, S.onErrorContainer, "#f1948a",
        <>
          <span style={{ fontWeight: 700 }}>Application Rejected</span>
          <span>{message}</span>
          {reason && <span style={{ marginTop: "0.25rem", opacity: 0.85 }}>Reason: {reason}</span>}
        </>
      );
    }
    if (code === 'BANNED') {
      return banner("#2d0000", "#ffcdd2", "#7b0000",
        <>
          <span style={{ fontWeight: 700 }}>Account Banned</span>
          <span>{message}</span>
          {reason && <span style={{ marginTop: "0.25rem", opacity: 0.85 }}>Reason: {reason}</span>}
        </>
      );
    }
    if (code === 'SUSPENDED') {
      return banner("#fff3e0", "#7c4700", "#ffcc80",
        <>
          <span style={{ fontWeight: 700 }}>Account Suspended</span>
          <span>{message}</span>
          {reason && <span style={{ marginTop: "0.25rem", opacity: 0.85 }}>Reason: {reason}</span>}
        </>
      );
    }
    return null;
  };

  return (
    <form style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }} onSubmit={handleLogin}>
      {/* Confirmed banner */}
      {confirmed && !error && !blockInfo && (
        <p style={infoBannerStyle}>
          Email confirmed. Enter your credentials to sign in.
        </p>
      )}

      {/* Password reset banner */}
      {passwordReset && !error && !blockInfo && (
        <p style={infoBannerStyle}>
          Password updated successfully. Please sign in with your new password.
        </p>
      )}

      {/* Expired link banner */}
      {(linkExpired || hashLinkExpired) && !error && !blockInfo && (
        <p style={errorBannerStyle}>
          This confirmation link has expired or is invalid. Please sign up again.
        </p>
      )}

      {/* Email */}
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

      {/* Password */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: "0.25rem", marginBottom: "0.5rem" }}>
          <FieldLabel>Password</FieldLabel>
          <Link
            href="/beneficiary/otp"
            style={{ fontSize: "0.625rem", fontWeight: 800, color: S.primary, textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Forgot Password?
          </Link>
        </div>
        <div style={{ position: "relative" }}>
          <TextInput
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leadIcon={<Lock size={20} />}
            style={{ paddingRight: "3rem" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={togglePassword}
            style={{
              position: "absolute",
              right: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: S.onSurfaceVariant,
              display: "flex",
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && <p style={errorBannerStyle}>{error}</p>}
      {renderBlockBanner()}

      <PrimaryBtn label={isSubmitting ? "Signing in..." : "Login"} disabled={isSubmitting} />
    </form>
  );
}
