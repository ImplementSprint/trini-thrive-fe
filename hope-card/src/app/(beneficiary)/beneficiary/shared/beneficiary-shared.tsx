"use client";

// ─── Shared Beneficiary Design System ──────────────────────────────────────────
// Used by: Login, Signup, OTP, Dashboard pages

import React from "react";
import Image from "next/image";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
export const S = {
  primary:                "#97453e",
  primaryContainer:       "#f28d83",
  primaryFixed:           "#ffdad6",
  onPrimary:              "#ffffff",
  onPrimaryContainer:     "#6e2621",
  onPrimaryFixed:         "#3f0304",
  secondary:              "#934841",
  secondaryContainer:     "#fea096",
  onSecondaryContainer:   "#79342e",
  tertiary:               "#775a00",
  tertiaryFixed:          "#ffdf98",
  onTertiaryContainer:    "#4f3b00",
  error:                  "#ba1a1a",
  errorContainer:         "#ffdad6",
  onErrorContainer:       "#93000a",
  surface:                "#fff8f7",
  surfaceContainer:       "#ffe9e7",
  surfaceContainerLow:    "#fff0ef",
  surfaceContainerHigh:   "#fae3e1",
  surfaceContainerHighest:"#f4dddc",
  surfaceContainerLowest: "#ffffff",
  inverseSurface:         "#3b2d2c",
  inverseOnSurface:       "#ffedeb",
  onSurface:              "#241918",
  onSurfaceVariant:       "#554240",
  outline:                "#877270",
  outlineVariant:         "#dac1be",
  coralRose:              "#F28D83",
} as const;

export const LOGO_SRC = "/beneficiary/images/logo_h.png";

// Logo dimensions - 2rem height (32px) with proper aspect ratio
export const LOGO_WIDTH = 80;
export const LOGO_HEIGHT = 32;

// ─── Shared Global Style ───────────────────────────────────────────────────────
export const BeneficiaryStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    ::selection { background: #f28d83; color: #6e2621; }
    a { text-decoration: none; }
    img { display: block; }
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }
  `}</style>
);

// ─── Shared Card Logo Block ────────────────────────────────────────────────────
export const CardLogo = React.memo(() => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "2rem" }}>
    <Image src={LOGO_SRC} alt="HOPECARD Logo" width={LOGO_WIDTH} height={LOGO_HEIGHT} priority />
    <span style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.03em", color: S.primary }}>HOPECARD</span>
  </div>
));
CardLogo.displayName = "CardLogo";

// ─── Shared Field Label ────────────────────────────────────────────────────────
export const FieldLabel = React.memo<{ children: React.ReactNode }>(({ children }) => (
  <label
    style={{
      display: "block",
      fontSize: "0.625rem",
      fontWeight: 800,
      color: `${S.onSurfaceVariant}80`,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      marginLeft: "0.25rem",
      marginBottom: "0.5rem",
      fontFamily: "Plus Jakarta Sans, sans-serif",
    }}
  >
    {children}
  </label>
));
FieldLabel.displayName = "FieldLabel";

// ─── Shared Input Base ─────────────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "1rem 1.25rem",
  background: S.surfaceContainerLow,
  border: `1px solid ${S.outlineVariant}4d`,
  borderRadius: "0.75rem",
  color: S.onSurface,
  fontFamily: "Plus Jakarta Sans, sans-serif",
  fontSize: "1rem",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  boxSizing: "border-box",
};

export const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = S.primary;
    e.currentTarget.style.boxShadow = `0 0 0 4px ${S.primaryContainer}33`;
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = `${S.outlineVariant}4d`;
    e.currentTarget.style.boxShadow = "none";
  },
};

// ─── Text Input ───────────────────────────────────────────────────────────────
interface TextInputProps {
  type?: string;
  placeholder?: string;
  leadIcon?: React.ReactNode;
  autoFocus?: boolean;
  "aria-label"?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  inputMode?: "text" | "numeric" | "email" | "tel";
  style?: React.CSSProperties;
}

export const TextInput = React.memo<TextInputProps>(
  ({ type = "text", placeholder, leadIcon, autoFocus, style: extraStyle, ...rest }) => (
    <div style={{ position: "relative" }}>
      {leadIcon && (
        <span
          style={{
            position: "absolute",
            left: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: S.outline,
            display: "flex",
            transition: "color 0.15s",
            pointerEvents: "none",
          }}
        >
          {leadIcon}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{ ...inputBase, paddingLeft: leadIcon ? "3rem" : "1.25rem", ...extraStyle }}
        {...focusHandlers}
        {...rest}
      />
    </div>
  )
);
TextInput.displayName = "TextInput";

// ─── Select ───────────────────────────────────────────────────────────────────
export const SelectInput = React.memo<React.SelectHTMLAttributes<HTMLSelectElement>>(({ children, ...props }) => (
  <div style={{ position: "relative" }}>
    <select
      style={{
        ...inputBase,
        appearance: "none",
        paddingRight: "2.5rem",
        cursor: "pointer",
      }}
      {...focusHandlers}
      {...props}
    >
      {children}
    </select>
    {/* Chevron */}
    <svg
      style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
      width="20" height="20" viewBox="0 0 20 20" fill="none"
    >
      <path d="m6 8 4 4 4-4" stroke={S.outline} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  </div>
));
SelectInput.displayName = "SelectInput";

// ─── Primary Submit Button ─────────────────────────────────────────────────────
export const PrimaryBtn = React.memo<{ label: string; type?: "submit" | "button"; disabled?: boolean }>(
  ({ label, type = "submit", disabled = false }) => (
    <button
      type={type}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "1rem",
        background: S.coralRose,
        color: "#ffffff",
        fontWeight: 700,
        borderRadius: "999px",
        fontSize: "1.125rem",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: "0 4px 16px rgba(242,141,131,0.3)",
        transition: "transform 0.15s",
        fontFamily: "Plus Jakarta Sans, sans-serif",
        marginTop: "1rem",
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = "scale(1.01)")}
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.transform = "scale(1)")}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.98)")}
      onMouseUp={(e) => !disabled && (e.currentTarget.style.transform = "scale(1.01)")}
    >
      {label}
    </button>
  )
);
PrimaryBtn.displayName = "PrimaryBtn";

// ─── Shared Footer ─────────────────────────────────────────────────────────────
const FOOTER_LINKS = ["Support", "Privacy Policy", "Contact"];

export const BeneficiaryFooter = React.memo(() => (
  <footer
    style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1rem",
      marginTop: "3rem",
      marginBottom: "2rem",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      {FOOTER_LINKS.map((label) => (
        <a
          key={label}
          href={`/${label.toLowerCase().replaceAll(/\s+/g, '-')}`}
          style={{
            color: `${S.onSurfaceVariant}99`,
            fontSize: "0.625rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = S.primary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = `${S.onSurfaceVariant}99`)}
        >
          {label}
        </a>
      ))}
    </div>
    <p
      style={{
        color: `${S.onSurfaceVariant}66`,
        fontSize: "0.625rem",
        letterSpacing: "0.1em",
        textAlign: "center",
        textTransform: "uppercase",
        fontWeight: 700,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        margin: 0,
      }}
    >
      © 2024 HOPECARD Beneficiary. All rights reserved.
    </p>
  </footer>
));
BeneficiaryFooter.displayName = "BeneficiaryFooter";

// ─── Ambient Card Shell ────────────────────────────────────────────────────────
export const AmbientCard = React.memo<{ children: React.ReactNode; maxWidth?: string }>(
  ({ children, maxWidth = "32rem" }) => (
    <div
      style={{
        width: "100%",
        maxWidth,
        background: S.surfaceContainerLowest,
        borderRadius: "2rem",
        padding: "clamp(2rem, 5vw, 3rem)",
        boxShadow: "0px 12px 32px rgba(151,69,62,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  )
);
AmbientCard.displayName = "AmbientCard";

// ─── Form Section Header ───────────────────────────────────────────────────────
export const FormSection = React.memo<{ icon: React.ReactNode; title: string; children: React.ReactNode }>(
  ({ icon, title, children }) => (
    <section style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          borderBottom: `1px solid ${S.outlineVariant}33`,
          paddingBottom: "0.5rem",
        }}
      >
        <span style={{ color: S.primary, display: "flex" }}>{icon}</span>
        <h2
          style={{
            fontSize: "0.75rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: `${S.onSurfaceVariant}b3`,
            margin: 0,
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
);
FormSection.displayName = "FormSection";
