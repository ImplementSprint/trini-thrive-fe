"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Menu, X, BadgeCheck, Home, Compass, BookOpen, Wallet,
  History, Receipt, CreditCard, Settings, LogOut,
  Search, Bell, ShoppingCart, User, ArrowRight,
  Heart, Globe, ShieldCheck, HandHeart,
} from "lucide-react";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  primary:                 "#97453e",
  primaryContainer:        "#f28d83",
  onPrimary:               "#ffffff",
  onPrimaryContainer:      "#6e2621",
  secondary:               "#a8372c",
  secondaryContainer:      "#ff7766",
  onSecondaryContainer:    "#710d09",
  tertiary:                "#775a00",
  surface:                 "#fcf9f8",
  surfaceContainer:        "#f0edec",
  surfaceContainerLow:     "#f6f3f2",
  surfaceContainerHigh:    "#eae7e7",
  surfaceContainerHighest: "#e5e2e1",
  surfaceContainerLowest:  "#ffffff",
  onSurface:               "#1b1c1b",
  onSurfaceVariant:        "#554240",
  outlineVariant:          "#dac1be",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
interface SideNavItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  secondary?: boolean;
}

interface CampaignCardProps {
  imageSrc: string;
  imageAlt: string;
  category: string;
  title: string;
  description: string;
  raised: string;
  progressPct: number;
}

// ─── Sub-Components ────────────────────────────────────────────────────────────

const SideNavItem = React.memo<SideNavItemProps>(
  ({ icon, label, href = "#", active = false, secondary = false }) => (
    <a
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: secondary ? "0.625rem 1rem" : "0.75rem 1rem",
        borderRadius: "999px",
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontWeight: active ? 700 : secondary ? 500 : 600,
        fontSize: secondary ? "0.875rem" : "1rem",
        color: active ? C.onPrimaryContainer : C.onSurfaceVariant,
        background: active ? C.primaryContainer : "transparent",
        textDecoration: "none",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "#fff1f2";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      {icon}
      {label}
    </a>
  )
);
SideNavItem.displayName = "SideNavItem";

const CampaignCard = React.memo<CampaignCardProps>(
  ({ imageSrc, imageAlt, category, title, description, raised, progressPct }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div
          style={{
            aspectRatio: "4/3",
            borderRadius: "1rem",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.7s",
              transform: hovered ? "scale(1.1)" : "scale(1)",
            }}
          />
          <div style={{ position: "absolute", top: "1rem", left: "1rem" }}>
            <span
              style={{
                background: "rgba(252,249,248,0.9)",
                backdropFilter: "blur(8px)",
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.625rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "Manrope, sans-serif",
              }}
            >
              {category}
            </span>
          </div>
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h3
            style={{
              fontSize: "1.5rem",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              color: hovered ? C.primary : C.onSurface,
              transition: "color 0.15s",
              margin: 0,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              color: C.onSurfaceVariant,
              fontSize: "0.875rem",
              lineHeight: 1.5,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div
            style={{
              width: "100%",
              height: "6px",
              background: C.surfaceContainerHigh,
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: C.primary,
                borderRadius: "999px",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              {raised}{" "}
              <span style={{ color: "#a8a29e", fontWeight: 400 }}>raised</span>
            </span>
            <a
              href="#"
              style={{
                color: C.primary,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "0.875rem",
                textDecoration: "none",
                borderBottom: "2px solid transparent",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderBottomColor = C.primary)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderBottomColor = "transparent")
              }
            >
              Support
            </a>
          </div>
        </div>
      </div>
    );
  }
);
CampaignCard.displayName = "CampaignCard";

// ─── Campaign Data ─────────────────────────────────────────────────────────────
const CAMPAIGN_CARDS: CampaignCardProps[] = [
  {
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAp_pkQR3kWjqbJPLUmBvh1hkdW3PpTlT8COD7fDsebovTCslBusGN9Ok72C8ZWGLtQEHLon8nO8SCNXXT784VEb6d9gC9OT7F4n7kNpEj4jSFIvBrkdJ4OTq_kWtkVPpkmT74Xn3weEEhCwuJ-Jx8oALUQ3fSa9MA9fEpSpuf5_gvS5V90cxebunrLmYxlG20nCoIoBuDyzSTMN7kpVy6lHqrGeAIc5zaYGE4U8BIXIRfMoxcjtNHOFztz5Ky3QpIJ6GJPXgeJV7Vw",
    imageAlt:  "Ancient sun-drenched forest with towering trees and a clear river",
    category:  "Environment",
    title:     "Reforest the Ancient Valley",
    description: "Restoring the vital lung of the Northern Province by planting 10,000 indigenous trees.",
    raised:    "$12,000",
    progressPct: 45,
  },
  {
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzYjzjXw4izkU-j9X_8D1URwiBCtwJj30s-H1ScrkJepyx_y4BlFNMF5XcIZaHgEwboCNtQIljiIUcYgVkX9N0Tmozb_BVpkBhII58JkAwCIy29Pf0DTTaDHE73ojkBzvECDjyEm4fZ29SAfCfJR2XM4Ucgxf_xBB7LyKzOibmi30-UIASSeCXrMp0ssdcfK1cS8AGGZIvGnf8dexa27M-kQOpUCbVJUI5LZYZ5EWkMsJhjLQ8HD7ymf8G4jUpIMqVHIjRm0BkBqFM",
    imageAlt:  "A modern mobile health clinic van in a remote rural village setting",
    category:  "Health",
    title:     "Rural Mobile Health Units",
    description: "Bringing critical diagnostic care and vaccines to underserved mountainous regions.",
    raised:    "$44,800",
    progressPct: 88,
  },
  {
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5UsCKSiNJdAqBoxrbgQZ-Xp3Pz5lI7sdU7mDTj90tj3FsDHa_h1tFivvPQhiIHOlz_kim1OLj6YrH482gZA9fTCOqtLx3ekbv51PxgP7baDDYqmw8T405A-3sqtE9gc2QP18nd22xH3kcPIfI2re76nW6ipHzDdEWFgc2xOc7E3Jw7CBh_6E-iFYlsiNjpLg24oDf1DALFWpWAi-0L_rJBdI0L8LVh7qZkJVdJN9Cc6HxtFQbRtklqpiXeWFZuEazw0nW2dogH2zM",
    imageAlt:  "Group of community volunteers working together on a construction project",
    category:  "Disaster Relief",
    title:     "Coastal Resilience Hubs",
    description: "Building fortified community centers that serve as shelters during hurricane season.",
    raised:    "$32,000",
    progressPct: 32,
  },
];

const FILTER_PILLS = ["All", "Education", "Health", "Environment", "Disaster Relief"] as const;

// ─── Main Page Component ───────────────────────────────────────────────────────
export default function HopecardHome() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const handleLogout = useCallback(async () => {
    const { supabase } = await import('@/donor-lib/supabase-client');
    await supabase.auth.signOut();
    localStorage.removeItem('donor_token');
    document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    router.push('/donor/login');
  }, [router]);

  return (
    <div style={{ background: C.surface, fontFamily: "Manrope, sans-serif", color: C.onSurface, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=Manrope:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .editorial-italic { font-family: 'Plus Jakarta Sans', sans-serif; font-style: italic; font-weight: 700; }
        input::placeholder { color: #a8a29e; }
        a { text-decoration: none; }
        img { display: block; }
      `}</style>

      {/* ── Overlay ──────────────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(28,21,21,0.2)",
            backdropFilter: "blur(4px)",
            zIndex: 60,
          }}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: "280px",
          background: "#fff5f4",
          zIndex: 70,
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          padding: "2rem",
          borderRight: "1px solid #ffe4e6",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Sidebar Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                  color: C.primary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                HOPECARD
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              style={{
                padding: "0.5rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                borderRadius: "999px",
                color: "#fb7185",
                display: "flex",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <X size={20} />
            </button>
          </div>

          {/* Profile Card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "1rem",
              background: "#ffffff",
              borderRadius: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              border: "1px solid #fff1f2",
            }}
          >
            <div
              style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "999px",
                background: C.primaryContainer,
                color: C.onPrimaryContainer,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1.125rem",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              AR
            </div>
            <div>
              <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, color: C.onSurface, margin: 0 }}>
                Alex Rivera
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: C.primary,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  margin: "0.125rem 0 0",
                  fontFamily: "Manrope, sans-serif",
                }}
              >
                <BadgeCheck size={14} fill="currentColor" /> Verified Donor
              </p>
            </div>
          </div>
        </div>

        {/* Primary Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <p
            style={{
              padding: "0 1rem",
              fontSize: "0.625rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#a8a29e",
              marginBottom: "0.5rem",
              fontFamily: "Manrope, sans-serif",
            }}
          >
            Menu
          </p>
          <SideNavItem icon={<Home size={20} />} label="Home" active />
          <SideNavItem icon={<Compass size={20} />} label="Explore" />
          <SideNavItem icon={<BookOpen size={20} />} label="Stories" />
          <SideNavItem icon={<HandHeart size={20} />} label="Impact" />
          <SideNavItem icon={<Wallet size={20} />} label="Wallet" />
        </nav>

        {/* Secondary Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "2rem" }}>
          <p
            style={{
              padding: "0 1rem",
              fontSize: "0.625rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#a8a29e",
              marginBottom: "0.5rem",
              fontFamily: "Manrope, sans-serif",
            }}
          >
            Account
          </p>
          <SideNavItem icon={<History size={20} />}  label="Donation History"  secondary />
          <SideNavItem icon={<Receipt size={20} />}  label="Tax Receipts"      secondary />
          <SideNavItem icon={<CreditCard size={20} />} label="Payment Methods" secondary />
          <SideNavItem icon={<Settings size={20} />} label="Settings"          secondary />
        </nav>

        {/* Logout */}
        <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
          <button
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              padding: "1rem",
              border: "2px solid #ffe4e6",
              borderRadius: "999px",
              color: "#7f1d1d",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              background: "none",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onClick={handleLogout}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────────────── */}
      <div
        style={{
          transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
          transform: sidebarOpen ? "translateX(280px)" : "translateX(0)",
        }}
      >
        {/* ── Top Nav ────────────────────────────────────────────────────────── */}
        <nav
          style={{
            position: "fixed",
            top: 0,
            width: "100%",
            zIndex: 50,
            background: "rgba(252,249,248,0.85)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 3rem",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: "0.875rem",
            }}
          >
            {/* Left: Menu + Brand + Links */}
            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              <button
                onClick={toggleSidebar}
                style={{
                  padding: "0.5rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "999px",
                  color: "#fb7185",
                  display: "flex",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Menu size={24} />
              </button>

              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                  color: C.primaryContainer,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                HOPECARD
              </span>

              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <a
                  href="#"
                  style={{
                    color: "#7f1d1d",
                    fontWeight: 600,
                    borderBottom: "2px solid #fb7185",
                    paddingBottom: "4px",
                  }}
                >
                  Home
                </a>
                {["Explore", "Stories"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    style={{ color: "#78716c", transition: "color 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#e11d48")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#78716c")}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Center: Search */}
            <div style={{ flex: 1, maxWidth: "28rem", margin: "0 2rem", position: "relative" }}>
              <Search
                size={18}
                style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#a8a29e" }}
              />
              <input
                type="text"
                placeholder="Find a cause to support..."
                style={{
                  width: "100%",
                  background: "#f5f5f4",
                  border: "none",
                  borderRadius: "999px",
                  padding: "0.625rem 1rem 0.625rem 2.75rem",
                  fontSize: "0.875rem",
                  outline: "none",
                  fontFamily: "Manrope, sans-serif",
                }}
              />
            </div>

            {/* Right: Icons */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <button
                style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: "#fb7185" }}
              >
                <Bell size={24} />
                <span
                  style={{
                    position: "absolute",
                    top: "-0.25rem",
                    right: "-0.25rem",
                    width: "1rem",
                    height: "1rem",
                    background: "#7f1d1d",
                    color: "#fff",
                    fontSize: "0.625rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "999px",
                    border: `2px solid ${C.surface}`,
                  }}
                >
                  3
                </span>
              </button>

              <button
                style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: "#fb7185" }}
              >
                <ShoppingCart size={24} />
                <span
                  style={{
                    position: "absolute",
                    top: "-0.25rem",
                    right: "-0.25rem",
                    width: "0.5rem",
                    height: "0.5rem",
                    background: "#dc2626",
                    borderRadius: "999px",
                  }}
                />
              </button>

              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#fb7185" }}>
                <User size={24} />
              </button>
            </div>
          </div>
        </nav>

        {/* ── Page Main ────────────────────────────────────────────────────────── */}
        <main style={{ paddingTop: "6rem", paddingBottom: "4rem" }}>

          {/* Hero Section */}
          <section
            style={{
              padding: "4rem 3rem 6rem",
              maxWidth: "80rem",
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "4rem",
            }}
          >
            {/* Left copy */}
            <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "2rem" }}>
              <h1
                style={{
                  fontSize: "clamp(3.5rem, 8vw, 5rem)",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  lineHeight: 0.9,
                  color: C.onSurface,
                  margin: 0,
                }}
              >
                fund{" "}
                <em
                  style={{
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontStyle: "italic",
                    fontWeight: 700,
                    color: C.primary,
                  }}
                >
                  stories
                </em>
                <br />
                that{" "}
                <em
                  style={{
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontStyle: "italic",
                    fontWeight: 700,
                    color: C.primary,
                  }}
                >
                  matter
                </em>
              </h1>

              <p
                style={{
                  fontSize: "1.25rem",
                  color: C.onSurfaceVariant,
                  maxWidth: "32rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Fuel verified local initiatives and start your journey of compassion today. Every contribution is a heartbeat for change.
              </p>

              <div style={{ display: "flex", gap: "1rem", paddingTop: "1rem" }}>
                <button
                  style={{
                    padding: "1rem 2rem",
                    background: C.primaryContainer,
                    color: C.onPrimaryContainer,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 600,
                    borderRadius: "1rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "transform 0.15s",
                    fontSize: "1rem",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  Start Impact
                </button>
                <button
                  style={{
                    padding: "1rem 2rem",
                    background: `${C.secondary}1a`,
                    color: C.secondary,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 600,
                    borderRadius: "1rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    fontSize: "1rem",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${C.secondary}33`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = `${C.secondary}1a`)}
                >
                  Our Vision
                </button>
              </div>
            </div>

            {/* Right image */}
            <div style={{ flex: 1, minWidth: "280px", position: "relative" }}>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4/5",
                  borderRadius: "1rem",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI1BfmwHQwGAVxcZjih0sg322rLeYPde2axayCKDOuwipve2lvQQrTD_abyc3Y8bJPT7zqcHSPQCE9fHChfA7a4WCwPY58BLMy325QtSWCxtvT3UGuChj9SfT_px6u2gc5GhNRwToq-EZWJS5Y0e41ZEvWCIxzfwFuEZPMWPLT1B89SRltTyjH4CVa-sfDNtE8BBPFq3v_giNna9An1awL46hfnArFl0sTekViKoV-JyBbCP0Z-T3morcZSi65OtjhvzkP-Vf1DKFF"
                  alt="Heartwarming close-up of hands joining together in a community setting"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(to top, ${C.surface} 0%, transparent 40%)`,
                    opacity: 0.4,
                  }}
                />
              </div>

              {/* Floating stat card */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-2rem",
                  left: "-3rem",
                  background: C.surfaceContainerLowest,
                  padding: "2rem",
                  borderRadius: "1rem",
                  boxShadow: "0 25px 50px rgba(27,28,27,0.05)",
                }}
              >
                <p
                  style={{
                    color: C.tertiary,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 700,
                    fontSize: "1.875rem",
                    margin: "0 0 0.25rem",
                  }}
                >
                  12k+
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#78716c",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: 0,
                  }}
                >
                  Lives Touched Globally
                </p>
              </div>
            </div>
          </section>

          {/* ── Discovery Filter Chips ──────────────────────────────────────── */}
          <section style={{ padding: "0 3rem 3rem", overflowX: "auto" }}>
            <div
              style={{
                maxWidth: "80rem",
                margin: "0 auto",
                display: "flex",
                gap: "0.75rem",
                paddingBottom: "1rem",
              }}
            >
              {FILTER_PILLS.map((pill) => (
                <button
                  key={pill}
                  onClick={() => setActiveFilter(pill)}
                  style={{
                    padding: "0.625rem 1.5rem",
                    borderRadius: "999px",
                    background: activeFilter === pill ? "#7f1d1d" : C.surfaceContainerHigh,
                    color: activeFilter === pill ? "#ffffff" : C.onSurfaceVariant,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  {pill}
                </button>
              ))}
            </div>
          </section>

          {/* ── Featured Campaign ───────────────────────────────────────────── */}
          <section style={{ padding: "0 3rem 5rem" }}>
            <div
              style={{
                maxWidth: "80rem",
                margin: "0 auto",
                background: C.surfaceContainerLow,
                borderRadius: "1rem",
                overflow: "hidden",
                display: "flex",
                flexWrap: "wrap",
                border: `1px solid ${C.outlineVariant}1a`,
              }}
            >
              {/* Image */}
              <div style={{ flex: 1, minWidth: "300px", minHeight: "400px" }}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEwlhzTYFNViTacaL4hrAem7JPkDegYOMraAshkQ97xlsUz3xSNQFPoYVuxP4N2BAYKvB8R1AHl-Loqpdx42E2JMeOUxj70voxUiAw8UtY2uwt95aQ6OUe2vHbk-Uz3owjDynd8k8B3g2tZNN-LzC6dn72d1IPHnv7fSRr4frg-nG852aGpV0HDf8U_qAuYERnOJJFn43E4O2YwCkT7eBjtA9A3XkaYyff8nf6m4Bz0eYg88PqwVa8xYfsRWliTBXvx_W_N4LRhWYX"
                  alt="A bright classroom with eager young students in rural Africa"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  minWidth: "300px",
                  padding: "4rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2rem",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.375rem 1rem",
                    background: "#fff1f2",
                    color: "#7f1d1d",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontFamily: "Manrope, sans-serif",
                    width: "fit-content",
                  }}
                >
                  Featured Initiative
                </span>

                <h2
                  style={{
                    fontSize: "clamp(1.75rem, 3vw, 3rem)",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 700,
                    color: C.onSurface,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  Empower a New Generation of Scholars
                </h2>

                <p style={{ color: C.onSurfaceVariant, lineHeight: 1.6, margin: 0 }}>
                  We believe education is the key to breaking the cycle of poverty. Join us in providing scholarships, supplies, and mentorship to 500 students this semester.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem", fontWeight: 700, color: C.primary }}>
                      $42,300{" "}
                      <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#78716c" }}>
                        of $60k
                      </span>
                    </span>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: C.tertiary }}>
                      70% Reached
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "0.75rem",
                      background: C.surfaceContainerHighest,
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: "70%",
                        background: `linear-gradient(to right, ${C.primary}, ${C.secondaryContainer})`,
                      }}
                    />
                  </div>
                </div>

                <button
                  style={{
                    width: "100%",
                    padding: "1rem",
                    background: C.primary,
                    color: "#ffffff",
                    borderRadius: "1rem",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: `0 20px 40px ${C.primary}1a`,
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  Donate Now
                </button>
              </div>
            </div>
          </section>

          {/* ── Campaign Card Grid ──────────────────────────────────────────── */}
          <section style={{ padding: "0 3rem" }}>
            <div
              style={{
                maxWidth: "80rem",
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "3rem",
              }}
            >
              {CAMPAIGN_CARDS.map((card) => (
                <CampaignCard key={card.title} {...card} />
              ))}
            </div>
          </section>
        </main>

        {/* ── Footer ───────────────────────────────────────────────────────────── */}
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
              <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#7f1d1d", textTransform: "uppercase", letterSpacing: "-0.04em" }}>
                HOPECARD
              </span>
              <p style={{ color: "#78716c", lineHeight: 1.6, margin: 0 }}>
                Empowering the world's storytellers through compassionate funding. We verify, you amplify.
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                {[<Heart key="h" size={20} />, <Globe key="g" size={20} />, <ShieldCheck key="s" size={20} />].map(
                  (icon, i) => (
                    <span key={i} style={{ color: "#7f1d1d", opacity: 0.3 }}>{icon}</span>
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
                { heading: "Company",   links: ["Our Story", "Impact", "Sustainability"] },
                { heading: "Resources", links: ["Support",   "Privacy", "Terms"] },
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
    </div>
  );
}
