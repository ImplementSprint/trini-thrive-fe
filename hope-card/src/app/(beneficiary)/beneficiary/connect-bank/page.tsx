"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark, ShieldCheck } from "lucide-react";
import { S, BeneficiaryStyle } from "@/app/(beneficiary)/beneficiary/shared/beneficiary-shared";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BankFormState {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ConnectBankPage: React.FC = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [form, setForm] = useState<BankFormState>({
    bankName: "",
    accountHolder: "",
    accountNumber: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (!form.bankName || !form.accountHolder || !form.accountNumber) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/beneficiary/api/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_name: form.bankName,
          account_holder_name: form.accountHolder,
          account_number: form.accountNumber,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "Failed to add bank account. Please try again.");
      } else {
        router.push("/banking-details");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      <BeneficiaryStyle />

      {/* Blurred Background - Banking Details Page */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: "blur(8px)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <iframe
          src="/banking-details"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            pointerEvents: "none",
          }}
          title="Background"
        />
      </div>

      {/* Modal Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(36, 25, 24, 0.1)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "40rem",
            background: S.surfaceContainerLowest,
            borderRadius: "1.5rem",
            boxShadow: "0px 12px 32px rgba(151,69,62,0.06)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{ padding: "3rem 3rem 1.5rem", textAlign: "center" }}>
            <div
              style={{
                width: "5rem",
                height: "5rem",
                borderRadius: "999px",
                background: `${S.primaryContainer}4d`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: S.primary,
                margin: "0 auto 1.5rem",
              }}
            >
              <Landmark size={40} />
            </div>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: S.onSurface,
                margin: "0 0 0.75rem",
              }}
            >
              Connect New Bank Account
            </h2>
            <p
              style={{
                color: S.onSurfaceVariant,
                fontSize: "0.9375rem",
                fontWeight: 500,
                lineHeight: 1.6,
                maxWidth: "28rem",
                margin: "0 auto",
              }}
            >
              Link your external accounts securely to manage all your funds in one place.
            </p>
          </div>

          {/* Form */}
          <div style={{ padding: "1.5rem 3rem 3rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Bank Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label
                htmlFor="bankName"
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  color: S.onSurfaceVariant,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Bank Name
              </label>
              <input
                id="bankName"
                type="text"
                value={form.bankName}
                onChange={handleChange}
                placeholder="Enter your bank name (e.g. Chase Bank)"
                style={{
                  width: "100%",
                  height: "3.5rem",
                  padding: "0 1rem",
                  borderRadius: "0.75rem",
                  border: `1px solid ${S.outlineVariant}4d`,
                  background: `${S.surfaceContainerLow}4d`,
                  color: S.onSurface,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  outline: "none",
                  transition: "all 0.15s",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = S.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${S.primaryContainer}33`;
                  e.currentTarget.style.background = S.surfaceContainerLow;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${S.outlineVariant}4d`;
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = `${S.surfaceContainerLow}4d`;
                }}
              />
            </div>

            {/* Account Holder */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label
                htmlFor="accountHolder"
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  color: S.onSurfaceVariant,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Account Holder Name
              </label>
              <input
                id="accountHolder"
                type="text"
                value={form.accountHolder}
                onChange={handleChange}
                placeholder="Full legal name as on account"
                style={{
                  width: "100%",
                  height: "3.5rem",
                  padding: "0 1rem",
                  borderRadius: "0.75rem",
                  border: `1px solid ${S.outlineVariant}4d`,
                  background: `${S.surfaceContainerLow}4d`,
                  color: S.onSurface,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  outline: "none",
                  transition: "all 0.15s",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = S.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${S.primaryContainer}33`;
                  e.currentTarget.style.background = S.surfaceContainerLow;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${S.outlineVariant}4d`;
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = `${S.surfaceContainerLow}4d`;
                }}
              />
            </div>

            {/* Account Number */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label
                htmlFor="accountNumber"
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  color: S.onSurfaceVariant,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Account Number
              </label>
              <input
                id="accountNumber"
                type="text"
                value={form.accountNumber}
                onChange={handleChange}
                placeholder="Enter your numeric account number"
                style={{
                  width: "100%",
                  height: "3.5rem",
                  padding: "0 1rem",
                  borderRadius: "0.75rem",
                  border: `1px solid ${S.outlineVariant}4d`,
                  background: `${S.surfaceContainerLow}4d`,
                  color: S.onSurface,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  outline: "none",
                  transition: "all 0.15s",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = S.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${S.primaryContainer}33`;
                  e.currentTarget.style.background = S.surfaceContainerLow;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${S.outlineVariant}4d`;
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = `${S.surfaceContainerLow}4d`;
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1rem" }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  background: S.primaryContainer,
                  color: S.onPrimaryContainer,
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 16px rgba(242,141,131,0.3)",
                  transition: "transform 0.15s",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  opacity: submitting ? 0.6 : 1,
                }}
                onMouseEnter={(e) => !submitting && (e.currentTarget.style.transform = "scale(1.01)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseDown={(e) => !submitting && (e.currentTarget.style.transform = "scale(0.98)")}
                onMouseUp={(e) => !submitting && (e.currentTarget.style.transform = "scale(1.01)")}
              >
                {submitting ? "Connecting..." : "Connect Account"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  color: S.onSurfaceVariant,
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  borderRadius: "999px",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = S.surfaceContainerLow)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "1.5rem",
              background: `${S.surfaceContainerLow}80`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              borderTop: `1px solid ${S.outlineVariant}1a`,
            }}
          >
            <ShieldCheck size={16} style={{ color: S.primary }} />
            <span
              style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: S.onSurfaceVariant,
              }}
            >
              Bank-grade 256-bit AES Encryption
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectBankPage;
