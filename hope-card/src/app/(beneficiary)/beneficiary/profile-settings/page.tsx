﻿﻿"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Menu, Bell, LayoutDashboard, CreditCard,
  Landmark, IdCard, User, ShieldCheck,
  HelpCircle, BadgeCheck, Shield as ShieldIcon, Vibrate, Fingerprint, Calendar,
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

interface SecurityPreference {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface TogglePillProps {
  enabled: boolean;
  onToggle: () => void;
}

const TogglePill: React.FC<TogglePillProps> = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    style={{
      width: "3rem",
      height: "1.5rem",
      background: enabled ? S.primary : S.outlineVariant,
      borderRadius: "999px",
      position: "relative",
      display: "flex",
      alignItems: "center",
      padding: "0.25rem",
      transition: "background 0.15s",
      border: "none",
      cursor: "pointer",
    }}
    aria-pressed={enabled}
  >
    <div
      style={{
        width: "1rem",
        height: "1rem",
        background: S.surfaceContainerLowest,
        borderRadius: "999px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        transition: "margin-left 0.15s",
        marginLeft: enabled ? "auto" : 0,
      }}
    />
  </button>
);

interface FieldProps {
  label: string;
  value: string;
  type?: React.HTMLInputTypeAttribute;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, value, type = "text", onChange, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
    <label
      style={{
        fontSize: "0.625rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        color: S.primary,
        paddingLeft: "0.25rem",
      }}
    >
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <input
        style={{
          width: "100%",
          background: S.surfaceContainerLow,
          border: "none",
          borderRadius: "0.75rem",
          padding: "0.875rem 1.5rem",
          outline: "none",
          transition: "box-shadow 0.15s",
          color: S.onSurface,
          fontSize: "0.875rem",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          boxSizing: "border-box",
        }}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${S.primaryContainer}66`)}
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
  { icon: <ShieldCheck size={20} />, label: "Security", active: false, href: "/beneficiary/security-settings" },
];

const SIDEBAR_W_EXPANDED = 220;
const SIDEBAR_W_COLLAPSED = 80;

// ─── Main Component ───────────────────────────────────────────────────────────

const ProfileSettings: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSince, setActiveSince] = useState<number | null>(null);
  const supabase = createClient();

  const [info, setInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
  });

  const [prefs, setPrefs] = useState<SecurityPreference[]>([
    {
      id: "mfa",
      icon: <Vibrate size={24} />,
      label: "Multi-Factor Authentication",
      description: "Add an extra layer of security to your account access",
      enabled: true,
    },
    {
      id: "bio",
      icon: <Fingerprint size={24} />,
      label: "Biometric Login",
      description: "Use FaceID or Fingerprint for faster sign-in",
      enabled: false,
    },
  ]);

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

  const togglePref = (id: string) =>
    setPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));

  const handleSave = () => {
    // save handler
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
          <button
            style={{
              padding: "0.5rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#78716c",
              borderRadius: "999px",
              display: "flex",
              position: "relative",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = S.surfaceContainerHigh)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Bell size={22} />
            <span
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                width: "0.5rem",
                height: "0.5rem",
                background: S.error,
                borderRadius: "999px",
              }}
            />
          </button>

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
            >
              <HelpCircle size={18} />
              {!collapsed && "Request Support"}
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
                    <Field label="Email Address" value={info.email} type="email" onChange={handleInfoChange("email")} />
                    <Field label="Phone Number" value={info.phone} type="tel" onChange={handleInfoChange("phone")} />
                    <Field
                      label="Date of Birth"
                      value={info.dob}
                      type="date"
                      onChange={handleInfoChange("dob")}
                    />
                  </>
                )}
              </div>
            </section>

            {/* Security Preferences */}
            <section
              style={{
                background: S.surfaceContainerLowest,
                borderRadius: "0.75rem",
                padding: "2rem",
                boxShadow: "0px 12px 32px rgba(151,69,62,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
                <ShieldIcon size={20} style={{ color: S.primary }} />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: S.onSurface, margin: 0 }}>
                  Security Preferences
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {prefs.map((pref) => (
                  <div
                    key={pref.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1.5rem",
                      background: S.surfaceContainerLow,
                      borderRadius: "0.75rem",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = S.surfaceContainerHigh)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = S.surfaceContainerLow)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                      <div
                        style={{
                          width: "3rem",
                          height: "3rem",
                          borderRadius: "999px",
                          background: `${S.primary}1a`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: S.primary,
                        }}
                      >
                        {pref.icon}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: S.onSurface, margin: "0 0 0.125rem" }}>{pref.label}</p>
                        <p style={{ fontSize: "0.75rem", color: S.onSurfaceVariant, margin: 0 }}>{pref.description}</p>
                      </div>
                    </div>
                    <TogglePill enabled={pref.enabled} onToggle={() => togglePref(pref.id)} />
                  </div>
                ))}
              </div>
            </section>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
