"use client";

import React, { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import {
  C, AuthShell, AuthTabs, SocialButtons, OrDivider,
  SubmitBtn, MobileLogo,
} from "@/donor-components/auth-shared";

function buildBanMessage(reason: string | null, expiresAt: string | null): string {
  const reasonPart = reason ? ` Reason: ${reason}` : '';
  if (expiresAt) {
    const date = new Date(expiresAt);
    const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `Your account has been banned until ${dateStr} (${days} day${days !== 1 ? 's' : ''}).${reasonPart}`;
  }
  return `Your account has been permanently banned.${reasonPart}`;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/donor/home';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const persona = cookies.find(c => c.startsWith('persona='))?.split('=')[1];
    if (persona && persona !== 'digital-donor') {
      document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    }
  }, []);

  useEffect(() => {
    if (searchParams.get('banned') === '1') {
      setErrorMessage(buildBanMessage(
        searchParams.get('reason'),
        searchParams.get('expires'),
      ));
    }
  }, [searchParams]);

  const togglePassword = useCallback(() => setShowPassword((p) => !p), []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/hopecard/donor/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.reason === 'banned') {
          setErrorMessage(buildBanMessage(data.status_reason ?? null, data.status_expires_at ?? null));
          return;
        }
        // Handle approval status case
        if (data.reason === 'pending_approval') {
          if (data.status === 'rejected') {
            setErrorMessage(
              'Unfortunately, your account application has been rejected. If you believe this is an error, please contact support for assistance.'
            );
          } else {
            // status === 'pending'
            setErrorMessage(
              'Your account is still under review. You will receive an email once your account is approved. Thank you for your patience!'
            );
          }
          return;
        }
        throw new Error(data.error || 'Login failed');
      }

      if (data.token && data.session) {
        localStorage.setItem('donor_token', data.token);
        const { supabase } = await import('@/donor-lib/supabase-client');
        await supabase.auth.setSession(data.session);
        document.cookie = 'persona=digital-donor; path=/; SameSite=Strict';
        router.push(redirectTo || '/donor/home');
        return;
      }
      setErrorMessage('Authentication failed. Please try again.');
      return;
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.875rem", fontWeight: 700, color: C.onPrimaryFixed, margin: "0 0 0.5rem" }}>
            Welcome Back
          </h2>
          <p style={{ color: C.onSurfaceVariant, margin: 0, fontFamily: "Manrope, sans-serif" }}>
            Continue your journey of giving and transform lives today.
          </p>
        </div>

        {/* Tab switcher */}
        <AuthTabs active="login" onTabChange={(tab) => tab === "signup" && router.push('/donor/signup')} />

        {/* Social buttons */}
        <SocialButtons />

        {/* Divider */}
        <OrDivider />

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

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: C.onSurfaceVariant, paddingLeft: "0.25rem", fontFamily: "Manrope, sans-serif" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: C.onSurfaceVariant, display: "flex" }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "3rem",
                  paddingRight: "1rem",
                  paddingTop: "1rem",
                  paddingBottom: "1rem",
                  borderRadius: "1rem",
                  background: C.surfaceContainerHighest,
                  border: "none",
                  outline: "none",
                  color: C.onSurface,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "1rem",
                  transition: "background 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
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
            </div>
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: "0.25rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600, color: C.onSurfaceVariant, fontFamily: "Manrope, sans-serif" }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => router.push('/donor/forgot-password')}
                style={{ 
                  background: "none",
                  border: "none",
                  fontSize: "0.75rem", 
                  fontWeight: 700, 
                  color: C.coralRose, 
                  textDecoration: "none",
                  cursor: "pointer",
                  fontFamily: "Manrope, sans-serif"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: C.onSurfaceVariant, display: "flex" }}>
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "3rem",
                  paddingRight: "3rem",
                  paddingTop: "1rem",
                  paddingBottom: "1rem",
                  borderRadius: "1rem",
                  background: C.surfaceContainerHighest,
                  border: "none",
                  outline: "none",
                  color: C.onSurface,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "1rem",
                  transition: "background 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
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
                  color: C.onSurfaceVariant, 
                  display: "flex" 
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
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
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Create account link */}
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p style={{ color: C.onSurfaceVariant, fontWeight: 500, fontSize: "0.875rem", margin: 0, fontFamily: "Manrope, sans-serif" }}>
            New to HOPECARD?{" "}
            <button
              type="button"
              onClick={() => router.push('/donor/signup')}
              style={{
                background: "none",
                border: "none",
                color: C.onPrimaryFixed, 
                fontWeight: 700, 
                marginLeft: "0.25rem", 
                textDecoration: "none",
                cursor: "pointer",
                fontFamily: "Manrope, sans-serif",
                fontSize: "0.875rem"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}

export default function LoginScreen() {
  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
