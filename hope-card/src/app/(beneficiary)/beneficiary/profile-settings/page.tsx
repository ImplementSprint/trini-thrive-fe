"use client";
import { BeneficiaryNotificationBell } from "@/app/(beneficiary)/beneficiary/shared/BeneficiaryNotificationBell";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Menu, LayoutDashboard, CreditCard,
  Landmark, IdCard, User, BadgeCheck,
  HelpCircle, LogOut, LockKeyhole, Info,
} from "lucide-react";
import { S, LOGO_SRC, LOGO_WIDTH, LOGO_HEIGHT, BeneficiaryStyle } from "@/app/(beneficiary)/beneficiary/shared/beneficiary-shared";
import { createClient } from "@/beneficiary-utils/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
}

interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

interface FieldProps {
  label: string;
  value: string;
  type?: React.HTMLInputTypeAttribute;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, value, type = "text", onChange, icon, disabled }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
    <label
      style={{
        fontSize: "0.625rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        color: disabled ? S.onSurfaceVariant : S.primary,
        paddingLeft: "0.25rem",
      }}
    >
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <input
        style={{
          width: "100%",
          background: disabled ? `${S.surfaceContainerLow}80` : S.surfaceContainerLow,
          border: "none",
          borderRadius: "0.75rem",
          padding: "0.875rem 1.5rem",
          outline: "none",
          transition: "box-shadow 0.15s",
          color: disabled ? S.onSurfaceVariant : S.onSurface,
          fontSize: "0.875rem",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          boxSizing: "border-box",
          cursor: disabled ? "not-allowed" : "text",
          opacity: disabled ? 0.6 : 1,
        }}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={(e) => { if (!disabled) e.currentTarget.style.boxShadow = `0 0 0 2px ${S.primaryContainer}66`; }}
        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
      />
      {icon && (
        <span
          style={{
            position: "absolute",
            right: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: `${S.onSurfaceVariant}66`,
            display: "flex",
          }}
        >
          {icon}
        </span>
      )}
    </div>
  </div>
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
  { icon: <User size={20} />, label: "Profile", active: true, href: "/beneficiary/profile-settings" },
];

const SIDEBAR_W_EXPANDED = 220;
const SIDEBAR_W_COLLAPSED = 80;

// ─── Main Component ───────────────────────────────────────────────────────────

const ProfileSettings: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeSince, setActiveSince] = useState<number | null>(null);
  const [pwForm, setPwForm] = useState<PasswordForm>({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<boolean>(false);
  const [pwLoading, setPwLoading] = useState<boolean>(false);
  const supabase = createClient();

  const [info, setInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
  });

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("No user found");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("beneficiary_profiles")
          .select("first_name, last_name, email, phone, created_at")
          .eq("auth_user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error.message);
        } else if (data) {
          setInfo({
            fullName: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            email: data.email || "",
            phone: data.phone || "",
            dob: "", // dob not in schema yet
          });
          if (data.created_at) setActiveSince(new Date(data.created_at).getFullYear());
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInfoChange =
    (field: keyof PersonalInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setInfo((prev) => ({ ...prev, [field]: e.target.value }));

  const handlePwChange = (field: keyof PasswordForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPwForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    if (pwForm.next.length < 8 || !/\d/.test(pwForm.next)) {
      setPwError("New password must be at least 8 characters and contain one number.");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) { setPwError("Could not identify your account."); return; }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: pwForm.current });
      if (signInError) { setPwError("Current password is incorrect."); return; }
      const { error: updateError } = await supabase.auth.updateUser({ password: pwForm.next });
      if (updateError) { setPwError(updateError.message); return; }
      setPwSuccess(true);
      setPwForm({ current: "", next: "", confirm: "" });
    } catch {
      setPwError("Something went wrong. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/beneficiary/login";
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const nameParts = info.fullName.trim().split(" ");
      const firstName = nameParts[0] ?? "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const { error } = await supabase
        .from("beneficiary_profiles")
        .update({ first_name: firstName, last_name: lastName, phone: info.phone })
        .eq("auth_user_id", user.id);
      if (error) { alert(error.message); return; }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
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
            gap: "2.5rem",
            minHeight: "calc(100vh - 5rem)",
          }}
        >
          <header style={{ maxWidth: "64rem", margin: "0 auto", width: "100%" }}>
            <h1
              style={{
                fontSize: "2.25rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: S.onSurface,
                margin: "0 0 0.5rem",
              }}
            >
              Profile Preferences
            </h1>
            <p style={{ color: S.onSurfaceVariant, maxWidth: "48rem", lineHeight: 1.6, margin: 0 }}>
              Manage your personal information and security settings for your HopeCard account.
            </p>
          </header>

          <div style={{ maxWidth: "64rem", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Personal Information */}
            <section
              style={{
                background: S.surfaceContainerLowest,
                borderRadius: "0.75rem",
                padding: "2rem",
                boxShadow: "0px 12px 32px rgba(151,69,62,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
                <BadgeCheck size={20} style={{ color: S.primary }} />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: S.onSurface, margin: 0 }}>
                  Personal Information
                </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.25rem 0.75rem",
                    background: "#dcfce7",
                    color: "#166534",
                    borderRadius: "999px",
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginLeft: "0.5rem",
                  }}
                >
                  <BadgeCheck size={12} />
                  {" "}
                  Verified Member
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2rem" }}>
                {loading ? (
                  <div style={{ gridColumn: "1 / -1", color: S.onSurfaceVariant, fontSize: "0.875rem" }}>
                    Loading profile...
                  </div>
                ) : (
                  <>
                    <Field label="Full Name" value={info.fullName} onChange={handleInfoChange("fullName")} />
                    <Field label="Email Address" value={info.email} type="email" onChange={handleInfoChange("email")} disabled />
                    <Field label="Phone Number" value={info.phone} type="tel" onChange={handleInfoChange("phone")} />
                    <Field label="Date of Birth" value={info.dob} type="date" onChange={handleInfoChange("dob")} />
                    <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "1rem", paddingTop: "0.5rem" }}>
                      {saveSuccess && (
                        <span style={{ fontSize: "0.875rem", color: "#166534", fontWeight: 600 }}>
                          Changes saved successfully!
                        </span>
                      )}
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                          padding: "0.875rem 2.5rem",
                          background: saving ? S.outlineVariant : S.primary,
                          color: S.onPrimary,
                          borderRadius: "999px",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          border: "none",
                          cursor: saving ? "not-allowed" : "pointer",
                          transition: "transform 0.15s, opacity 0.15s",
                          boxShadow: saving ? "none" : `0 4px 16px ${S.primary}33`,
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                          opacity: saving ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => { if (!saving) e.currentTarget.style.transform = "scale(1.02)"; }}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        {saving ? "Saving…" : "Apply Changes"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>


            {/* Change Password */}
            <section
              style={{
                background: S.surfaceContainerLowest,
                borderRadius: "0.75rem",
                padding: "2rem",
                boxShadow: "0px 12px 32px rgba(151,69,62,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
                <div
                  style={{
                    width: "3rem", height: "3rem", borderRadius: "0.75rem",
                    background: S.surfaceContainerHigh, display: "flex",
                    alignItems: "center", justifyContent: "center", color: S.primary,
                  }}
                >
                  <LockKeyhole size={20} />
                </div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: S.onSurface, margin: 0 }}>
                  Change Password
                </h2>
              </div>
              <form
                onSubmit={handlePasswordSubmit}
                style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}
              >
                {(
                  [
                    { label: "Current Password", field: "current" },
                    { label: "New Password", field: "next", hint: "At least 8 characters with one number." },
                    { label: "Confirm New Password", field: "confirm" },
                  ] as { label: string; field: keyof PasswordForm; hint?: string }[]
                ).map(({ label, field, hint }) => (
                  <div key={field} style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: S.primary, paddingLeft: "0.25rem" }}>
                      {label}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={pwForm[field]}
                      onChange={handlePwChange(field)}
                      style={{
                        background: S.surfaceContainerLow, border: "none", borderRadius: "0.75rem",
                        padding: "0.875rem 1.5rem", outline: "none", fontSize: "0.875rem",
                        fontFamily: "Plus Jakarta Sans, sans-serif", boxSizing: "border-box", width: "100%",
                      }}
                      onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${S.primaryContainer}66`)}
                      onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                    />
                    {hint && <p style={{ fontSize: "0.625rem", color: S.onSurfaceVariant, margin: 0, paddingLeft: "0.25rem" }}>{hint}</p>}
                  </div>
                ))}
                <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {pwError && (
                    <p style={{ borderRadius: "0.75rem", background: S.errorContainer, padding: "0.75rem 1rem", fontSize: "0.875rem", color: S.onErrorContainer, margin: 0 }}>
                      {pwError}
                    </p>
                  )}
                  {pwSuccess && (
                    <p style={{ borderRadius: "0.75rem", background: "#dcfce7", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#166534", margin: 0 }}>
                      Password updated successfully.
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: S.onSurfaceVariant }}>
                      <Info size={16} style={{ color: S.primary, flexShrink: 0 }} />
                      <span>Changing your password will log you out of all other active sessions.</span>
                    </div>
                    <button
                      type="submit"
                      disabled={pwLoading}
                      style={{
                        padding: "0.875rem 2.5rem", background: pwLoading ? S.outlineVariant : S.primary,
                        color: S.onPrimary, borderRadius: "999px", fontWeight: 700, fontSize: "0.875rem",
                        border: "none", cursor: pwLoading ? "not-allowed" : "pointer",
                        transition: "transform 0.15s, opacity 0.15s", opacity: pwLoading ? 0.7 : 1,
                        boxShadow: pwLoading ? "none" : `0 4px 16px ${S.primary}33`,
                        fontFamily: "Plus Jakarta Sans, sans-serif", whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => { if (!pwLoading) e.currentTarget.style.transform = "scale(1.02)"; }}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      {pwLoading ? "Updating…" : "Update Password"}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem 2rem",
                  background: "transparent",
                  color: S.primary,
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  border: `2px solid ${S.primary}`,
                  cursor: "pointer",
                  transition: "transform 0.15s, background 0.15s",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.background = `${S.primary}10`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "transparent"; }}
              >
                <LogOut size={16} />
                Log Out
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: "1rem 3rem",
                  background: S.primary,
                  color: S.onPrimary,
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  border: "none",
                  cursor: "pointer",
                  transition: "transform 0.15s",
                  boxShadow: `0 4px 16px ${S.primary}33`,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Save All Changes
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileSettings;
