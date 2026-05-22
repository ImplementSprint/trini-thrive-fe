"use client";

import { useRouter } from "next/navigation";
import AuthLayout from '@/components/AuthLayout';

export default function AdminSignupPage() {
  const router = useRouter();

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    router.push("/admin/login");
  }

  return (
    <AuthLayout
      persona="admin"
      portalName="System Administration"
      eyebrow="Privileged Access"
      headline={
        <>
          Initialize<br />
          <span className="auth-headline-accent">Network Admin.</span>
        </>
      }
      subline="Registration for centralized administrators and regional managers. Credentials submitted here require root physical verification."
      badgeText="Root Onboarding"
      formTitle="New Admin profile"
      formSub="Submit for credential initialization."
      switchText="Already have root access?"
      switchLink="/admin/login"
    >
      <form className="auth-form" onSubmit={handleApply}>
        <div className="auth-field">
          <label>Root Administrator Name</label>
          <input type="text" placeholder="Authorized Personnel" required />
        </div>

        <div className="auth-field">
          <label>Department / Agency</label>
          <input type="text" placeholder="e.g., OCD, DSWD, LGU" required />
        </div>

        <div className="auth-field">
          <label>Auth Key</label>
          <input type="password" placeholder="Terminal authorization key" required />
        </div>

        <button className="auth-submit" type="submit">
          Request System Access
        </button>
      </form>
    </AuthLayout>
  );
}
