"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthLayout from '@/components/AuthLayout';

export default function CitizenAuthPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.cookie = 'persona=citizen; path=/; SameSite=Strict';
    router.push("/citizen/beforecalamity");
  }

  return (
    <AuthLayout
      persona="citizen"
      portalName="Affected Citizen Portal"
      eyebrow="Community Emergency Access"
      headline={
        <>
          Stay Ready.<br />Stay Safe.<br />
          <span className="auth-headline-accent">Stay Connected.</span>
        </>
      }
      subline="Access real-time alerts, your QR ID, evacuation routes, and relief aid updates â€” all in one place."
      badgeText="Citizen Login"
      formTitle="Welcome back"
      formSub="Sign in to access your citizen dashboard."
      switchText="Need a staff portal?"
      switchLink="/"
    >
      <form className="auth-form" onSubmit={handleLogin}>
        <div className="auth-field">
          <label htmlFor="citizen-username">Username</label>
          <input
            id="citizen-username"
            name="citizen-username"
            type="text"
            placeholder="e.g. juan.delacruz"
            autoComplete="username"
          />
        </div>

        <div className="auth-field">
          <div className="auth-field-row">
            <label htmlFor="citizen-password">Password</label>
            <Link href="/citizen/forgot-password" className="auth-forgot-link">
              Forgot password?
            </Link>
          </div>
          <div className="auth-input-wrap">
            <input
              id="citizen-password"
              name="citizen-password"
              type={showPass ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-toggle-pass"
              onClick={() => setShowPass((v) => !v)}
              aria-label="Toggle password visibility"
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button className="auth-submit" type="submit">
          Sign In to Citizen Dashboard
        </button>
      </form>

      <p className="auth-switch-copy">
        Don&apos;t have an account?{" "}
        <Link href="/citizen/signup">Create one here</Link>
      </p>
    </AuthLayout>
  );
}
