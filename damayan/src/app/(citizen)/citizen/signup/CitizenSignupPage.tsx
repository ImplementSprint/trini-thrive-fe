"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthLayout from '@/components/AuthLayout';

type SignupStep = "FORM" | "SUCCESS";

const verificationSteps = [
  "Account Creation",
  "Identity Submission",
  "Staff Verification",
  "Portal Activation",
];

export default function CitizenSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>("FORM");
  const [selectedIdName, setSelectedIdName] = useState("No file selected");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("SUCCESS");
  }

  if (step === "SUCCESS") {
    return (
      <AuthLayout
        persona="citizen"
        portalName="Registration Success"
        eyebrow="Join the Network"
        headline={
          <>
            Welcome to the<br />
            <span className="auth-headline-accent">Network.</span>
          </>
        }
        subline="Your account is being finalized. You can now access your citizen dashboard and secure your digital credentials."
      >
        <div style={{ textAlign: "center" }}>
          <div className="auth-success-icon">âœ“</div>
          
          <h2 className="auth-form-title" style={{ marginBottom: "16px" }}>Registration Complete!</h2>
          <p className="auth-form-sub" style={{ marginBottom: "40px" }}>
            Your digital preparedness profile is active. Secure your QR ID below for rapid checkpoint entry.
          </p>
          
          <div className="qr-container" style={{ 
            margin: "0 auto 40px", 
            padding: "24px", 
            backgroundColor: "#fff", 
            borderRadius: "32px", 
            border: "1px solid rgba(0,0,0,0.06)", 
            display: "inline-block",
            boxShadow: "0 20px 48px rgba(0,0,0,0.04)"
          }}>
            <div style={{ width: "200px", height: "200px", backgroundColor: "#000", position: "relative", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "12px", left: "12px", right: "12px", bottom: "12px", border: "12px solid #fff", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(4, 1fr)", gap: "6px" }}>
                {[...Array(16)].map((_, i) => <div key={i} style={{ backgroundColor: i % 3 === 0 ? "#fff" : "transparent" }} />)}
              </div>
            </div>
            <p style={{ marginTop: "20px", fontWeight: "900", fontSize: "12px", letterSpacing: "3px", color: "#1a1c19" }}>IND-992-01-DM</p>
          </div>

          <div>
            <button 
              onClick={() => router.push("/citizen/beforecalamity")} 
              className="auth-submit"
              style={{ maxWidth: "320px", margin: "0 auto" }}
            >
              Enter Citizen Dashboard
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      persona="citizen"
      portalName="Citizen Registration"
      eyebrow="Join the Network"
      headline={
        <>
          Create Your<br />
          <span className="auth-headline-accent">Citizen Account.</span>
        </>
      }
      subline="Register for the citizen portal to receive real-time alerts, access your digital relief ID, and report incidents directly."
      badgeText="Sign Up"
      formTitle="Secure Registration"
      formSub="Complete the form to activate your digital preparedness profile."
      switchText="Already have an account?"
      switchLink="/citizen/login"
      brandAddon={
        <div className="auth-features" style={{ marginTop: "20px" }}>
          <strong style={{ display: "block", fontSize: "0.72rem", fontWeight: "800", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "16px" }}>Verification Path</strong>
          {verificationSteps.map((s, index) => (
            <div key={s} className="auth-feature-item" style={{ padding: "12px 16px", borderRadius: "12px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: "900", color: "#81c784", width: "24px" }}>0{index + 1}</span>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "#fff" }}>{s}</p>
            </div>
          ))}
        </div>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label>Full Name</label>
          <input type="text" placeholder="Juan Dela Cruz" required />
        </div>

        <div className="auth-field">
          <label>Username</label>
          <input type="text" placeholder="juan.delacruz" required />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input type="password" placeholder="Create a strong password" required />
        </div>

        <div className="auth-field">
          <label>Government ID (Recommended)</label>
          <div className="auth-input-wrap" style={{ cursor: "pointer" }}>
            <input
              id="citizen-id"
              type="file"
              accept=".jpg,.jpeg,.png"
              style={{ 
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: "pointer",
                zIndex: 2
              }}
              onChange={(e) => setSelectedIdName(e.target.files?.[0]?.name ?? "No file selected")}
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
                {selectedIdName === "No file selected" ? "Click to upload ID photo" : "ID Uploaded"}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "var(--auth-muted)" }}>
                {selectedIdName === "No file selected" ? "JPG or PNG â€¢ Max 5MB" : selectedIdName}
              </span>
            </div>
          </div>
        </div>

        <button className="auth-submit" type="submit" style={{ marginTop: "16px" }}>Complete Registration</button>
      </form>
    </AuthLayout>
  );
}
