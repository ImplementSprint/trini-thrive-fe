"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import SharedLayout from "@/donor-components/SharedLayout";
import {
  Shield, Settings as SettingsIcon,
  HelpCircle, HeadphonesIcon, FileText, Scale,
  ChevronRight, LogOut, ArrowLeft,
} from "lucide-react";
import { useProfile } from "@/donor-hooks/useProfile";
import { supabase } from "@/donor-lib/supabase-client";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  primary:                "#97453e",
  primaryContainer:       "#f28d83",
  primaryFixed:           "#ffdad6",
  onPrimary:              "#ffffff",
  onPrimaryContainer:     "#6e2621",
  secondary:              "#a8372c",
  tertiary:               "#2e7d32",
  surface:                "#fcf9f8",
  surfaceContainer:       "#f0edec",
  surfaceContainerLow:    "#f6f3f2",
  surfaceContainerHigh:   "#eae7e7",
  surfaceContainerHighest:"#e5e2e1",
  surfaceContainerLowest: "#ffffff",
  onSurface:              "#1b1c1b",
  onSurfaceVariant:       "#554240",
  outlineVariant:         "#dac1be",
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
}

interface LegalLinkProps {
  icon: React.ReactNode;
  label: string;
}

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

interface PasswordFieldProps {
  label: string;
  colSpan2?: boolean;
  value: string;
  onChange: (value: string) => void;
}

// ─── Sub-Components ────────────────────────────────────────────────────────────

const Toggle = React.memo<ToggleProps>(({ enabled, onChange }) => (
  <button
    onClick={onChange}
    aria-checked={enabled}
    role="switch"
    style={{
      position: "relative",
      display: "inline-flex",
      height: "1.5rem",
      width: "2.75rem",
      alignItems: "center",
      borderRadius: "999px",
      background: enabled ? C.primaryContainer : C.surfaceContainerHigh,
      border: "none",
      cursor: "pointer",
      flexShrink: 0,
      transition: "background 0.2s",
    }}
  >
    <span
      style={{
        display: "inline-block",
        width: "1rem",
        height: "1rem",
        borderRadius: "999px",
        background: "#ffffff",
        transform: enabled ? "translateX(1.375rem)" : "translateX(0.25rem)",
        transition: "transform 0.2s",
      }}
    />
  </button>
));
Toggle.displayName = "Toggle";


const LegalLink = React.memo<LegalLinkProps>(({ icon, label }) => (
  <a
    href="#"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1.25rem 0",
      borderBottom: `1px solid ${C.outlineVariant}1a`,
      textDecoration: "none",
      transition: "color 0.15s",
    }}
    className="legal-link-row"
  >
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <div
        style={{
          width: "2.5rem",
          height: "2.5rem",
          borderRadius: "999px",
          background: C.surfaceContainerLow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.primary,
          transition: "background 0.15s",
        }}
      >
        {icon}
      </div>
      <span style={{ fontWeight: 600, color: C.onSurface, fontFamily: "Manrope, sans-serif" }}>{label}</span>
    </div>
    <ChevronRight size={20} style={{ color: C.onSurfaceVariant, transition: "transform 0.15s" }} />
  </a>
));
LegalLink.displayName = "LegalLink";

const SectionCard = React.memo<SectionCardProps>(({ icon, title, children }) => (
  <section
    style={{
      background: C.surfaceContainerLowest,
      borderRadius: "0.75rem",
      padding: "2rem",
      boxShadow: "0 12px 40px rgba(27,28,27,0.06)",
      border: `1px solid ${C.outlineVariant}1a`,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
      {icon}
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: C.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif", margin: 0 }}>{title}</h2>
    </div>
    {children}
  </section>
));
SectionCard.displayName = "SectionCard";

const PasswordField = React.memo<PasswordFieldProps>(({ label, colSpan2 = false, value, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", gridColumn: colSpan2 ? "1 / -1" : undefined }}>
    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: C.onSurfaceVariant, marginLeft: "0.25rem", fontFamily: "Manrope, sans-serif" }}>
      {label}
    </label>
    <input
      type="password"
      placeholder="••••••••"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", background: C.surfaceContainerHighest, border: "none", borderRadius: "1rem", padding: "1rem 1.25rem", outline: "none", fontFamily: "Manrope, sans-serif", fontSize: "1rem", color: "#000000" }}
      onFocus={(e) => { e.currentTarget.style.background = C.surfaceContainerLowest; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(151,69,62,0.15)"; }}
      onBlur={(e) => { e.currentTarget.style.background = C.surfaceContainerHighest; e.currentTarget.style.boxShadow = "none"; }}
    />
  </div>
));
PasswordField.displayName = "PasswordField";

// ─── Page Component ────────────────────────────────────────────────────────────
export default function HopecardSettings() {
  const router = useRouter();
  const [biometric,      setBiometric]      = useState(true);

  const { profile, loading: profileLoading, saving, saveError, saveSuccess, saveProfile, authUserId } = useProfile();

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [barangay, setBarangay] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [province, setProvince] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Sync form fields when profile loads
  useEffect(() => {
    if (profile) {
      setPhone(profile.phone);
      setAddress(profile.address);
      setBarangay(profile.barangay);
      setMunicipality(profile.municipality);
      setProvince(profile.province);
    }
  }, [profile]);

  const toggle = useCallback(
    (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => setter((p) => !p),
    []
  );

  const handleSavePersonalInfo = useCallback(async () => {
    await saveProfile({ phone, address, barangay, municipality, province });
  }, [saveProfile, phone, address, barangay, municipality, province]);

const handleChangePassword = useCallback(async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  }, [newPassword, confirmPassword]);

  return (
    <SharedLayout currentPage="settings">
      <main style={{ maxWidth: "56rem", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            color: C.onSurfaceVariant,
            fontFamily: "Manrope, sans-serif",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            padding: "0.5rem 0",
            marginBottom: "1.5rem",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.onSurfaceVariant)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <header style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: C.onSurface, letterSpacing: "-0.03em", margin: "0 0 0.5rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Settings</h1>
          <p style={{ color: C.onSurfaceVariant, margin: 0 }}>Manage your HOPECARD account, security, and app preferences.</p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

          {/* ── Personal Information ─────────────────────────────────────────── */}
          <SectionCard icon={<SettingsIcon size={22} color={C.primary} />} title="Personal Information">
            {profileLoading ? (
              <p style={{ color: C.onSurfaceVariant, fontFamily: "Manrope, sans-serif" }}>Loading profile...</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Fields */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  {/* Read-only email from signup */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ fontSize: "0.875rem", fontWeight: 500, color: C.onSurfaceVariant, marginLeft: "0.25rem", fontFamily: "Manrope, sans-serif" }}>Email Address</label>
                    <input
                      type="email"
                      value={profile?.email ?? ''}
                      readOnly
                      style={{ width: "100%", background: C.surfaceContainerHigh, border: "none", borderRadius: "1rem", padding: "1rem 1.25rem", outline: "none", fontFamily: "Manrope, sans-serif", fontSize: "1rem", color: C.onSurfaceVariant, boxSizing: "border-box", cursor: "default" }}
                    />
                  </div>
                  {[
                    { label: "Phone Number", value: phone, setter: setPhone },
                    { label: "Address", value: address, setter: setAddress },
                    { label: "Barangay", value: barangay, setter: setBarangay },
                    { label: "Municipality", value: municipality, setter: setMunicipality },
                    { label: "Province", value: province, setter: setProvince },
                  ].map(({ label, value, setter }) => (
                    <div key={label} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.875rem", fontWeight: 500, color: C.onSurfaceVariant, marginLeft: "0.25rem", fontFamily: "Manrope, sans-serif" }}>{label}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        style={{ width: "100%", background: C.surfaceContainerHighest, border: "none", borderRadius: "1rem", padding: "1rem 1.25rem", outline: "none", fontFamily: "Manrope, sans-serif", fontSize: "1rem", color: C.onSurface, boxSizing: "border-box" }}
                        onFocus={(e) => { e.currentTarget.style.background = C.surfaceContainerLowest; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(151,69,62,0.15)"; }}
                        onBlur={(e) => { e.currentTarget.style.background = C.surfaceContainerHighest; e.currentTarget.style.boxShadow = "none"; }}
                      />
                    </div>
                  ))}
                </div>
                {saveError && <p style={{ color: C.secondary, fontSize: "0.875rem", margin: 0 }}>{saveError}</p>}
                {saveSuccess && <p style={{ color: C.tertiary, fontSize: "0.875rem", margin: 0 }}>Profile saved successfully.</p>}
                <button
                  onClick={handleSavePersonalInfo}
                  disabled={saving}
                  style={{ alignSelf: "flex-start", background: C.primaryContainer, color: C.onPrimaryContainer, border: "none", borderRadius: "0.75rem", padding: "0.75rem 1.5rem", fontWeight: 700, cursor: "pointer", fontFamily: "Manrope, sans-serif", opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </SectionCard>

          {/* ── Account & Security ─────────────────────────────────────────── */}
          <SectionCard icon={<Shield size={22} color={C.primary} />} title="Account & Security">
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <PasswordField label="Current Password" value={currentPassword} onChange={(v) => setCurrentPassword(v)} />
                <PasswordField label="New Password" value={newPassword} onChange={(v) => setNewPassword(v)} />
                <PasswordField label="Confirm New Password" colSpan2 value={confirmPassword} onChange={(v) => setConfirmPassword(v)} />
              </div>
              {passwordError && <p style={{ color: C.secondary, fontSize: "0.875rem", margin: 0 }}>{passwordError}</p>}
              {passwordSuccess && <p style={{ color: C.tertiary, fontSize: "0.875rem", margin: 0 }}>Password updated successfully.</p>}
              <button
                onClick={handleChangePassword}
                disabled={passwordSaving}
                style={{ alignSelf: "flex-start", background: C.primaryContainer, color: C.onPrimaryContainer, border: "none", borderRadius: "0.75rem", padding: "0.75rem 1.5rem", fontWeight: 700, cursor: "pointer", fontFamily: "Manrope, sans-serif", opacity: passwordSaving ? 0.7 : 1 }}
              >
                {passwordSaving ? 'Saving...' : 'Update Password'}
              </button>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 0", borderTop: `1px solid ${C.outlineVariant}1a` }}>
                <div>
                  <p style={{ fontWeight: 600, color: C.onSurface, margin: "0 0 0.125rem", fontFamily: "Manrope, sans-serif" }}>Biometric Login</p>
                  <p style={{ fontSize: "0.875rem", color: C.onSurfaceVariant, margin: 0, fontFamily: "Manrope, sans-serif" }}>Use FaceID or Fingerprint for faster access</p>
                </div>
                <Toggle enabled={biometric} onChange={toggle(setBiometric)} />
              </div>
            </div>
          </SectionCard>

{/* ── Legal & Support ────────────────────────────────────────────── */}
          <SectionCard icon={<HelpCircle size={22} color={C.primary} />} title="Legal & Support">
            <div>
              <LegalLink icon={<HeadphonesIcon size={18} />} label="Help Center" />
              <LegalLink icon={<FileText size={18} />}       label="Privacy Policy" />
              <LegalLink icon={<Scale size={18} />}          label="Terms of Service" />
            </div>
          </SectionCard>

          {/* ── Sign Out ───────────────────────────────────────────────────── */}
          <div style={{ paddingTop: "2rem" }}>
            <button
              onClick={async () => { await supabase.auth.signOut(); localStorage.removeItem('donor_token'); document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0'; router.push('/donor/login'); }}
              style={{
                width: "100%",
                background: C.primaryContainer,
                color: C.onPrimaryContainer,
                fontWeight: 700,
                padding: "1.25rem",
                borderRadius: "1rem",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxShadow: `0 8px 24px ${C.primaryContainer}33`,
                fontFamily: "Manrope, sans-serif",
                fontSize: "1rem",
                transition: "filter 0.15s, transform 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.95)")}
              onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </SharedLayout>
  );
}
