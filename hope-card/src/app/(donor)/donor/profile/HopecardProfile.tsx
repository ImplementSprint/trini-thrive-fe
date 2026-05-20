"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  ShoppingCart,
  User,
  BadgeCheck,
  History,
  Receipt,
  CreditCard,
  Settings,
  KeyRound,
  Monitor,
  Laptop,
  Smartphone,
  Heart,
  Globe,
  ShieldCheck,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { useProfile } from "@/donor-hooks/useProfile";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
  const impactAmount = profile?.total_donations_amount 
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(profile.total_donations_amount)
    : "$0.00";

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
            position: "relative",
            width: "100%",
            borderRadius: "2rem",
            overflow: "hidden",
            marginBottom: "4rem",
            background: colors.surfaceContainerLow,
          }}
        >
          {/* BG gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to right, ${colors.primary}33, transparent)`,
              zIndex: 0,
            }}
          />
          {/* BG image */}
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3aM9DZCsiXcpWZJY_FEhGc8CCSE7P9Vq9Qjje96ViFRPmjMgS2P76H0L5w2d6X-SRc5rSOyjfN_d0_N5glYtbh9DOkP1f0RbzO7-l4QtgjMEAQlaCATJ5Miz5jU-9eRl3vpj4B2Fee3fVym8VZs1ookYjfxDUOS_AZWAMpRcpQotUyscZYWN0ZIbvAE4xIQ8mrux6nnZGu-8b66Zgm4cgEumew7IVLj_1s9V1PPI0MJiOydrLbDZZDbyz8crvBLylmQQmqhHa2Sf_"
            alt="Hero background — soft abstract coral background"
            style={{ width: "100%", height: "300px", objectFit: "cover", opacity: 0.6 }}
          />

          {/* Profile Info Row */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              padding: "0 3rem 2rem",
              marginTop: "-5rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              gap: "2rem",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "10rem",
                height: "10rem",
                borderRadius: "1rem",
                overflow: "hidden",
                border: `6px solid ${colors.surface}`,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                flexShrink: 0,
              }}
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdnEsN3hi4C0joKKnhz1O1oeh3UpXyAX7dEgr7Q81U-7a-JEWGxotqwmyV1KBluq9yp1x55RH_k1l1iRFw03ZgBjcauMs1F2LMD2D4lRdoTrL32GLXrRyK7Boio93vLcVVKS2hQ2a603XboUgDh-kuSfdf1IjQKu04E0j57ow4E7m8RxfA5PgeDpb4fyHJ3rx8MqO3GChPNhSypAhJZBuFYPVixVlC2dYEndjr6d4uklYd7pkfGZlp855CHfgKeZCMc0MiAzWdFH3D"
                alt="Alex Rivera profile photo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Name + Stats */}
            <div style={{ flex: 1, paddingBottom: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.5rem",
                }}
              >
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
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    background: profile?.status === 'approved' ? `${colors.secondaryContainer}33` : `${colors.surfaceContainerHigh}`,
                    color: profile?.status === 'approved' ? colors.onSecondaryContainer : colors.onSurfaceVariant,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    borderRadius: "999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontFamily: "Manrope, sans-serif",
                  }}
                >
                  <BadgeCheck size={14} fill={profile?.status === 'approved' ? "currentColor" : "none"} />
                  {profile?.status === 'approved' ? 'Verified Donor' : 'Pending Verification'}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
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
                <span
                  style={{
                    width: "1px",
                    height: "1.5rem",
                    background: `${colors.outlineVariant}4d`,
                    display: "inline-block",
                  }}
                />
                <p
                  style={{
                    color: colors.onSurfaceVariant,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  Joined {joinedDate}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <div style={{ paddingBottom: "1rem" }}>
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
                }}
              >
                Edit Profile
              </button>
            </div>
          </div>
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
                icon={<Receipt size={20} />} 
                label="Tax Receipts" 
                onClick={() => router.push('/donor/transactions')}
              />
              <SideNavItem 
                icon={<CreditCard size={20} />} 
                label="Payment Methods" 
                onClick={() => router.push('/donor/profile')}
              />
              <SideNavItem 
                icon={<Settings size={20} />} 
                label="Settings" 
                onClick={() => router.push('/donor/settings')}
              />
            </nav>

            {/* Help Card */}
            <div
              style={{
                marginTop: "3rem",
                padding: "1.5rem",
                borderRadius: "1rem",
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                color: colors.onPrimary,
                boxShadow: `0 12px 30px ${colors.primary}33`,
              }}
            >
              <h3
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                  margin: "0 0 0.5rem",
                }}
              >
                Need Help?
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  opacity: 0.9,
                  marginBottom: "1rem",
                  margin: "0 0 1rem",
                  lineHeight: 1.5,
                }}
              >
                Our donor support team is here to help you maximize your impact.
              </p>
              <button
                style={{
                  width: "100%",
                  background: colors.surfaceContainerLowest,
                  color: colors.primary,
                  padding: "0.5rem",
                  borderRadius: "0.75rem",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Manrope, sans-serif",
                }}
              >
                Contact Support
              </button>
            </div>
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
                <FormField label="Current Password" type="password" value="••••••••••••" readOnly />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "2rem",
                  }}
                >
                  <FormField
                    label="New Password"
                    name="newPassword"
                    type="password"
                    placeholder="Min. 8 characters"
                  />
                  <FormField
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                  />
                </div>

                {/* Password Strength */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0 0.25rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: colors.onSurfaceVariant,
                        fontFamily: "Manrope, sans-serif",
                      }}
                    >
                      Password Strength
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: colors.primary,
                        fontFamily: "Manrope, sans-serif",
                      }}
                    >
                      Strong
                    </span>
                  </div>
                  <div
                    style={{
                      height: "0.5rem",
                      width: "100%",
                      background: colors.surfaceContainer,
                      borderRadius: "999px",
                      display: "flex",
                      overflow: "hidden",
                    }}
                  >
                    {[1, 1, 1, 0].map((active, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: "100%",
                          background: colors.primaryContainer,
                          opacity: active ? 1 : 0.3,
                          borderRight: i < 3 ? `1px solid ${colors.surface}` : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Active Sessions ──────────────────────────────────────────── */}
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
                <Monitor size={24} color={colors.primary} />
                Active Sessions
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <SessionCard
                  icon={<Laptop size={24} />}
                  deviceName="Chrome on MacOS"
                  lastActive="Just now"
                  location="San Francisco, USA"
                  isCurrent
                />
                <SessionCard
                  icon={<Smartphone size={24} />}
                  deviceName="HOPECARD iOS App"
                  lastActive="2 hours ago"
                  location="San Francisco, USA"
                />
              </div>

              <div
                style={{
                  marginTop: "2rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: colors.onSurfaceVariant,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    fontFamily: "Manrope, sans-serif",
                    borderBottom: `1px solid ${colors.outlineVariant}4d`,
                    paddingBottom: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <LogOut size={14} />
                  Sign out from all other devices
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        style={{
          width: "100%",
          borderRadius: "3rem 3rem 0 0",
          marginTop: "4rem",
          background: "#f5f5f4",
          fontFamily: "Manrope, sans-serif",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "4rem",
            gap: "3rem",
            maxWidth: "80rem",
            margin: "0 auto",
          }}
        >
          {/* Brand */}
          <div style={{ maxWidth: "18rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#7f1d1d",
                textTransform: "uppercase",
                letterSpacing: "-0.04em",
              }}
            >
              HOPECARD
            </span>
            <p style={{ color: "#78716c", lineHeight: 1.6, margin: 0 }}>
              Empowering the world's storytellers through compassionate funding. We verify, you amplify.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              {[<Heart key="h" size={20} />, <Globe key="g" size={20} />, <ShieldCheck key="s" size={20} />].map(
                (icon, i) => (
                  <span key={i} style={{ color: "#7f1d1d", opacity: 0.3 }}>
                    {icon}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Links */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "3rem",
              flex: 1,
              paddingLeft: "4rem",
            }}
          >
            {[
              { heading: "Company", links: ["Our Story", "Impact", "Sustainability"] },
              { heading: "Resources", links: ["Support", "Privacy", "Terms"] },
            ].map(({ heading, links }) => (
              <div key={heading} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <span style={{ fontWeight: 700, color: "#7f1d1d" }}>{heading}</span>
                {links.map((l) => (
                  <a
                    key={l}
                    href="#"
                    style={{
                      color: "#78716c",
                      textDecoration: "underline",
                      textDecorationColor: "rgba(244,63,94,0.3)",
                    }}
                  >
                    {l}
                  </a>
                ))}
              </div>
            ))}

            {/* Newsletter */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <span style={{ fontWeight: 700, color: "#7f1d1d" }}>Newsletter</span>
              <div style={{ position: "relative", marginTop: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Your email"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.5)",
                    border: "none",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1rem",
                    fontSize: "0.75rem",
                    fontFamily: "Manrope, sans-serif",
                    outline: "none",
                  }}
                />
                <button
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "#7f1d1d",
                    color: "#fff",
                    border: "none",
                    padding: "0.375rem",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            padding: "0 4rem 3rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "80rem",
            margin: "0 auto",
            opacity: 0.8,
          }}
        >
          <span style={{ color: "#78716c" }}>© 2024 HOPECARD. Every card holds a heart.</span>
          <span
            style={{
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#7f1d1d",
              opacity: 0.5,
              fontWeight: 700,
            }}
          >
            Made with intentionality
          </span>
        </div>
      </footer>
    </div>
  );
}
