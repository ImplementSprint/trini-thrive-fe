"use client";

import React, { useState } from "react";
import {
  User,
  BadgeCheck,
  History,
  Settings,
  KeyRound,
  Monitor,
  Laptop,
  Smartphone,
  LogOut,
  Wallet,
} from "lucide-react";
import { useProfile } from "@/donor-hooks/useProfile";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, getDonorTokenPayload } from "@/donor-lib/supabase-client";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const colors = {
  primary: "#97453e",
  primaryContainer: "#f28d83",
  primaryFixed: "#ffdad6",
  primaryFixedDim: "#ffb4ab",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6e2621",
  onPrimaryFixed: "#3f0304",
  secondary: "#a8372c",
  secondaryContainer: "#ff7766",
  onSecondary: "#ffffff",
  onSecondaryContainer: "#710d09",
  tertiary: "#775a00",
  tertiaryContainer: "#cda336",
  onTertiary: "#ffffff",
  surface: "#fcf9f8",
  surfaceContainer: "#f0edec",
  surfaceContainerLow: "#f6f3f2",
  surfaceContainerHigh: "#eae7e7",
  surfaceContainerLowest: "#ffffff",
  surfaceDim: "#dcd9d8",
  onSurface: "#1b1c1b",
  onSurfaceVariant: "#554240",
  outline: "#877270",
  outlineVariant: "#dac1be",
  background: "#fcf9f8",
  inverseSurface: "#303030",
  inversePrimary: "#ffb4ab",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
} as const;

// ─── Shared Types ─────────────────────────────────────────────────────────────
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

interface FormFieldProps {
  label: string;
  name?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  placeholder?: string;
  colSpan2?: boolean;
}

interface SessionCardProps {
  icon: React.ReactNode;
  deviceName: string;
  lastActive: string;
  location: string;
  isCurrent?: boolean;
}

// ─── Reusable Sub-Components ─────────────────────────────────────────────────

const SideNavItem = React.memo<NavItemProps>(
  ({ icon, label, href = "#", active = false, onClick }) => (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem 1.5rem",
        borderRadius: "1rem",
        fontWeight: active ? 700 : 500,
        color: active ? colors.primary : colors.onSurfaceVariant,
        background: active ? `${colors.primaryContainer}1a` : "transparent",
        borderLeft: active ? `4px solid ${colors.primary}` : "4px solid transparent",
        textDecoration: "none",
        transition: "background 0.15s",
        fontFamily: "Manrope, sans-serif",
        fontSize: "0.95rem",
      }}
    >
      {icon}
      {label}
    </a>
  )
);
SideNavItem.displayName = "SideNavItem";

const FormField = React.memo<FormFieldProps>(
  ({ label, name, type = "text", value, onChange, readOnly, placeholder, colSpan2 = false }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        gridColumn: colSpan2 ? "1 / -1" : undefined,
      }}
    >
      <label
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          color: colors.onSurfaceVariant,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          padding: "0 0.25rem",
          fontFamily: "Manrope, sans-serif",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "1rem 1.5rem",
          borderRadius: "1rem",
          background: colors.surfaceContainerLow,
          border: "none",
          outline: "none",
          fontFamily: "Manrope, sans-serif",
          fontWeight: 500,
          fontSize: "0.95rem",
          color: readOnly ? colors.onSurfaceVariant : colors.onSurface,
          opacity: readOnly ? 0.7 : 1,
          boxSizing: "border-box",
          cursor: readOnly ? "not-allowed" : "text",
        }}
        onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primaryContainer}80`;
        }}
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  )
);
FormField.displayName = "FormField";

const SessionCard = React.memo<SessionCardProps>(
  ({ icon, deviceName, lastActive, location, isCurrent = false }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.5rem",
        borderRadius: "1rem",
        background: colors.surfaceContainerLow,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "0.75rem",
            background: colors.surfaceContainerLowest,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.primary,
          }}
        >
          {icon}
        </div>
        <div>
          <h4
            style={{
              fontWeight: 700,
              color: colors.onSurface,
              fontFamily: "Manrope, sans-serif",
              margin: 0,
            }}
          >
            {deviceName}
          </h4>
          <p
            style={{
              fontSize: "0.85rem",
              color: colors.onSurfaceVariant,
              fontFamily: "Manrope, sans-serif",
              margin: 0,
            }}
          >
            Last active: {lastActive} • {location}
          </p>
        </div>
      </div>
      {isCurrent ? (
        <span
          style={{
            padding: "0.25rem 0.75rem",
            background: `${colors.secondaryContainer}33`,
            color: colors.onSecondaryContainer,
            fontSize: "0.7rem",
            fontWeight: 700,
            borderRadius: "999px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: "Manrope, sans-serif",
          }}
        >
          Current Device
        </span>
      ) : (
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: colors.secondary,
            fontFamily: "Manrope, sans-serif",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
          }}
        >
          Sign Out
        </button>
      )}
    </div>
  )
);
SessionCard.displayName = "SessionCard";

// ─── Main Page Component ───────────────────────────────────────────────────────
export default function HopecardProfile() {
  const { profile, loading, saveProfile, saving, saveSuccess, saveError } = useProfile();
  const [searchFocused, setSearchFocused] = useState(false);
  const [lifetimeTotal, setLifetimeTotal] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchLifetimeTotal() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from('hopecard_purchases')
        .select('amount_paid')
        .eq('buyer_auth_id', session.user.id)
        .eq('status', 'paid');
      if (data) setLifetimeTotal(data.reduce((sum, r) => sum + (r.amount_paid ?? 0), 0));
    }
    fetchLifetimeTotal();
  }, []);

  useEffect(() => {
    async function fetchWalletBalance() {
      try {
        const tokenPayload = getDonorTokenPayload();
        if (!tokenPayload) return;

        const token = localStorage.getItem("donor_token");
        const base = process.env.NEXT_PUBLIC_DONOR_BACKEND_URL ?? "";
        const res = await fetch(
          `${base}/api/v1/hopecard/donor/wallet/balance?authUserId=${tokenPayload.sub}`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setWalletBalance(Number(data.balance));
        }
      } catch (err) {
        console.error("Failed to fetch wallet balance:", err);
      }
    }

    fetchWalletBalance();
  }, []);

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  // Sync state with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
        phone: profile.phone || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateInfo = async () => {
    const nameParts = formData.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    await saveProfile({
      first_name: firstName,
      last_name: lastName,
      phone: formData.phone,
    });
  };

  // Password state
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdatePassword = async () => {
    setPasswordMsg(null);
    if (passwordData.newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
    setPasswordSaving(false);
    if (error) {
      setPasswordMsg({ type: "error", text: error.message });
    } else {
      setPasswordMsg({ type: "success", text: "Password updated successfully." });
      setPasswordData({ newPassword: "", confirmPassword: "" });
    }
  };

  const passwordStrength = (() => {
    const p = passwordData.newPassword;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", colors.primaryContainer, "#f59e0b", "#3b82f6", colors.primary][passwordStrength];

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        background: colors.surface,
        fontFamily: "Manrope, sans-serif"
      }}>
        <div style={{ color: colors.primary, fontWeight: 700 }}>Loading profile...</div>
      </div>
    );
  }

  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Guest";
  const joinedDate = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";
  const impactAmount = lifetimeTotal !== null
    ? new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(lifetimeTotal)
    : "—";
  const walletAmount = walletBalance !== null
    ? new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(walletBalance)
    : "—";

  return (
    <div
      style={{
        background: colors.surface,
        fontFamily: "Manrope, sans-serif",
        color: colors.onSurface,
        minHeight: "100vh",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder { color: #877270; opacity: 0.7; }
        a { text-decoration: none; }
      `}</style>

      {/* ── Navigation Removed (Using SharedLayout instead) ── */}

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: "1440px", margin: "0 auto", padding: "5rem 3rem 2rem" }}>

        {/* Hero Profile Section */}
        <section
          style={{
            width: "100%",
            borderRadius: "2rem",
            marginBottom: "4rem",
            background: colors.surfaceContainerLow,
            padding: "2rem 3rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          {/* Name + Stats */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h1
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 800,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  color: colors.onSurface,
                  letterSpacing: "-0.03em",
                  margin: 0,
                }}
              >
                {fullName}
              </h1>
              {(() => {
                const s = profile?.status;
                const badge = (s === 'approved' || s === 'active')
                  ? { bg: `${colors.secondaryContainer}33`, color: colors.onSecondaryContainer, label: 'Verified Donor', fill: 'currentColor' }
                  : s === 'suspended'
                  ? { bg: '#fff7ed', color: '#9a3412', label: 'Account Suspended', fill: 'none' }
                  : s === 'banned'
                  ? { bg: '#fef2f2', color: '#991b1b', label: 'Account Banned', fill: 'none' }
                  : { bg: colors.surfaceContainerHigh, color: colors.onSurfaceVariant, label: 'Pending Verification', fill: 'none' };
                return (
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      background: badge.bg,
                      color: badge.color,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      borderRadius: "999px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontFamily: "Manrope, sans-serif",
                    }}
                  >
                    <BadgeCheck size={14} fill={badge.fill} />
                    {badge.label}
                  </span>
                );
              })()}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              <p
                style={{
                  color: colors.primary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  margin: 0,
                }}
              >
                Lifetime Impact: {impactAmount}
              </p>
              <span style={{ width: "1px", height: "1.5rem", background: `${colors.outlineVariant}4d`, display: "inline-block" }} />
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: `${colors.primaryContainer}18`,
                  border: `1px solid ${colors.primaryContainer}44`,
                  borderRadius: "999px",
                  padding: "0.375rem 1rem",
                  cursor: "pointer",
                }}
                onClick={() => router.push('/donor/wallet')}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${colors.primaryContainer}2a`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = `${colors.primaryContainer}18`)}
              >
                <Wallet size={15} color={colors.primary} />
                <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "0.9375rem", color: colors.primary }}>
                  {walletAmount}
                </span>
              </div>
              <span style={{ width: "1px", height: "1.5rem", background: `${colors.outlineVariant}4d`, display: "inline-block" }} />
              <p style={{ color: colors.onSurfaceVariant, fontSize: "0.875rem", fontWeight: 500, margin: 0 }}>
                Joined {joinedDate}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <button
            style={{
              background: colors.primaryContainer,
              color: colors.onPrimaryContainer,
              padding: "0.75rem 2rem",
              borderRadius: "1rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              boxShadow: `0 8px 20px ${colors.primaryContainer}33`,
              fontFamily: "Manrope, sans-serif",
              fontSize: "0.95rem",
              flexShrink: 0,
            }}
          >
            Edit Profile
          </button>
        </section>

        {/* ── Two-Column Layout ──────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "3rem" }}>

          {/* Sidebar */}
          <aside>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <SideNavItem
                icon={<User size={20} />}
                label="Profile & Security"
                active
                onClick={() => router.push('/donor/profile')}
              />
              <SideNavItem
                icon={<History size={20} />}
                label="Donation History"
                onClick={() => router.push('/donor/transactions')}
              />
              <SideNavItem
                icon={<Settings size={20} />}
                label="Settings"
                onClick={() => router.push('/donor/settings')}
              />
              <a
                onClick={async () => {
                  await supabase.auth.signOut();
                  localStorage.removeItem('donor_token');
                  document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
                  router.push('/donor/login');
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.5rem",
                  borderRadius: "1rem",
                  fontWeight: 600,
                  color: "#ba1a1a",
                  background: "transparent",
                  textDecoration: "none",
                  transition: "background 0.15s",
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#ffdad622")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={20} /> Log Out
              </a>
            </nav>

          </aside>

          {/* Main Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* ── Personal Information ─────────────────────────────────────── */}
            <div
              style={{
                background: colors.surfaceContainerLowest,
                borderRadius: "1rem",
                padding: "2rem",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "2rem",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 700,
                    color: colors.onSurface,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    margin: 0,
                  }}
                >
                  <BadgeCheck size={24} color={colors.primary} />
                  Personal Information
                </h2>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "2rem",
                }}
              >
                <FormField 
                  label="Full Name" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                />
                <FormField 
                  label="Mobile Number" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                />
                <FormField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  placeholder="name@example.com"
                  colSpan2
                />
              </div>

              {saveError && (
                <div style={{ marginTop: "1rem", color: colors.error, fontSize: "0.875rem", fontWeight: 600 }}>
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div style={{ marginTop: "1rem", color: "#166534", fontSize: "0.875rem", fontWeight: 600 }}>
                  Profile updated successfully!
                </div>
              )}

              <div
                style={{
                  marginTop: "2rem",
                  paddingTop: "2rem",
                  borderTop: `1px solid ${colors.outlineVariant}33`,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={handleUpdateInfo}
                  disabled={saving}
                  style={{
                    background: saving ? colors.surfaceContainer : colors.primaryContainer,
                    color: saving ? colors.onSurfaceVariant : colors.onPrimaryContainer,
                    padding: "0.75rem 2rem",
                    borderRadius: "1rem",
                    fontWeight: 700,
                    border: "none",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontFamily: "Manrope, sans-serif",
                    fontSize: "0.95rem",
                    transition: "all 0.2s",
                  }}
                >
                  {saving ? "Updating..." : "Update Info"}
                </button>
              </div>
            </div>

            {/* ── Change Password ──────────────────────────────────────────── */}
            <div
              style={{
                background: colors.surfaceContainerLowest,
                borderRadius: "1rem",
                padding: "2rem",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  color: colors.onSurface,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "2rem",
                }}
              >
                <KeyRound size={24} color={colors.primary} />
                Change Password
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  <FormField
                    label="New Password"
                    name="newPassword"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                  <FormField
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                {/* Password Strength */}
                {passwordData.newPassword.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 0.25rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: colors.onSurfaceVariant, fontFamily: "Manrope, sans-serif" }}>
                        Password Strength
                      </span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: strengthColor, fontFamily: "Manrope, sans-serif" }}>
                        {strengthLabel}
                      </span>
                    </div>
                    <div style={{ height: "0.5rem", width: "100%", background: colors.surfaceContainer, borderRadius: "999px", display: "flex", overflow: "hidden" }}>
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          style={{
                            flex: 1,
                            height: "100%",
                            background: strengthColor,
                            opacity: passwordStrength >= level ? 1 : 0.2,
                            borderRight: level < 4 ? `1px solid ${colors.surface}` : "none",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback message */}
                {passwordMsg && (
                  <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: passwordMsg.type === "success" ? colors.tertiary : "#ba1a1a", fontFamily: "Manrope, sans-serif" }}>
                    {passwordMsg.text}
                  </p>
                )}

                {/* Submit button */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handleUpdatePassword}
                    disabled={passwordSaving}
                    style={{
                      background: colors.primaryContainer,
                      color: colors.onPrimaryContainer,
                      padding: "0.75rem 2rem",
                      borderRadius: "1rem",
                      fontWeight: 700,
                      border: "none",
                      cursor: passwordSaving ? "not-allowed" : "pointer",
                      fontFamily: "Manrope, sans-serif",
                      fontSize: "0.95rem",
                      opacity: passwordSaving ? 0.7 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    {passwordSaving ? "Updating…" : "Update Password"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}
