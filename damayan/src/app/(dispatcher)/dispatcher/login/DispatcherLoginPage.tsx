"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthLayout from '@/components/AuthLayout';

export default function DispatcherLoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.cookie = 'persona=dispatcher; path=/; SameSite=Strict';
    router.push("/dispatcher/beforecalamity");
  }

  return (
    <AuthLayout
      persona="dispatcher"
      portalName="Dispatcher Portal"
      eyebrow="Dispatch & Coordination"
      headline={
        <>
          Unified Commands.<br />
          Rapid Rescues.<br />
          <span className="auth-headline-accent">Real-time Relief.</span>
        </>
      }
      subline="Access the live dispatch map, incident reports, and emergency resource allocation to coordinate rescue operations across all sites."
      badgeText="Dispatcher Login"
      formTitle="Mission Control"
      formSub="Sign in to oversee the emergency response network."
      switchText="Need the staff portal?"
      switchLink="/"
    >
      <form className="auth-form" onSubmit={handleLogin}>
        <div className="auth-field">
          <label htmlFor="dispatcher-username">Username</label>
          <input
            id="dispatcher-username"
            name="dispatcher-username"
            type="text"
            placeholder="dispatcher.id"
            autoComplete="username"
            required
          />
        </div>

        <div className="auth-field">
          <div className="auth-field-row">
            <label htmlFor="dispatcher-password">Password</label>
          </div>
          <div className="auth-input-wrap">
            <input
              id="dispatcher-password"
              name="dispatcher-password"
              type={showPass ? "text" : "password"}
              placeholder="Enter your security credential"
              autoComplete="current-password"
              required
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
          Log In to Dispatch Dashboard
        </button>
      </form>
    </AuthLayout>
  );
}
