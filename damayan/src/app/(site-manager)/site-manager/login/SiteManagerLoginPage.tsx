"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthLayout from '@/components/AuthLayout';

export default function SiteManagerLoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.cookie = 'persona=site-manager; path=/; SameSite=Strict';
    router.push("/site-manager/beforecalamity");
  }

  return (
    <AuthLayout
      persona="sm"
      portalName="Site Manager Portal"
      eyebrow="Operations Command"
      headline={
        <>
          Manage Sites.<br />
          Coordinate Relief.<br />
          <span className="auth-headline-accent">Keep Response Moving.</span>
        </>
      }
      subline="Access shelter readiness, evacuee intake, local distribution logs, and on-site response coordination from one operations dashboard."
      badgeText="Site Manager Login"
      formTitle="Welcome back"
      formSub="Sign in to access your site operations dashboard."
      switchText="Need another portal?"
      switchLink="/"
    >
      <form className="auth-form" onSubmit={handleLogin}>
        <div className="auth-field">
          <label htmlFor="site-manager-username">Username</label>
          <input
            id="site-manager-username"
            name="site-manager-username"
            type="text"
            placeholder="e.g. manager.username"
            autoComplete="username"
          />
        </div>

        <div className="auth-field">
          <div className="auth-field-row">
            <label htmlFor="site-manager-password">Password</label>
            <Link href="/site-manager/forgot-password" className="auth-forgot-link">
              Forgot password?
            </Link>
          </div>
          <div className="auth-input-wrap">
            <input
              id="site-manager-password"
              name="site-manager-password"
              type={showPass ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-toggle-pass"
              onClick={() => setShowPass((value) => !value)}
              aria-label="Toggle password visibility"
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button className="auth-submit" type="submit">
          Sign In to Site Manager Dashboard
        </button>
      </form>

      <p className="auth-switch-copy">
        Don&apos;t have an account?{" "}
        <Link href="/site-manager/signup">Create one here</Link>
      </p>
    </AuthLayout>
  );
}
