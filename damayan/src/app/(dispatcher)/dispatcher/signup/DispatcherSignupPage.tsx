"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthLayout from '@/components/AuthLayout';

export default function DispatcherSignupPage() {
  const router = useRouter();
  const [selectedIdName, setSelectedIdName] = useState("No file selected");

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dispatcher/login");
  }

  return (
    <AuthLayout
      persona="dispatcher"
      portalName="Dispatcher Portal"
      eyebrow="Join the Command"
      headline={
        <>
          Coordinate the<br />
          <span className="auth-headline-accent">Crisis Network.</span>
        </>
      }
      subline="Register to join the regional dispatch team. Gain access to real-time incident logs, responder tracking, and resource mapping."
      badgeText="Staff Registration"
      formTitle="Dispatcher Account"
      formSub="Submit your credentials for access authorization."
      switchText="Already have an account?"
      switchLink="/dispatcher/login"
    >
      <form className="auth-form" onSubmit={handleRegister}>
        <div className="auth-field">
          <label>Full Name</label>
          <input type="text" placeholder="Dispatcher Full Name" required />
        </div>

        <div className="auth-field">
          <label>Username</label>
          <input type="text" placeholder="dispatcher.username" required />
        </div>

        <div className="auth-field">
          <label>Temporary Password</label>
          <input type="password" placeholder="Create a temporary password" required />
        </div>

        <div className="auth-field">
          <label>Civil Defense / LGU Credential (ID Photo)</label>
          <div className="auth-input-wrap" style={{ cursor: "pointer" }}>
            <input
              id="dispatcher-id"
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
              <span style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}>ðŸ“„</span>
              <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--auth-accent)" }}>
                {selectedIdName === "No file selected" ? "Upload Official ID" : "ID Uploaded"}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "var(--auth-muted)" }}>
                {selectedIdName === "No file selected" ? "JPG or PNG â€¢ Max 5MB" : selectedIdName}
              </span>
            </div>
          </div>
        </div>

        <button className="auth-submit" type="submit">
          Apply for Dispatcher Access
        </button>
      </form>
    </AuthLayout>
  );
}
