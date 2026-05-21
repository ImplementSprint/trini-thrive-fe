"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthLayout from '@/components/AuthLayout';

type ForgotStep = "request" | "sent" | "create";

export default function DispatcherForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<ForgotStep>("request");
  const [contact, setContact] = useState("");
  const [showPass, setShowPass] = useState(false);

  const steps: ForgotStep[] = ["request", "sent", "create"];

  function renderStep() {
    if (step === "request") {
      return (
        <>
          <header className="auth-form-head">
            <span className="auth-badge">Account Recovery</span>
            <h2 className="auth-form-title">Security Reset</h2>
            <p className="auth-form-sub">
              Enter your official email or dispatcher ID to receive a secure recovery code.
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
              <label>Registration Contact</label>
              <input
                type="text"
                placeholder="e.g. dispatch.id@brgy.gov.ph"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>

            <div className="auth-info-box">
              âš ï¸ In high-alert scenarios, password resets may require additional approval from the system administrator.
            </div>

            <button className="auth-submit" type="submit">
              Request Recovery Link
            </button>
          </form>
        </>
      );
    }

    if (step === "sent") {
      return (
        <div style={{ textAlign: "center" }}>
          <div className="auth-success-icon">ðŸ”‘</div>
          <header className="auth-form-head">
            <span className="auth-badge">Code Sent</span>
            <h2 className="auth-form-title">Verify Inbox</h2>
            <p className="auth-form-sub">
              A recovery link has been dispatched to <strong>{contact}</strong>.
            </p>
          </header>

          <button
            className="auth-submit"
            type="button"
            onClick={() => setStep("create")}
          >
            Enter New Credentials
          </button>
        </div>
      );
    }

    return (
      <>
        <header className="auth-form-head">
          <span className="auth-badge">New Password</span>
          <h2 className="auth-form-title">Secure Portal</h2>
          <p className="auth-form-sub">Update your security credentials for the dispatcher dashboard.</p>
        </header>

        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/dispatcher/login");
          }}
        >
          <div className="auth-field">
            <label>New Passphrase</label>
            <div className="auth-input-wrap">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Must be alphanumeric"
                required
              />
            </div>
          </div>

          <button className="auth-submit" type="submit">
            Apply New Credentials
          </button>
        </form>
      </>
    );
  }

  return (
    <AuthLayout
      persona="dispatcher"
      portalName="Dispatcher Portal"
      eyebrow="Access Recovery"
      headline={
        <>
          Restore.<br />Re-verify.<br />
          <span className="auth-headline-accent">Respond.</span>
        </>
      }
      subline="Regain access to your command center credentials. Ensure the network remains active during the emergency response phase."
      brandAddon={
        <div className="auth-steps-timeline">
          {[
            { n: 1, label: "Identity Request", active: step === "request", done: step !== "request" },
            { n: 2, label: "Verification Sent", active: step === "sent", done: step === "create" },
            { n: 3, label: "Final Authorization", active: step === "create", done: false },
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
