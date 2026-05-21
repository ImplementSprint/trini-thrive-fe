"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthLayout from '@/components/AuthLayout';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.cookie = 'persona=admin; path=/; SameSite=Strict';
    router.push("/admin/beforecalamity");
  }

  return (
    <AuthLayout
      persona="admin"
      portalName="System Administration"
      eyebrow="Root Operations"
      headline={
        <>
          Central Controls.<br />
          System Integrity.<br />
          <span className="auth-headline-accent">Global Oversight.</span>
        </>
      }
      subline="Manage regional settings, authorize staff credentials, and oversee the entire emergency response platform from the master console."
      badgeText="Root Access"
      formTitle="Admin Console"
      formSub="Sign in to manage the Damayan network."
      switchText="Looking for a staff portal?"
      switchLink="/"
    >
      <form className="auth-form" onSubmit={handleLogin}>
        <div className="auth-field">
          <label htmlFor="admin-username">Root ID</label>
          <input
            id="admin-username"
            name="admin-username"
            type="text"
            placeholder="admin.terminal"
            autoComplete="username"
            required
          />
        </div>

        <div className="auth-field">
          <div className="auth-field-row">
            <label htmlFor="admin-password">Master Key</label>
          </div>
          <div className="auth-input-wrap">
            <input
              id="admin-password"
              name="admin-password"
              type={showPass ? "text" : "password"}
              placeholder="Enter master password"
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
          Initialize System Admin Dashboard
        </button>
      </form>
    </AuthLayout>
  );
}
