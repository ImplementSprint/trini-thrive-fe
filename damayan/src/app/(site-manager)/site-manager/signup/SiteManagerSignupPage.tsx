"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthLayout from '@/components/AuthLayout';

export default function SiteManagerSignupPage() {
  const router = useRouter();
  const [selectedIdName, setSelectedIdName] = useState("No file selected");

  function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/site-manager/login");
  }

  return (
    <AuthLayout
      persona="sm"
      portalName="Site Manager Portal"
      eyebrow="Operations Command"
      headline={
        <>
          Scale Your<br />
          <span className="auth-headline-accent">Response Power.</span>
        </>
      }
      subline="Register for the site manager portal to validate your credentials, manage supply logs, and access the rescue network overview."
      badgeText="Registration"
      formTitle="Manager Account"
      formSub="Complete this form to activate your site operations dashboard."
      switchText="Already have an account?"
      switchLink="/site-manager/login"
    >
      <form className="auth-form" onSubmit={handleRegister}>
        <div className="auth-field">
          <label>Full Name</label>
          <input type="text" placeholder="Site Manager Full Name" required />
        </div>

        <div className="auth-field">
          <label>Username</label>
          <input type="text" placeholder="manager.username" required />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input type="password" placeholder="Create a secure password" required />
        </div>

        <div className="auth-field">
          <label>Government ID (Required for Verification)</label>
          <div className="auth-input-wrap" style={{ cursor: "pointer" }}>
            <input
              id="signup-id"
              type="file"
              accept=".jpg,.jpeg,.png"
              required
              style={{ 
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: "pointer",
                zIndex: 2
              }}
              onChange={(event) =>
                setSelectedIdName(
                  event.target.files?.[0]?.name ?? "No file selected"
                )
              }
            />
            <div 
              className="auth-upload-backdrop" 
              style={{ 
                width: "100%",
                padding: "24px",
                borderRadius: "16px",
                border: "2px dashed var(--auth-line)",
                textAlign: "center",
                backgroundColor: "rgba(0,0,0,0.01)",
                transition: "all 0.2s ease"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "2rem", display: "block", marginBottom: "8px", color: "#2E7D32" }}>description</span>
              <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--auth-accent)" }}>
                {selectedIdName === "No file selected" ? "Upload Official ID" : "ID Cached"}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "var(--auth-muted)" }}>
                {selectedIdName === "No file selected" ? "JPG or PNG â€¢ Max 5MB" : selectedIdName}
              </span>
            </div>
          </div>
        </div>

        <button className="auth-submit" type="submit">
          Submit Registration
        </button>
      </form>

      <p className="auth-switch-copy">
        Already have an account? <Link href="/site-manager/login">Log in here</Link>
      </p>
    </AuthLayout>
  );
}
