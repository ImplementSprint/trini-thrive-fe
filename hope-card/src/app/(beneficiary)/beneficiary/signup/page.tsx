// app/signup/page.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { User, Landmark, ShieldCheck, CloudUpload, CheckCircle } from "lucide-react";
import {
  S, BeneficiaryStyle, AmbientCard, CardLogo, FieldLabel,
  TextInput, SelectInput, FormSection, PrimaryBtn, BeneficiaryFooter,
} from "@/app/(beneficiary)/beneficiary/shared/beneficiary-shared";

const FieldGrid = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem" }}>
    {children}
  </div>
);

const FullField = ({ children }: { children: React.ReactNode }) => (
  <div style={{ gridColumn: "1 / -1" }}>{children}</div>
);

export default function SignupPage() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Clear stale persona cookie on mount
  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const persona = cookies.find(c => c.startsWith('persona='))?.split('=')[1];
    if (persona && persona !== 'beneficiary') {
      document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    }
  }, []);
  const [agreed, setAgreed]           = useState(false);
  const [idFile, setIdFile]           = useState<File | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  // Form fields
  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName]       = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const toTitleCase = (value: string) =>
    value.replace(/\b\w/g, (char) => char.toUpperCase());

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      setIdFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setError(null);
    setIdFile(f);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (accountNumber && (accountNumber.length < 10 || accountNumber.length > 16)) {
      setError("Account number must be between 10 and 16 digits.");
      return;
    }
    if (!idFile) {
      setError("Please upload your Government Issued ID.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("accountName", accountName);
      formData.append("bankName", bankName);
      formData.append("accountNumber", accountNumber);
      formData.append("idFile", idFile);

      const res = await fetch("/beneficiary/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        style={{
          background: S.surface,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          color: S.onSurface,
        }}
      >
        <BeneficiaryStyle />
        <AmbientCard maxWidth="32rem">
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ width: "4rem", height: "4rem", borderRadius: "999px", background: `${S.primary}1a`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={32} style={{ color: S.primary }} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: S.onSurface, margin: "0 0 0.5rem" }}>Account Created!</h2>
              <p style={{ fontSize: "0.9375rem", color: S.onSurfaceVariant, margin: 0, lineHeight: 1.6 }}>
                Check your email to confirm your account. Once confirmed, your application will be reviewed by an admin.
              </p>
            </div>
            <a
              href="/beneficiary/login"
              style={{
                display: "inline-block",
                padding: "0.75rem 2rem",
                borderRadius: "0.75rem",
                background: S.primary,
                color: S.onPrimary,
                fontWeight: 700,
                fontSize: "0.9375rem",
                textDecoration: "none",
              }}
            >
              Go to Login
            </a>
          </div>
        </AmbientCard>
      </div>
    );
  }

  // ── Form state ────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background: S.surface,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "Plus Jakarta Sans, sans-serif",
        color: S.onSurface,
      }}
    >
      <BeneficiaryStyle />

      <main style={{ width: "100%", maxWidth: "42rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <AmbientCard maxWidth="42rem">
          {/* Branding */}
          <div style={{ width: "100%", textAlign: "center", marginBottom: "2.5rem" }}>
            <CardLogo />
            <h1 style={{ fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.03em", color: S.onSurface, margin: "0 0 0.5rem" }}>
              Join our community
            </h1>
            <p style={{ fontSize: "1rem", fontWeight: 500, color: S.onSurfaceVariant, opacity: 0.8, margin: 0 }}>
              Join the HOPECARD community and manage your benefits with dignity.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ width: "100%", display: "flex", flexDirection: "column", gap: "2.5rem" }}
          >
            {/* ── Section 1: Personal Information ──────────────────────── */}
            <FormSection icon={<User size={20} />} title="Personal Information">
              <FieldGrid>
                <div>
                  <FieldLabel>First Name</FieldLabel>
                  <TextInput
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(toTitleCase(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <FieldLabel>Last Name</FieldLabel>
                  <TextInput
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(toTitleCase(e.target.value))}
                    required
                  />
                </div>
                <FullField>
                  <FieldLabel>Email Address</FieldLabel>
                  <TextInput
                    type="email"
                    placeholder="name@hopecard.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FullField>
                <div>
                  <FieldLabel>Password</FieldLabel>
                  <TextInput
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <FieldLabel>Confirm Password</FieldLabel>
                  <TextInput
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </FieldGrid>
            </FormSection>

            {/* ── Section 2: Bank Details ───────────────────────────────── */}
            <FormSection icon={<Landmark size={20} />} title="Bank Details">
              <FieldGrid>
                <div>
                  <FieldLabel>Account Name</FieldLabel>
                  <TextInput
                    type="text"
                    placeholder="As written on bank card"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Bank Name</FieldLabel>
                  <SelectInput
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  >
                    <option value="">Select your bank</option>
                    <option value="BDO">BDO</option>
                    <option value="BPI">BPI</option>
                    <option value="Metrobank">Metrobank</option>
                    <option value="Landbank">Landbank</option>
                  </SelectInput>
                </div>
                <FullField>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.375rem" }}>
                    <FieldLabel>Account Number</FieldLabel>
                    <span style={{ fontSize: "0.7rem", color: `${S.onSurfaceVariant}99`, fontWeight: 600 }}>(10–16 digits)</span>
                  </div>
                  <TextInput
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={accountNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                      setAccountNumber(digits);
                    }}
                    minLength={10}
                    maxLength={16}
                  />
                </FullField>
              </FieldGrid>
            </FormSection>

            {/* ── Section 3: Identity Verification ─────────────────────── */}
            <FormSection icon={<ShieldCheck size={20} />} title="Identity Verification">
              <input
                ref={fileInputRef}
                id="id-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFile}
                style={{ display: "none" }}
              />
              <label
                htmlFor="id-upload"
                style={{
                  position: "relative",
                  width: "100%",
                  padding: "2.5rem 1.5rem",
                  borderRadius: "1rem",
                  background: idFile ? "#f0fdf4" : S.surfaceContainerLow,
                  border: `2px dashed ${idFile ? "#16a34a" : `${S.outlineVariant}66`}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.2s",
                }}
                onMouseEnter={(e) => { if (!idFile) e.currentTarget.style.borderColor = `${S.primary}80`; }}
                onMouseLeave={(e) => { if (!idFile) e.currentTarget.style.borderColor = `${S.outlineVariant}66`; }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "999px",
                    background: idFile ? "#dcfce7" : `${S.primary}1a`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                    transition: "background 0.2s",
                  }}
                >
                  {idFile
                    ? <CheckCircle size={24} style={{ color: "#16a34a" }} />
                    : <CloudUpload size={24} style={{ color: S.primary }} />
                  }
                </div>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: idFile ? "#16a34a" : S.onSurface, margin: "0 0 0.25rem" }}>
                  {idFile ? idFile.name : "Click to upload Government Issued ID"}
                </p>
                {!idFile && (
                  <p style={{ fontSize: "0.625rem", color: `${S.onSurfaceVariant}99`, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", margin: 0 }}>
                    JPG, PNG, PDF (Max 5MB)
                  </p>
                )}
              </label>
            </FormSection>

            {/* ── Error banner ──────────────────────────────────────────── */}
            {error && (
              <p style={{
                borderRadius: "0.75rem",
                background: S.errorContainer,
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                color: S.onErrorContainer,
                margin: 0,
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}>
                {error}
              </p>
            )}

            {/* ── Terms & CTA ───────────────────────────────────────────── */}
            <div style={{ paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ width: "1rem", height: "1rem", marginTop: "2px", accentColor: S.primary, cursor: "pointer", flexShrink: 0 }}
                />
                <label style={{ fontSize: "0.75rem", color: S.onSurfaceVariant, lineHeight: 1.6, fontWeight: 500 }}>
                  I agree to the{" "}
                  <a href="/terms" style={{ color: S.primary, fontWeight: 700, textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                  >Terms of Service</a>{" "}
                  and{" "}
                  <a href="/privacy" style={{ color: S.primary, fontWeight: 700, textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                  >Privacy Policy</a>.
                </label>
              </div>

              <PrimaryBtn label={isSubmitting ? "Creating account..." : "Sign Up"} disabled={isSubmitting} />

              <p style={{ textAlign: "center", color: S.onSurfaceVariant, fontSize: "0.875rem", fontWeight: 500, margin: 0 }}>
                Already have an account?{" "}
                <a href="/beneficiary/login" style={{ color: S.primary, fontWeight: 700, marginLeft: "0.25rem", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >Sign In</a>
              </p>
            </div>
          </form>
        </AmbientCard>

        <BeneficiaryFooter />
      </main>
    </div>
  );
}
