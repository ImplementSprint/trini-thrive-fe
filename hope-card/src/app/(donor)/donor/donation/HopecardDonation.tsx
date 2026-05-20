"use client";

import React, { useState, useCallback } from "react";
import {
  Home, Compass, BookOpen, HandHeart, Wallet,
  Bell, ShoppingCart, User, GraduationCap,
  Star, Info, ArrowRight, X,
} from "lucide-react";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  primary:                "#97453e",
  primaryContainer:       "#f28d83",
  primaryFixed:           "#ffdad6",
  primaryFixedDim:        "#ffb4ab",
  onPrimary:              "#ffffff",
  onPrimaryContainer:     "#6e2621",
  onPrimaryFixedVariant:  "#792e29",
  secondary:              "#a8372c",
  tertiaryContainer:      "#cda336",
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
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────────
interface AmountCardProps {
  amount: string;
  pts: number;
  selected?: boolean;
  onClick: () => void;
}

interface SideNavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

// ─── Sub-Components ────────────────────────────────────────────────────────────

const SideNavItem = React.memo<SideNavItemProps>(({ icon, label, active = false }) => (
  <a
    href="#"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "0.75rem 1rem",
      borderRadius: "0.75rem",
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontWeight: active ? 700 : 600,
      color: active ? "#7f1d1d" : C.onSurfaceVariant,
      background: active ? "#fee2e2" : "transparent",
      textDecoration: "none",
      transition: "background 0.15s",
    }}
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#fff1f2"; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
  >
    {icon}
    {label}
  </a>
));
SideNavItem.displayName = "SideNavItem";

const AmountCard = React.memo<AmountCardProps>(({ amount, pts, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "1rem",
      borderRadius: "1rem",
      background: selected ? C.primaryFixed : C.surfaceContainer,
      border: `2px solid ${selected ? C.primaryContainer : "transparent"}`,
      boxShadow: selected ? `0 0 0 2px ${C.primaryContainer}33` : "none",
      textAlign: "center",
      cursor: "pointer",
      transition: "border-color 0.15s, background 0.15s",
    }}
    onMouseEnter={(e) => {
      if (!selected) e.currentTarget.style.borderColor = C.primaryContainer;
    }}
    onMouseLeave={(e) => {
      if (!selected) e.currentTarget.style.borderColor = "transparent";
    }}
  >
    <div
      style={{
        fontSize: "1.125rem",
        fontWeight: 700,
        color: selected ? C.onPrimaryContainer : C.onSurface,
        fontFamily: "Manrope, sans-serif",
      }}
    >
      {amount}
    </div>
    <div
      style={{
        fontSize: "0.75rem",
        fontWeight: 600,
        color: selected ? C.onPrimaryFixedVariant : C.tertiaryContainer,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.25rem",
        marginTop: "0.25rem",
        fontFamily: "Manrope, sans-serif",
      }}
    >
      <Star size={12} fill="currentColor" /> {pts} PTS
    </div>
  </button>
));
AmountCard.displayName = "AmountCard";

// ─── Amount Data ───────────────────────────────────────────────────────────────
const AMOUNTS: { amount: string; pts: number }[] = [
  { amount: "₱50",    pts: 5   },
  { amount: "₱100",   pts: 10  },
  { amount: "₱250",   pts: 25  },
  { amount: "₱500",   pts: 50  },
  { amount: "₱750",   pts: 75  },
  { amount: "₱1,000", pts: 100 },
];

const SIDEBAR_ITEMS = [
  { icon: <Home size={20} />,       label: "Home",    active: true  },
  { icon: <Compass size={20} />,    label: "Explore", active: false },
  { icon: <BookOpen size={20} />,   label: "Stories", active: false },
  { icon: <HandHeart size={20} />,  label: "Impact",  active: false },
  { icon: <Wallet size={20} />,     label: "Wallet",  active: false },
];

// ─── Page Component ────────────────────────────────────────────────────────────
export default function HopecardDonation() {
  const [selectedIndex, setSelectedIndex] = useState<number>(3); // ₱500 selected by default
  const [customAmount, setCustomAmount]   = useState<string>("");
  const [modalOpen, setModalOpen]         = useState<boolean>(true);

  const handleSelect = useCallback((i: number) => {
    setSelectedIndex(i);
    setCustomAmount("");
  }, []);

  return (
    <div style={{ background: C.surface, fontFamily: "Manrope, sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=Manrope:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::selection { background: #f28d8350; }
        a { text-decoration: none; }
        img { display: block; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      {/* ── Blurred Background ──────────────────────────────────────────────── */}
      <div
        style={{
          filter: modalOpen ? "blur(8px)" : "none",
          pointerEvents: modalOpen ? "none" : "auto",
          userSelect: modalOpen ? "none" : "auto",
          position: "fixed",
          inset: 0,
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            position: "fixed",
            top: 0, left: 0,
            height: "100%",
            width: "280px",
            background: "#fff5f4",
            zIndex: 70,
            boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            padding: "2rem",
            borderRight: "1px solid #ffe4e6",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.125rem", fontWeight: 800, letterSpacing: "-0.05em", textTransform: "uppercase", color: C.primaryContainer, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                HOPECARD
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {SIDEBAR_ITEMS.map(({ icon, label, active }) => (
              <SideNavItem key={label} icon={icon} label={label} active={active} />
            ))}
          </nav>

          {/* Profile Footer */}
          <div style={{ marginTop: "auto", paddingTop: "2rem", borderTop: "1px solid #ffe4e6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", background: "rgba(255,255,255,0.5)", borderRadius: "1rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "999px", background: C.primaryContainer, color: C.onPrimaryContainer, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "Manrope, sans-serif" }}>
                JD
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", fontWeight: 700, color: C.onSurface, margin: 0 }}>Jane Doe</p>
                <p style={{ fontSize: "0.75rem", color: C.onSurfaceVariant, margin: 0 }}>Member since 2023</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div style={{ marginLeft: "280px" }}>
          {/* Top Nav */}
          <nav style={{ position: "fixed", top: 0, right: 0, width: "calc(100% - 280px)", zIndex: 50, background: "rgba(252,249,248,0.85)", backdropFilter: "blur(20px)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 3rem", fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem" }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.05em", textTransform: "uppercase", color: C.primaryContainer }}>HOPECARD</span>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                {[
                  { icon: <Bell size={24} />, badge: "3" },
                  { icon: <ShoppingCart size={24} />, badge: null },
                ].map(({ icon, badge }, i) => (
                  <button key={i} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: C.primaryContainer }}>
                    {icon}
                    {badge && (
                      <span style={{ position: "absolute", top: "-0.25rem", right: "-0.25rem", width: "1rem", height: "1rem", background: "#7f1d1d", color: "#fff", fontSize: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "999px", border: `2px solid ${C.surface}` }}>{badge}</span>
                    )}
                    {!badge && <span style={{ position: "absolute", top: "-0.25rem", right: "-0.25rem", width: "0.5rem", height: "0.5rem", background: "#dc2626", borderRadius: "999px" }} />}
                  </button>
                ))}
                <button style={{ background: "none", border: "none", cursor: "pointer", color: C.primaryContainer }}><User size={24} /></button>
              </div>
            </div>
          </nav>

          {/* Hero */}
          <main style={{ paddingTop: "6rem", paddingBottom: "4rem", minHeight: "100vh" }}>
            <section style={{ padding: "4rem 3rem 6rem", maxWidth: "80rem", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4rem" }}>
              <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "2rem" }}>
                <h1 style={{ fontSize: "clamp(3rem, 8vw, 5rem)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 0.9, color: C.onSurface, margin: 0 }}>
                  fund{" "}
                  <em style={{ fontStyle: "italic", color: C.primary }}>stories</em>
                  <br />
                  that{" "}
                  <em style={{ fontStyle: "italic", color: C.primary }}>matter</em>
                </h1>
                <p style={{ fontSize: "1.25rem", color: C.onSurfaceVariant, maxWidth: "32rem", lineHeight: 1.6, margin: 0 }}>
                  Fuel verified local initiatives and start your journey of compassion today. Every contribution is a heartbeat for change.
                </p>
              </div>
              <div style={{ flex: 1, minWidth: "280px" }}>
                <div style={{ width: "100%", aspectRatio: "4/5", borderRadius: "1rem", overflow: "hidden" }}>
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI1BfmwHQwGAVxcZjih0sg322rLeYPde2axayCKDOuwipve2lvQQrTD_abyc3Y8bJPT7zqcHSPQCE9fHChfA7a4WCwPY58BLMy325QtSWCxtvT3UGuChj9SfT_px6u2gc5GhNRwToq-EZWJS5Y0e41ZEvWCIxzfwFuEZPMWPLT1B89SRltTyjH4CVa-sfDNtE8BBPFq3v_giNna9An1awL46hfnArFl0sTekViKoV-JyBbCP0Z-T3morcZSi65OtjhvzkP-Vf1DKFF" alt="Hands joining in community" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* ── Donation Modal ───────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            background: "rgba(28,21,21,0.4)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "56rem",
              background: C.surfaceContainerLowest,
              borderRadius: "1rem",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
              overflow: "hidden",
              display: "flex",
              flexWrap: "wrap",
              position: "relative",
            }}
          >
            {/* ── Left: Campaign Visual ────────────────────────────────────── */}
            <div style={{ flex: "0 0 41.666%", minWidth: "260px", position: "relative", minHeight: "300px" }}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-5Ix1KbJG0UEV0IO02exsNfs5o2hef9Xl4Xbb0uX0U_aUHh0VVHfGPUSJGZsemozBOxpUOuuDQ0Bozq6AjtMZt5RGRRmQnDFtKzWdcl3pNxnXRILNXSjlwPlE1NMyzgTRFBnD1UABsollRktQ1VyotIMEHEZZClgwWQ_QHQU6m4f7zk21eckJisL_1u8_QoNKWQdlvQtDYlrUwK3JMpX8qgL-JzRjJJIzT_DPVLg1jSNGJve5UUESJQINDGvav8tZXsUv9r465FGB"
                alt="Rural classroom in the Philippines"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Gradient overlay */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />
              {/* Text overlay */}
              <div style={{ position: "absolute", bottom: 0, left: 0, padding: "2rem", color: "#ffffff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <GraduationCap size={18} style={{ color: C.primaryContainer }} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>Education Fund</span>
                </div>
                <h2 style={{ fontSize: "1.875rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "0.5rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Rural Education Fund</h2>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", lineHeight: 1.6, maxWidth: "18rem", margin: 0 }}>
                  Empowering the next generation of learners in remote communities through essential classroom resources.
                </p>
              </div>
            </div>

            {/* ── Right: Donation Form ─────────────────────────────────────── */}
            <div style={{ flex: 1, minWidth: "260px", padding: "3rem", display: "flex", flexDirection: "column" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: C.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif", margin: "0 0 0.25rem" }}>Choose Amount</h3>
                  <p style={{ color: C.onSurfaceVariant, fontSize: "0.875rem", margin: 0 }}>Select a contribution level to start making an impact.</p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: C.outline, display: "flex", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.onSurface)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.outline)}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Amount Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                {AMOUNTS.map((a, i) => (
                  <AmountCard
                    key={a.amount}
                    amount={a.amount}
                    pts={a.pts}
                    selected={selectedIndex === i}
                    onClick={() => handleSelect(i)}
                  />
                ))}
              </div>

              {/* Custom Amount */}
              <div style={{ marginBottom: "2rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: C.onSurfaceVariant, marginBottom: "0.5rem", fontFamily: "Manrope, sans-serif" }}>
                  Enter custom amount
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: C.onSurface, fontWeight: 700 }}>₱</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setCustomAmount(e.target.value);
                      setSelectedIndex(-1);
                    }}
                    style={{
                      width: "100%",
                      background: C.surfaceContainerHighest,
                      border: "none",
                      borderRadius: "0.75rem",
                      padding: "1rem 1rem 1rem 2.5rem",
                      outline: "none",
                      color: C.onSurface,
                      fontWeight: 700,
                      fontSize: "1.125rem",
                      fontFamily: "Manrope, sans-serif",
                    }}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${C.primaryContainer}80`; }}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              {/* Compliance Note */}
              <div style={{ background: C.surfaceContainerLow, borderRadius: "1rem", padding: "1.25rem", marginBottom: "2.5rem", display: "flex", gap: "0.75rem" }}>
                <Info size={20} fill="currentColor" style={{ color: C.primary, flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: C.onSurface, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.25rem", fontFamily: "Manrope, sans-serif" }}>Annual Contribution Limit</p>
                  <p style={{ fontSize: "0.75rem", color: C.onSurfaceVariant, lineHeight: 1.6, margin: 0, fontFamily: "Manrope, sans-serif" }}>
                    Your contributions are subject to individual limits as per the TRAIN Law disclosure guidelines. Impact points are credited upon verified transaction completion.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <button
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
                  transition: "background 0.15s, transform 0.1s",
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "1rem",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = C.primaryContainer; e.currentTarget.style.color = C.onPrimaryContainer; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <span>Add to Cart</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
