"use client";

// ─── Shared Auth Primitives ────────────────────────────────────────────────────
// Import this file's exports into SignUp, Login, and Verify pages.

import React, { useState } from "react";
import { HelpCircle, ArrowRight } from "lucide-react";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
export const C = {
  primary:                "#97453e",
  primaryContainer:       "#f28d83",
  primaryFixed:           "#ffdad6",
  onPrimary:              "#ffffff",
  onPrimaryContainer:     "#6e2621",
  onPrimaryFixed:         "#3f0304",
  onPrimaryFixedVariant:  "#792e29",
  secondary:              "#a8372c",
  tertiary:               "#775a00",
  surface:                "#fcf9f8",
  surfaceContainer:       "#f0edec",
  surfaceContainerLow:    "#f6f3f2",
  surfaceContainerHigh:   "#eae7e7",
  surfaceContainerHighest:"#e5e2e1",
  surfaceContainerLowest: "#ffffff",
  onSurface:              "#1b1c1b",
  onSurfaceVariant:       "#554240",
  outline:                "#877270",
  outlineVariant:         "#dac1be",
  coralRose:              "#F28D83",
} as const;

// ─── Shared Input Field ────────────────────────────────────────────────────────
interface AuthInputProps {
  type?: string;
  placeholder?: string;
  leadIcon: React.ReactNode;
  trailIcon?: React.ReactNode;
  autoFocus?: boolean;
}
export const AuthInput = React.memo<AuthInputProps>(
  ({ type = "text", placeholder, leadIcon, trailIcon, autoFocus }) => (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: C.onSurfaceVariant, display: "flex" }}>
        {leadIcon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: "100%",
          paddingLeft: "3rem",
          paddingRight: trailIcon ? "3rem" : "1rem",
          paddingTop: "1rem",
          paddingBottom: "1rem",
          borderRadius: "1rem",
          background: C.surfaceContainerHighest,
          border: "none",
          outline: "none",
          color: C.onSurface,
          fontFamily: "Manrope, sans-serif",
          fontSize: "1rem",
          transition: "background 0.15s, box-shadow 0.15s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.currentTarget.style.background = C.surfaceContainerLowest;
          e.currentTarget.style.boxShadow = `0 0 0 1px ${C.primary}33`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.background = C.surfaceContainerHighest;
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {trailIcon && (
        <button
          type="button"
          style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.onSurfaceVariant, display: "flex" }}
        >
          {trailIcon}
        </button>
      )}
    </div>
  )
);
AuthInput.displayName = "AuthInput";

// ─── Google SVG ────────────────────────────────────────────────────────────────
export const GoogleIcon = () => (
  <svg className="google-icon" width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ─── Apple SVG ─────────────────────────────────────────────────────────────────
export const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.96.95-2.04 1.78-3.21 1.78-1.15 0-1.52-.72-2.88-.72-1.35 0-1.78.71-2.85.71-1.07 0-2.23-.93-3.21-1.89-2.01-1.99-3.54-5.63-3.54-9.04 0-5.38 3.34-8.23 6.51-8.23 1.68 0 3.12.98 4.09.98.96 0 2.59-1.13 4.54-1.13 1.01 0 3.86.37 5.71 3.01-4.63 1.83-3.87 8.33 1.07 10.4-1.11 2.87-2.27 4.13-3.23 5.13zM12.03 5.35c.03-2.14 1.77-3.86 3.88-3.9 0 0 .15 1.85-.2 3.65-.36 1.84-2.18 3.51-3.68 3.65 0 0-.03-.7-.03-1.4z"/>
  </svg>
);

// ─── Branding Left Panel (shared across all 3 auth pages) ─────────────────────
const PORTRAIT_SRCS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB0EkGzIswnIn_IzKhRCFO8gEf1DMa7kfqMp-5pahLE1yv22w9_VEoqM4NHed2PqeJWm8KnkHalN-SQOleIOwBE9rWXpruBMsm3_OXplk6SE1wBeqaPgz5iuz5h5F_qu8w7S2jTlwB_qnd6PTYY4FV3HU_lLXkR-OIvNn2Tob0-SLGMgs4b3fublsR60iL_DTrvIU0ZIyns6H7HOg8Kuu6GjrUzhakaQAll0GeudKGdUHxBN-mlDtduHiJnf_6Iza4nl-doy-hBLMwh",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCKFLlmcJoikaQyIXwZ5TB9dpgOi50A7vjdY80fbpkoy7GQ59IhbIxrgZCq09h1N_muneRjMBPizPPHJqQKYB56Erx60usIMzKszabkqNBf4xm0UMWM1ub1FDWCPbRYOZL2WETGA4osBfO5PJGT7Lv3ES3ulGXVqwqBVUjoJcO9UnEB9ro1jamloAJu5MC2gItUeQImzJgnUjM5n-0G1cxzgATPAad7w8AFpA-9v-Gq-bmNAc8gH3km1NC99vQfKWQ8V1kiNsnuj1NK",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuApegYyKKpQreIKp5eL5V3-EgqgDPpKvB0ImEhF7O20LkDnngI6EzydhAXH-XBsJTUSVOE5fSunqV_oOJFIkAgJ8VOH9b-C54DpD9KeMK_w4-Ot1gSPWi0JDG36S_fduKuIalTIIsEKJNQ8S0UJHl-1ApPruzWXFnJIhT0wvJli67lCCpacIV8JlCgI5NZHjonKQZE_mlS0iz-kS83drE1-hLKsj7FcftrFa8r4cl9Bq6v7ffoTzeQGYiX5yoVuISrgdfMP1SObowgT",
];
const LOGO_SRC = "/donor/logo_h.png";

export const BrandingPanel = React.memo(() => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "3rem",
      background: "linear-gradient(135deg, #97453E 0%, #F28D83 100%)",
      color: C.onPrimary,
      position: "relative",
      overflow: "hidden",
      flex: "0 0 50%",
    }}
  >
    {/* Top content */}
    <div style={{ position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <img src={LOGO_SRC} alt="HOPECARD Logo" style={{ width: "2.5rem", height: "2.5rem", filter: "brightness(0) invert(1)" }} />
        <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.05em", textTransform: "uppercase" }}>HOPECARD</span>
      </div>
      <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: "1.5rem" }}>
        Choose a cause,{" "}
        <br />
        <em style={{ fontStyle: "italic", fontWeight: 300 }}>give with purpose.</em>
      </h1>
      <p style={{ fontSize: "1rem", opacity: 0.9, maxWidth: "26rem", lineHeight: 1.6 }}>
        Join our community of intentional givers. Together, we move beyond transactions to transform lives through radical transparency and human connection.
      </p>
    </div>

    {/* Bottom: avatars + tagline */}
    <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex" }}>
        {PORTRAIT_SRCS.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Community member ${i + 1}`}
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "999px",
              border: `2px solid ${C.primary}`,
              objectFit: "cover",
              marginLeft: i === 0 ? 0 : "-0.75rem",
              boxShadow: `0 0 0 2px ${C.primaryContainer}33`,
            }}
          />
        ))}
        <div
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            border: `2px solid ${C.primary}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7rem",
            fontWeight: 700,
            marginLeft: "-0.75rem",
          }}
        >
          +2.4k
        </div>
      </div>
      <p style={{ fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.04em" }}>
        Join 2,400+ compassionate hearts this month.
      </p>
    </div>

    {/* Decorative heart */}
    <div style={{ position: "absolute", bottom: "-40px", right: "-40px", opacity: 0.1, fontSize: "15rem", lineHeight: 1, userSelect: "none", pointerEvents: "none", fontFamily: "serif" }}>
      ♥
    </div>
  </div>
));
BrandingPanel.displayName = "BrandingPanel";

// ─── Shared Footer ─────────────────────────────────────────────────────────────
const FOOTER_LINKS = ["Privacy Policy", "Terms of Service", "Donor Rights", "Contact Support"];

export const AuthFooter = React.memo(() => (
  <footer
    style={{
      width: "100%",
      padding: "3rem 4rem",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "1.5rem",
      background: "#F6F3F2",
      borderTop: `1px solid ${C.outlineVariant}1a`,
    }}
  >
    <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "rgba(27,28,27,0.5)", margin: 0, fontFamily: "Manrope, sans-serif" }}>
      © 2026 HOPECARD. Every gift is a human embrace.
    </p>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem" }}>
      {FOOTER_LINKS.map((label) => (
        <a
          key={label}
          href="#"
          style={{ fontSize: "0.875rem", color: "rgba(27,28,27,0.5)", fontFamily: "Manrope, sans-serif", textDecoration: "none", transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.coralRose)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(27,28,27,0.5)")}
        >
          {label}
        </a>
      ))}
    </div>
  </footer>
));
AuthFooter.displayName = "AuthFooter";

// ─── Help FAB ──────────────────────────────────────────────────────────────────
export const HelpFab = React.memo(() => {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 50 }}>
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: C.surfaceContainerLowest,
          color: C.coralRose,
          padding: "1rem",
          borderRadius: "999px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          transform: hovered ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.15s",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        <HelpCircle size={22} fill="currentColor" />
        <span
          style={{
            maxWidth: hovered ? "8rem" : 0,
            overflow: "hidden",
            transition: "max-width 0.5s",
            fontWeight: 700,
            fontSize: "0.875rem",
            fontFamily: "Manrope, sans-serif",
          }}
        >
          Need help?
        </span>
      </button>
    </div>
  );
});
HelpFab.displayName = "HelpFab";

// ─── Auth Page Shell ───────────────────────────────────────────────────────────
interface AuthShellProps {
  children: React.ReactNode;
}
export const AuthShell = React.memo<AuthShellProps>(({ children }) => (
  <div style={{ background: C.surface, fontFamily: "Manrope, sans-serif", color: C.onSurface, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
      ::selection { background: #f28d83; color: #6e2621; }
      a { text-decoration: none; }
      img { display: block; }
    `}</style>

    <main
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "2rem 1rem",
      }}
    >
      {/* Card */}
      <div
        style={{
          maxWidth: "1200px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          boxShadow: "0 12px 60px rgba(63,3,4,0.08)",
          borderRadius: "1.5rem",
          overflow: "hidden",
          background: C.surfaceContainerLowest,
          border: `1px solid ${C.outlineVariant}33`,
          minHeight: "650px",
        }}
      >
        <BrandingPanel />
        {children}
      </div>
    </main>

    <AuthFooter />
    <HelpFab />
  </div>
));
AuthShell.displayName = "AuthShell";

// ─── Social Login Buttons (shared) ────────────────────────────────────────────
async function handleGoogleLogin() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/hopecard/donor/auth/google/url`
  );
  if (!res.ok) return;
  const { url } = await res.json();
  if (url) window.location.href = url;
}

export const SocialButtons = React.memo(() => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginBottom: "2.5rem" }}>
    <button
      onClick={handleGoogleLogin}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        padding: "1rem",
        borderRadius: "1rem",
        background: C.surfaceContainerLow,
        border: "none",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "0.875rem",
        color: C.onSurface,
        fontFamily: "Manrope, sans-serif",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceContainerHigh)}
      onMouseLeave={(e) => (e.currentTarget.style.background = C.surfaceContainerLow)}
    >
      <GoogleIcon /> Google
    </button>
  </div>
));
SocialButtons.displayName = "SocialButtons";

// ─── Divider ───────────────────────────────────────────────────────────────────
export const OrDivider = React.memo(() => (
  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2.5rem" }}>
    <hr style={{ width: "100%", border: "none", borderTop: `1px solid ${C.outlineVariant}4d` }} />
    <span
      style={{
        position: "absolute",
        padding: "0 1rem",
        background: C.surfaceContainerLowest,
        color: C.onSurfaceVariant,
        fontSize: "0.75rem",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontFamily: "Manrope, sans-serif",
      }}
    >
      Or use email
    </span>
  </div>
));
OrDivider.displayName = "OrDivider";

// ─── Tab Switcher ──────────────────────────────────────────────────────────────
interface AuthTabsProps {
  active: "login" | "signup";
  onTabChange?: (tab: "login" | "signup") => void;
}
export const AuthTabs = React.memo<AuthTabsProps>(({ active, onTabChange }) => (
  <div style={{ display: "flex", background: C.surfaceContainerLow, padding: "0.375rem", borderRadius: "1rem", marginBottom: "2.5rem" }}>
    {(["Login", "Sign Up"] as const).map((label) => {
      const isActive = (label === "Login" && active === "login") || (label === "Sign Up" && active === "signup");
      const tabValue = label === "Login" ? "login" : "signup";
      return (
        <button
          key={label}
          type="button"
          onClick={() => onTabChange?.(tabValue)}
          style={{
            flex: 1,
            padding: "0.75rem 1.5rem",
            borderRadius: "0.75rem",
            fontWeight: 700,
            fontSize: "0.875rem",
            textAlign: "center",
            background: isActive ? C.surfaceContainerLowest : "transparent",
            color: isActive ? C.onPrimaryFixed : C.onSurfaceVariant,
            border: "none",
            cursor: "pointer",
            boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            fontFamily: "Manrope, sans-serif",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {label}
        </button>
      );
    })}
  </div>
));
AuthTabs.displayName = "AuthTabs";

// ─── Submit Button ─────────────────────────────────────────────────────────────
interface SubmitBtnProps {
  label: string;
}
export const SubmitBtn = React.memo<SubmitBtnProps>(({ label }) => (
  <button
    type="submit"
    style={{
      width: "100%",
      padding: "1.25rem",
      borderRadius: "1rem",
      background: C.coralRose,
      color: C.onPrimary,
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontWeight: 700,
      fontSize: "1.125rem",
      border: "none",
      cursor: "pointer",
      boxShadow: "0 8px 24px rgba(242,141,131,0.3)",
      transition: "box-shadow 0.3s, transform 0.3s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = "0 12px 32px rgba(242,141,131,0.4)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "0 8px 24px rgba(242,141,131,0.3)";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    {label}
  </button>
));
SubmitBtn.displayName = "SubmitBtn";

// ─── Mobile-only Logo Block ────────────────────────────────────────────────────
// Not needed anymore since branding panel is always visible
export const MobileLogo = React.memo(() => null);
MobileLogo.displayName = "MobileLogo";
