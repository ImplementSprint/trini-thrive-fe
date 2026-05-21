"use client";
import { BeneficiaryNotificationBell } from "@/app/(beneficiary)/beneficiary/shared/BeneficiaryNotificationBell";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Menu, LayoutDashboard, CreditCard,
  Landmark, IdCard, User, ShieldCheck,
  HelpCircle, Vibrate, Fingerprint, LockKeyhole, Info,
  LogOut,
} from "lucide-react";
import { S, LOGO_SRC, LOGO_WIDTH, LOGO_HEIGHT, BeneficiaryStyle } from "@/app/(beneficiary)/beneficiary/shared/beneficiary-shared";
import { createClient } from "@/beneficiary-utils/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginEntry {
  date: string;
  device: string;
  ip: string;
  status: "Success" | "Failed";
}

interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => (
  <label style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "pointer" }} aria-label="Toggle setting">
    <input
      style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
      type="checkbox"
      checked={checked}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
    />
    <div
      style={{
        width: "3.5rem",
        height: "2rem",
        background: checked ? S.primary : S.surfaceContainerHighest,
        borderRadius: "999px",
        position: "relative",
        transition: "background 0.15s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "0.25rem",
          left: checked ? "calc(100% - 1.75rem)" : "0.25rem",
          width: "1.5rem",
          height: "1.5rem",
          background: S.surfaceContainerLowest,
          borderRadius: "999px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 0.15s",
        }}
      />
    </div>
  </label>
);

interface LoginRowProps {
  entry: LoginEntry;
}

const LoginRow: React.FC<LoginRowProps> = ({ entry }) => (
  <tr
    style={{
      borderBottom: `1px solid ${S.outlineVariant}1a`,
      transition: "background 0.15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = S.surfaceContainerLow)}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
  >
    <td style={{ padding: "1.5rem 2rem", fontSize: "0.875rem", fontWeight: 500, color: S.onSurfaceVariant }}>
      {entry.date}
    </td>
    <td style={{ padding: "1.5rem 2rem" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: 700, color: S.onSurface }}>{entry.device}</span>
        <span style={{ fontSize: "0.75rem", color: S.onSurfaceVariant }}>{entry.ip}</span>
      </div>
    </td>
    <td style={{ padding: "1.5rem 2rem" }}>
      {entry.status === "Success" ? (
        <span
          style={{
            padding: "0.25rem 0.75rem",
            background: S.surfaceContainerHighest,
            color: S.onSecondaryContainer,
            borderRadius: "999px",
            fontSize: "0.625rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Success
        </span>
      ) : (
        <span
          style={{
            padding: "0.25rem 0.75rem",
            background: `${S.errorContainer}99`,
            color: S.onErrorContainer,
            borderRadius: "999px",
            fontSize: "0.625rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Failed
        </span>
      )}
    </td>
    <td style={{ padding: "1.5rem 2rem", textAlign: "right" }}>
      <button
        style={{
          color: "#d4d4d8",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.5rem",
          borderRadius: "999px",
          display: "inline-flex",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = S.primary)}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#d4d4d8")}
      >
        <Info size={20} />
      </button>
    </td>
  </tr>
);

// ─── Nav Item ──────────────────────────────────────────────────────────────────

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
  href: string;
}

const NavItem = React.memo<NavItemProps>(({ icon, label, active = false, collapsed, href }) => (
  <a
    href={href}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: collapsed ? "0.75rem" : "0.75rem 1rem 0.75rem 2rem",
      justifyContent: collapsed ? "center" : "flex-start",
      borderRadius: active ? "999px 0 0 999px" : "999px",
      marginLeft: active ? "1rem" : collapsed ? "0.75rem" : 0,
      marginRight: active ? 0 : collapsed ? "0.75rem" : 0,
      background: active ? S.surfaceContainerLowest : "transparent",
      color: active ? S.primary : "#78716c",
      fontWeight: active ? 700 : 500,
      fontSize: "0.875rem",
      textDecoration: "none",
      boxShadow: active ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
      transition: "color 0.15s, background 0.15s, transform 0.15s",
      whiteSpace: "nowrap",
      overflow: "hidden",
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.color = S.primary;
        e.currentTarget.style.transform = "translateX(4px)";
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.color = "#78716c";
        e.currentTarget.style.transform = "translateX(0)";
      }
    }}
  >
    {icon}
    {!collapsed && <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>{label}</span>}
  </a>
));
NavItem.displayName = "NavItem";

// ─── Nav Data ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: "Overview", active: false, href: "/beneficiary/dashboard" },
  { icon: <CreditCard size={20} />, label: "Campaigns", active: false, href: "/beneficiary/campaigns" },
  { icon: <CreditCard size={20} />, label: "Funds", active: false, href: "/beneficiary/fund-management" },
  { icon: <Landmark size={20} />, label: "Banking", active: false, href: "/beneficiary/banking-details" },
  { icon: <IdCard size={20} />, label: "Identity", active: false, href: "/beneficiary/identity-verification" },
  { icon: <User size={20} />, label: "Profile", active: false, href: "/beneficiary/profile-settings" },
  { icon: <ShieldCheck size={20} />, label: "Security", active: true, href: "/beneficiary/security-settings" },
];

const SIDEBAR_W_EXPANDED = 220;
const SIDEBAR_W_COLLAPSED = 80;

// ─── Main Component ───────────────────────────────────────────────────────────

const SecuritySettings: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(true);
  const [bioEnabled, setBioEnabled] = useState<boolean>(false);
  const [form, setForm] = useState<PasswordForm>({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<boolean>(false);
  const [pwLoading, setPwLoading] = useState<boolean>(false);
  const [activeSince, setActiveSince] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchActiveSince() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("beneficiary_profiles")
        .select("created_at")
        .eq("auth_user_id", user.id)
        .single();
      if (data?.created_at) setActiveSince(new Date(data.created_at).getFullYear());
    }
    fetchActiveSince();
  }, []);

  const logins: LoginEntry[] = [
    { date: "Oct 24, 2023 • 10:24 AM", device: "iPhone 15 Pro", ip: "192.168.1.1", status: "Success" },
    { date: "Oct 23, 2023 • 09:12 PM", device: "Chrome (macOS)", ip: "72.43.121.8", status: "Success" },
    { date: "Oct 21, 2023 • 03:45 AM", device: "Unknown Device", ip: "104.28.45.1", status: "Failed" },
  ];

  const handleFormChange =
    (field: keyof PasswordForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (form.next.length < 8 || !/\d/.test(form.next)) {
      setPwError("New password must be at least 8 characters and contain one number.");
      return;
    }
    if (form.next !== form.confirm) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwLoading(true);

    try {
      // Step 1: Get current user's email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setPwError("Could not identify your account. Please log in again.");
        setPwLoading(false);
        return;
      }

      // Step 2: Re-authenticate with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: form.current,
      });

      if (signInError) {
        setPwError("Current password is incorrect.");
        setPwLoading(false);
        return;
      }

      // Step 3: Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: form.next,
      });

      if (updateError) {
        setPwError(updateError.message);
        setPwLoading(false);
        return;
      }

      setPwSuccess(true);
      setForm({ current: "", next: "", confirm: "" });
    } catch {
      setPwError("Something went wrong. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const sidebarW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  return (
    <div style={{ background: S.surface, color: S.onSurface, minHeight: "100vh", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      <BeneficiaryStyle />
      <style>{`
        .nav-transition { transition: width 0.3s cubic-bezier(0.4,0,0.2,1); }
        .main-transition { transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      {/* TopNav */}
      <nav
        style={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0px 12px 32px rgba(151,69,62,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          padding: "0 2rem",
          height: "5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={() => setCollapsed((p) => !p)}
            style={{
              padding: "0.5rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#78716c",
              borderRadius: "999px",
              display: "flex",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = S.surfaceContainerHigh)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Menu size={22} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Image src={LOGO_SRC} alt="HOPECARD Logo" width={LOGO_WIDTH} height={LOGO_HEIGHT} />
            <span style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.03em", color: S.primary }}>
              HOPECARD
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <BeneficiaryNotificationBell />

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "999px",
                background: S.primaryContainer,
                border: `2px solid ${S.primary}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.15s",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <User size={20} style={{ color: S.primary }} />
            </button>

            {profileOpen && (
              <>
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 40,
                  }}
                  onClick={() => setProfileOpen(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "3.5rem",
                    right: 0,
                    width: "16rem",
                    background: S.surfaceContainerLowest,
                    borderRadius: "0.75rem",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                    zIndex: 50,
                    border: `1px solid ${S.outlineVariant}33`,
                  }}
                >
                  <div style={{ padding: "1.5rem", borderBottom: `1px solid ${S.outlineVariant}1a` }}>
                    <p style={{ fontWeight: 700, color: S.onSurface, fontSize: "0.9375rem", margin: "0 0 0.25rem" }}>
                      Beneficiary
                    </p>
                    <p style={{ fontSize: "0.75rem", color: S.onSurfaceVariant, margin: 0 }}>
                      Beneficiary Account
                    </p>
                  </div>
                  <div style={{ padding: "0.5rem" }}>
                    <button
                      onClick={async () => {
                        const { createClient } = await import("@/beneficiary-utils/supabase/client");
                        await createClient().auth.signOut();
                        document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
                        window.location.href = "/beneficiary/login";
                      }}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        color: S.error,
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        borderRadius: "0.5rem",
                        transition: "background 0.15s",
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = `${S.errorContainer}33`)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontSize: "1.25rem" }}>→</span>
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <aside
          className="nav-transition"
          style={{
            width: `${sidebarW}px`,
            background: S.surfaceContainerHigh,
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            paddingTop: "6rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            zIndex: 40,
            overflow: "hidden",
          }}
        >
          {!collapsed && (
            <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
              <p
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: S.onSurfaceVariant,
                  marginBottom: "0.5rem",
                }}
              >
                Member Portal
              </p>
              <div style={{ padding: "1rem", background: S.surfaceContainerLowest, borderRadius: "0.5rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: S.primary, margin: "0 0 0.125rem" }}>
                  Verified Member
                </p>
                <p style={{ fontSize: "0.625rem", color: S.onSurfaceVariant, margin: 0 }}>Active since {activeSince ?? "…"}</p>
              </div>
            </div>
          )}

          {NAV_ITEMS.map(({ icon, label, active, href }) => (
            <NavItem key={label} icon={icon} label={label} active={active} collapsed={collapsed} href={href} />
          ))}

          <div style={{ marginTop: "auto", padding: collapsed ? "0 1rem 2rem" : "0 1.5rem 2rem" }}>
            <button
              style={{
                width: "100%",
                padding: collapsed ? "0.75rem" : "0.75rem 1rem",
                background: S.primary,
                color: S.onPrimary,
                borderRadius: "999px",
                fontWeight: 700,
                fontSize: "0.75rem",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: collapsed ? 0 : "0.5rem",
                transition: "opacity 0.15s",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              onClick={async () => {
                const { createClient } = await import("@/beneficiary-utils/supabase/client");
                await createClient().auth.signOut();
                document.cookie = "persona=; path=/; SameSite=Strict; Max-Age=0";
                window.location.href = "/beneficiary/login";
              }}
            >
              <LogOut size={18} />
              {!collapsed && "Log Out"}
            </button>
          </div>
        </aside>

        <main
          className="main-transition"
          style={{
            flex: 1,
            marginLeft: `${sidebarW}px`,
            padding: "2rem 3rem",
            display: "flex",
            flexDirection: "column",
            gap: "3rem",
            minHeight: "calc(100vh - 5rem)",
          }}
        >
          {/* Header */}
          <header style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h1
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 800,
                  color: S.onSurface,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                Security Settings
              </h1>
              <p style={{ fontSize: "1.125rem", color: S.onSurfaceVariant, maxWidth: "48rem", lineHeight: 1.6, margin: 0 }}>
                Manage your account security, authentication methods, and monitor login preferences to keep your funds safe.
              </p>
            </div>
          </header>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "2rem", alignItems: "start" }}>
            {/* Left Column */}
            <div style={{ gridColumn: "span 7", display: "flex", flexDirection: "column", gap: "2rem" }}>
              {/* MFA Card */}
              <div
                style={{
                  background: S.surfaceContainerLowest,
                  borderRadius: "0.75rem",
                  padding: "2rem",
                  border: `1px solid ${S.outlineVariant}1a`,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem" }}>
                    <div
                      style={{
                        width: "4rem",
                        height: "4rem",
                        borderRadius: "0.75rem",
                        background: S.surfaceContainerHigh,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: S.primary,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Vibrate size={32} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <h3
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          color: S.onSurface,
                          letterSpacing: "-0.01em",
                          margin: 0,
                        }}
                      >
                        Multi-Factor Authentication
                      </h3>
                      <p style={{ color: S.onSurfaceVariant, fontSize: "0.875rem", fontWeight: 500, margin: 0 }}>
                        Add an extra layer of protection to your account by requiring a code from your mobile device when signing in.
                      </p>
                    </div>
                  </div>
                  <div style={{ paddingTop: "0.5rem" }}>
                    <Toggle checked={mfaEnabled} onChange={setMfaEnabled} />
                  </div>
                </div>
              </div>

              {/* Biometric Card */}
              <div
                style={{
                  background: S.surfaceContainerLowest,
                  borderRadius: "0.75rem",
                  padding: "2rem",
                  border: `1px solid ${S.outlineVariant}1a`,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem" }}>
                    <div
                      style={{
                        width: "4rem",
                        height: "4rem",
                        borderRadius: "0.75rem",
                        background: S.surfaceContainerHigh,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: S.primary,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Fingerprint size={32} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <h3
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          color: S.onSurface,
                          letterSpacing: "-0.01em",
                          margin: 0,
                        }}
                      >
                        Biometric Access
                      </h3>
                      <p style={{ color: S.onSurfaceVariant, fontSize: "0.875rem", fontWeight: 500, margin: 0 }}>
                        Use FaceID, TouchID, or Android Biometrics to log in securely without entering your password every time.
                      </p>
                    </div>
                  </div>
                  <div style={{ paddingTop: "0.5rem" }}>
                    <Toggle checked={bioEnabled} onChange={setBioEnabled} />
                  </div>
                </div>
              </div>

              {/* Login Activity */}
              <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 0.5rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.01em", margin: "0 0 0.25rem" }}>
                      Login Activity
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: S.onSurfaceVariant, fontWeight: 500, margin: 0 }}>
                      Review your recent sign-ins and session status
                    </p>
                  </div>
                  <button
                    style={{
                      color: S.primary,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      transition: "opacity 0.15s",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    Review All
                  </button>
                </div>
                <div
                  style={{
                    background: S.surfaceContainerLowest,
                    borderRadius: "0.75rem",
                    boxShadow: "0px 12px 32px rgba(151,69,62,0.06)",
                    overflow: "hidden",
                    border: `1px solid ${S.outlineVariant}1a`,
                  }}
                >
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: `${S.surfaceContainerLow}80` }}>
                          {["Date", "Device/IP", "Status", "Details"].map((h, i) => (
                            <th
                              key={i}
                              style={{
                                padding: "1.25rem 2rem",
                                fontSize: "0.625rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.12em",
                                color: S.onSurfaceVariant,
                                textAlign: i === 3 ? "right" : "left",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {logins.map((entry) => (
                          <LoginRow key={`${entry.date}-${entry.ip}`} entry={entry} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Password Form */}
            <div style={{ gridColumn: "span 5", display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div
                style={{
                  background: S.surfaceContainerLowest,
                  borderRadius: "0.75rem",
                  padding: "2rem",
                  border: `1px solid ${S.outlineVariant}1a`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
                  <div
                    style={{
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "0.75rem",
                      background: S.surfaceContainerHigh,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: S.primary,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <LockKeyhole size={20} />
                  </div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: S.onSurface,
                      letterSpacing: "-0.01em",
                      margin: 0,
                    }}
                  >
                    Update Password
                  </h3>
                </div>
                <form style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} onSubmit={handleSubmit}>
                  {(
                    [
                      { label: "Current Password", field: "current" },
                      { label: "New Password", field: "next", hint: "Must be at least 8 characters with one number." },
                      { label: "Confirm New Password", field: "confirm" },
                    ] as { label: string; field: keyof PasswordForm; hint?: string }[]
                  ).map(({ label, field, hint }) => (
                    <div key={field} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label
                        style={{
                          fontSize: "0.625rem",
                          fontWeight: 800,
                          color: `${S.onSurfaceVariant}80`,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          marginLeft: "0.25rem",
                        }}
                      >
                        {label}
                      </label>
                      <input
                        style={{
                          width: "100%",
                          background: S.surfaceContainerLow,
                          border: 0,
                          borderRadius: "0.75rem",
                          padding: "1rem",
                          transition: "box-shadow 0.15s",
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                        placeholder="••••••••"
                        type="password"
                        value={form[field]}
                        onChange={handleFormChange(field)}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${S.primaryContainer}33`)}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                      />
                      {hint && (
                        <p style={{ fontSize: "0.625rem", color: S.onSurfaceVariant, marginLeft: "0.25rem", margin: 0 }}>
                          {hint}
                        </p>
                      )}
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={pwLoading}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      background: S.primaryContainer,
                      color: S.onPrimaryContainer,
                      borderRadius: "0.75rem",
                      fontWeight: 700,
                      fontSize: "1.125rem",
                      border: "none",
                      cursor: pwLoading ? "not-allowed" : "pointer",
                      opacity: pwLoading ? 0.7 : 1,
                      transition: "opacity 0.15s, transform 0.15s",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                    onMouseEnter={(e) => { if (!pwLoading) e.currentTarget.style.opacity = "0.9"; }}
                    onMouseLeave={(e) => { if (!pwLoading) e.currentTarget.style.opacity = "1"; }}
                    onMouseDown={(e) => { if (!pwLoading) e.currentTarget.style.transform = "scale(0.98)"; }}
                    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {pwLoading ? "Updating..." : "Update Password"}
                  </button>

                  {pwError && (
                    <p style={{
                      borderRadius: "0.75rem",
                      background: S.errorContainer,
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                      color: S.onErrorContainer,
                      margin: 0,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}>
                      {pwError}
                    </p>
                  )}
                  {pwSuccess && (
                    <p style={{
                      borderRadius: "0.75rem",
                      background: "#dcfce7",
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                      color: "#166534",
                      margin: 0,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}>
                      Password updated successfully.
                    </p>
                  )}
                </form>
                <div
                  style={{
                    marginTop: "2rem",
                    paddingTop: "2rem",
                    borderTop: `1px solid ${S.outlineVariant}1a`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                      fontSize: "0.75rem",
                      color: S.onSurfaceVariant,
                      background: `${S.surfaceContainerLow}80`,
                      padding: "1rem",
                      borderRadius: "0.75rem",
                    }}
                  >
                    <Info size={20} style={{ color: S.primary, flexShrink: 0 }} />
                    <p style={{ margin: 0 }}>
                      Changing your password will log you out of all other active sessions for your protection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SecuritySettings;
