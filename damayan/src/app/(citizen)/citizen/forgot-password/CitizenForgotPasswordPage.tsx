"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthLayout from '@/components/AuthLayout';

type ForgotStep = "request" | "sent" | "create";

export default function CitizenForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<ForgotStep>("request");
  const [contact, setContact] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const steps: ForgotStep[] = ["request", "sent", "create"];

  function renderStep() {
    if (step === "request") {
      return (
        <>
          <header className="auth-form-head">
            <span className="auth-badge">Password Reset</span>
            <h2 className="auth-form-title">Forgot your<br />password?</h2>
            <p className="auth-form-sub">
              Enter your registered email or phone number. We'll send you a
              secure reset link right away.
            </p>
          </header>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              setStep("sent");
            }}
          >
            <div className="auth-field">
              <label htmlFor="fp-contact">Email or Phone Number</label>
              <input
                id="fp-contact"
                type="text"
                placeholder="e.g. juan@email.com or 09171234567"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>

            <div className="auth-info-box">
              <span className="material-symbols-outlined" style={{fontSize:"1rem",verticalAlign:"middle",marginRight:"0.35rem"}}>tips_and_updates</span> We'll send a reset link to your registered email address or an
              SMS to your phone number â€” whichever you used when you signed up.
            </div>

            <button className="auth-submit" type="submit">
              Send Reset Link
            </button>
          </form>

          <Link href="/citizen/login" className="auth-back-link">
            â† Back to Sign In
          </Link>
        </>
      );
    }

    if (step === "sent") {
      return (
        <div style={{ textAlign: "center" }}>
          <div className="auth-success-icon"><span className="material-symbols-outlined" style={{fontSize:"2.5rem",color:"var(--citizen-primary,#2E7D32)"}}>mark_email_read</span></div>
          <header className="auth-form-head" style={{ textAlign: "center" }}>
            <span className="auth-badge">Link Sent</span>
            <h2 className="auth-form-title">Check your<br />inbox</h2>
            <p className="auth-form-sub">
              We sent a password reset link to <strong>{contact || "your registered contact"}</strong>.
              Check your email or SMS messages.
            </p>
          </header>

          <div className="auth-info-box">
            <span className="material-symbols-outlined" style={{fontSize:"1rem",verticalAlign:"middle",marginRight:"0.35rem"}}>smartphone</span> The link expires in <strong>15 minutes</strong>. If you don't see it,
            check your spam folder or request a new link below.
          </div>

          <button
            className="auth-submit"
            type="button"
            onClick={() => setStep("create")}
          >
            I Received the Link â€” Continue
          </button>

          <button
            type="button"
            onClick={() => setStep("request")}
            className="auth-back-link"
            style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}
          >
            â† Resend to a Different Contact
          </button>
        </div>
      );
    }

    // Step 3: Create new password
    return (
      <>
        <header className="auth-form-head">
          <span className="auth-badge">New Password</span>
          <h2 className="auth-form-title">Create a new<br />password</h2>
          <p className="auth-form-sub">
            Choose a strong password. It should be at least 8 characters long.
          </p>
        </header>

        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/citizen/login");
          }}
        >
          <div className="auth-field">
            <label htmlFor="fp-new-pass">New Password</label>
            <div className="auth-input-wrap">
              <input
                id="fp-new-pass"
                type={showPass ? "text" : "password"}
                placeholder="At least 8 characters"
                required
              />
              <button
                type="button"
                className="auth-toggle-pass"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="fp-confirm-pass">Confirm New Password</label>
            <div className="auth-input-wrap">
              <input
                id="fp-confirm-pass"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your new password"
                required
              />
              <button
                type="button"
                className="auth-toggle-pass"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button className="auth-submit" type="submit">
            Save New Password
          </button>
        </form>

        <Link href="/citizen/login" className="auth-back-link">
          â† Back to Sign In
        </Link>
      </>
    );
  }

  return (
    <AuthLayout
      persona="citizen"
      portalName="Affected Citizen Portal"
      eyebrow="Account Recovery"
      headline={
        <>
          Reset.<br />Recover.<br />
          <span className="auth-headline-accent">Re-enter.</span>
        </>
      }
      subline="Regain access to your emergency dashboard in just three quick steps â€” no waiting, no hassle."
      brandAddon={
        <div className="auth-steps-timeline">
          {[
            { n: 1, label: "Request Reset Link", active: step === "request", done: step !== "request" },
            { n: 2, label: "Receive via Email / SMS", active: step === "sent", done: step === "create" },
            { n: 3, label: "Create New Password", active: step === "create", done: false },
          ].map((s) => (
            <div key={s.n} className={`auth-timeline-item${s.active ? " is-active" : ""}${s.done ? " is-done" : ""}`}>
              <div className="auth-timeline-node">{s.done ? "âœ“" : s.n}</div>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      }
    >
      <div className="auth-step-indicator">
        {steps.map((s) => (
          <div
            key={s}
            className={`auth-step-dot${step === s ? " is-active" : ""}${steps.indexOf(s) < steps.indexOf(step) ? " is-done" : ""}`}
          />
        ))}
      </div>
      {renderStep()}
    </AuthLayout>
  );
}
