"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthLayout from '@/components/AuthLayout';

type ForgotStep = "request" | "sent" | "create";

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<ForgotStep>("request");
  const [contact, setContact] = useState("");

  const steps: ForgotStep[] = ["request", "sent", "create"];

  function renderStep() {
    if (step === "request") {
      return (
        <>
          <header className="auth-form-head">
            <span className="auth-badge">Root Recovery</span>
            <h2 className="auth-form-title">Master Reset</h2>
            <p className="auth-form-sub">
              Enter your master recovery email or official contact hash.
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
              <label>Administrator Contact</label>
              <input
                type="text"
                placeholder="root.admin@brgy.gov.ph"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>

            <div className="auth-info-box">
              âš ï¸ Root password resets are logged and require manual override from the hardware terminal for security compliance.
            </div>

            <button className="auth-submit" type="submit">
              Initialize Recovery Protocol
            </button>
          </form>
        </>
      );
    }

    if (step === "sent") {
      return (
        <div style={{ textAlign: "center" }}>
          <div className="auth-success-icon">ðŸ”</div>
          <header className="auth-form-head">
            <span className="auth-badge">Auth Sent</span>
            <h2 className="auth-form-title">Secure Dispatch</h2>
            <p className="auth-form-sub">
              A recovery token has been sent to <strong>{contact}</strong>.
            </p>
          </header>

          <button
            className="auth-submit"
            type="button"
            onClick={() => setStep("create")}
          >
            Proceed to Password Initialization
          </button>
        </div>
      );
    }

    return (
      <>
        <header className="auth-form-head">
          <span className="auth-badge">Master Key</span>
          <h2 className="auth-form-title">New Credentials</h2>
          <p className="auth-form-sub">Overwrite your root security credentials.</p>
        </header>

        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/admin/login");
          }}
        >
          <div className="auth-field">
            <label>New Master Password</label>
            <div className="auth-input-wrap">
              <input
                type="password"
                placeholder="High-entropy passphrase required"
                required
              />
            </div>
          </div>

          <button className="auth-submit" type="submit">
            Confirm Master Reset
          </button>
        </form>
      </>
    );
  }

  return (
    <AuthLayout
      persona="admin"
      portalName="System Administration"
      eyebrow="Security Override"
      headline={
        <>
          Restore.<br />Authorize.<br />
          <span className="auth-headline-accent">Control.</span>
        </>
      }
      subline="Initiate high-privileged account recovery. Ensure system integrity is maintained during master credential updates."
      brandAddon={
        <div className="auth-steps-timeline">
          {[
            { n: 1, label: "Identity Hash", active: step === "request", done: step !== "request" },
            { n: 2, label: "Token Dispatch", active: step === "sent", done: step === "create" },
            { n: 3, label: "Master Set", active: step === "create", done: false },
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
