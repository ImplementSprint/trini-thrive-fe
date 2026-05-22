"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HandHeart,
  CreditCard,
  Globe,
  BadgeCheck,
  Heart,
  Mail,
} from "lucide-react";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  primary:                 "#97453e",
  primaryContainer:        "#F28D83",
  primaryFixed:            "#ffdad6",
  onPrimary:               "#ffffff",
  onPrimaryContainer:      "#6e2621",
  secondary:               "#a8372c",
  secondaryFixed:          "#ffdad5",
  tertiary:                "#006C53",
  tertiaryFixed:           "#91F6D1",
  surface:                 "#fcf9f8",
  surfaceContainer:        "#FBEAE8",
  surfaceContainerLow:     "#f6f3f2",
  surfaceContainerHigh:    "#F5E4E2",
  surfaceContainerLowest:  "#ffffff",
  onSurface:               "#1b1c1b",
  onSurfaceVariant:        "#554240",
  outlineVariant:          "#dac1be",
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
}

interface FooterColumnProps {
  heading: string;
  links: string[];
}

// ─── Sub-Components ────────────────────────────────────────────────────────────

const StatCard = React.memo<StatCardProps>(({ icon, iconBg, iconColor, value, label }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.surfaceContainerLowest,
        padding: "3rem",
        borderRadius: "2rem",
        boxShadow: hovered
          ? "0 12px 40px rgba(27,28,27,0.08)"
          : "0 12px 40px rgba(27,28,27,0.04)",
        transition: "box-shadow 0.2s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          marginBottom: "1.5rem",
          display: "inline-flex",
          padding: "1.25rem",
          background: iconBg,
          borderRadius: "1.25rem",
          color: iconColor,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontSize: "3rem",
          fontWeight: 800,
          color: C.onSurface,
          marginBottom: "0.5rem",
          lineHeight: 1,
        }}
      >
        {value}
      </h3>
      <p
        style={{
          color: C.onSurfaceVariant,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontSize: "0.625rem",
          fontFamily: "Manrope, sans-serif",
        }}
      >
        {label}
      </p>
    </div>
  );
});
StatCard.displayName = "StatCard";

const FooterColumn = React.memo<FooterColumnProps>(({ heading, links }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    <h5
      style={{
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontWeight: 700,
        color: C.onSurface,
        fontSize: "0.875rem",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        margin: 0,
      }}
    >
      {heading}
    </h5>
    <nav style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {links.map((link) => (
        <a
          key={link}
          href="#"
          style={{
            color: C.onSurfaceVariant,
            fontSize: "0.875rem",
            fontWeight: 500,
            fontFamily: "Manrope, sans-serif",
            textDecoration: "none",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.primaryContainer)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.onSurfaceVariant)}
        >
          {link}
        </a>
      ))}
    </nav>
  </div>
));
FooterColumn.displayName = "FooterColumn";

// ─── Static Data ───────────────────────────────────────────────────────────────

const STAT_CARDS: StatCardProps[] = [
  {
    icon:       <HandHeart size={28} strokeWidth={2.5} />,
    iconBg:     "#FFD4D4",
    iconColor:  "#8B3A3A",
    value:      "124k+",
    label:      "Lives Impacted",
  },
  {
    icon:       <CreditCard size={28} strokeWidth={2.5} />,
    iconBg:     "#FFD4D4",
    iconColor:  "#8B3A3A",
    value:      "₱8.2M",
    label:      "Funds Raised",
  },
  {
    icon:       <Globe size={28} strokeWidth={2.5} />,
    iconBg:     "#B8E6D5",
    iconColor:  "#2D5F4F",
    value:      "42",
    label:      "Global Partners",
  },
];

const NAV_LINKS: { label: string; active: boolean }[] = [];

const FOOTER_COLUMNS: FooterColumnProps[] = [
  { heading: "Explore", links: ["Our Story", "Impact Reports", "Community"] },
  { heading: "Support", links: ["Privacy Policy", "Contact Us", "Help Center"] },
];

// ─── Page Component ────────────────────────────────────────────────────────────
export default function HopecardMarketing() {
  const router = useRouter();
  const [stats, setStats] = useState({ 
    livesImpacted: "124K+",
    fundsRaised: "₱8.2M", 
    globalPartners: "42" 
  });

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_DONOR_BACKEND_URL;
    if (!backendUrl) return;
    fetch(`${backendUrl}/api/v1/hopecard/donor/global-stats`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          const moneyFormatter = new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            notation: "compact",
            maximumFractionDigits: 1
          });

          const lives = Math.round(data.livesImpacted);
          const livesStr = lives >= 1000
            ? new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(lives) + "+"
            : lives.toString();

          setStats({
            livesImpacted: livesStr,
            fundsRaised: moneyFormatter.format(data.fundsRaised),
            globalPartners: data.globalPartners.toString()
          });
        }
      })
      .catch(console.error);
  }, []);

  const dynamicStatCards = [
    { ...STAT_CARDS[0], value: stats.livesImpacted },
    { ...STAT_CARDS[1], value: stats.fundsRaised },
    { ...STAT_CARDS[2], value: stats.globalPartners },
  ];

  return (
    <div
      style={{
        background: C.surface,
        color: C.onSurface,
        fontFamily: "Manrope, sans-serif",
        scrollBehavior: "smooth",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::selection { background: #F28D83; color: #6e2621; }
        a { text-decoration: none; }
        img { display: block; }
      `}</style>

      {/* ── Top Nav ───────────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(252,249,248,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${C.outlineVariant}1a`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            padding: "1rem 2rem",
            maxWidth: "80rem",
            margin: "0 auto",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <img src="/donor/logo_h.png" alt="Hopecard Logo" style={{ height: "3rem", width: "auto", objectFit: "contain" }} />
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                letterSpacing: "-0.05em",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                color: C.primaryContainer,
              }}
            >
              HOPECARD
            </span>
          </div>

          {/* Center links */}
          <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            {NAV_LINKS.map(({ label, active }) => (
              <a
                key={label}
                href="#"
                style={{
                  color: active ? C.primaryContainer : C.onSurfaceVariant,
                  fontWeight: 700,
                  fontFamily: "Manrope, sans-serif",
                  borderBottom: active ? `2px solid ${C.primaryContainer}` : "2px solid transparent",
                  paddingBottom: "0.25rem",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = C.primaryContainer;
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = C.onSurfaceVariant;
                }}
              >
                {label}
              </a>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => router.push('/donor/login')}
              style={{
                padding: "0.5rem 1.25rem",
                color: C.onSurfaceVariant,
                fontWeight: 700,
                fontFamily: "Manrope, sans-serif",
                background: "none",
                border: "none",
                cursor: "pointer",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.primaryContainer)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.onSurfaceVariant)}
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/donor/login')}
              style={{
                background: C.primaryContainer,
                color: C.onPrimaryContainer,
                padding: "0.625rem 1.5rem",
                borderRadius: "1rem",
                fontWeight: 700,
                fontFamily: "Manrope, sans-serif",
                border: "none",
                cursor: "pointer",
                boxShadow: `0 8px 20px ${C.primaryContainer}33`,
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            >
              Start Giving
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "870px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "6rem 2rem",
          overflow: "hidden",
          background: `linear-gradient(to bottom, ${C.surface}, ${C.surfaceContainerLow})`,
        }}
      >
        {/* Radial accent top-right */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background: `radial-gradient(circle at top right, ${C.primaryFixed}4d, transparent 60%)`,
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "56rem", display: "flex", flexDirection: "column", gap: "2.5rem", position: "relative", zIndex: 1 }}>
          <h1
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: "clamp(2.75rem, 7vw, 4.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: C.onSurface,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Choose a Cause,{" "}
            <br />
            <span style={{ color: C.primaryContainer }}>Give with Purpose</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)",
              color: C.onSurfaceVariant,
              fontWeight: 500,
              lineHeight: 1.6,
              maxWidth: "40rem",
              margin: "0 auto",
            }}
          >
            HOPECARD isn't just a platform; it's a bridge of compassion. We turn every small contribution into a ripple of hope for communities in need.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.5rem",
              paddingTop: "1.5rem",
            }}
          >
            <button
              onClick={() => router.push('/donor/login')}
              style={{
                padding: "1.25rem 2.5rem",
                background: C.primaryContainer,
                color: C.onPrimaryContainer,
                borderRadius: "1rem",
                fontSize: "1.125rem",
                fontWeight: 700,
                fontFamily: "Manrope, sans-serif",
                border: "none",
                cursor: "pointer",
                boxShadow: `0 12px 30px ${C.primaryContainer}33`,
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Floating blur orb */}
        <div
          style={{
            position: "absolute",
            bottom: "2.5rem",
            right: "2.5rem",
            width: "16rem",
            height: "16rem",
            background: `${C.primaryContainer}33`,
            borderRadius: "999px",
            filter: "blur(100px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      </section>

      {/* ── Stats Bento Grid ───────────────────────────────────────────────────── */}
      <section style={{ padding: "6rem 2rem", maxWidth: "80rem", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          {dynamicStatCards.map((card) => (
            <div key={card.label} style={{ flex: "0 1 300px" }}>
              <StatCard {...card} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Narrative: Beyond the Transaction ────────────────────────────────── */}
      <section style={{ padding: "6rem 2rem", background: C.surfaceContainerLow }}>
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "5rem",
            alignItems: "center",
          }}
        >
          {/* Left copy */}
          <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Section label */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "6px",
                  height: "24px",
                  background: C.primaryContainer,
                  borderRadius: "999px",
                }}
              />
              <span
                style={{
                  color: C.primaryContainer,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontSize: "0.6875rem",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                Featured Impact
              </span>
            </div>

            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: C.onSurface,
                margin: 0,
              }}
            >
              Beyond the Transaction
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {[
                "In the remote villages of Malawi, hope used to be a scarce commodity. We saw families walking miles for water, yet possessing spirits that could light up the sky.",
                "Through HOPECARD, we've bridged the gap between your intent and their reality. It's not about the decimal points; it's about the dignity of a brighter future for the next generation.",
              ].map((text, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: "1.125rem",
                    color: C.onSurfaceVariant,
                    lineHeight: 1.7,
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  {text}
                </p>
              ))}
            </div>

            {/* Feature bullets */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "1rem" }}>
              {[
                {
                  icon: <BadgeCheck size={22} fill="currentColor" />,
                  title: "Transparent Tracking",
                  desc: "See exactly where your impact flows with real-time updates.",
                },
                {
                  icon: <Heart size={22} fill="currentColor" />,
                  title: "Community First",
                  desc: "Projects chosen by the people who live within them.",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem" }}>
                  <div
                    style={{
                      background: `${C.primaryContainer}1a`,
                      padding: "0.75rem",
                      borderRadius: "1rem",
                      color: C.primaryContainer,
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <h4
                      style={{
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontWeight: 700,
                        color: C.onSurface,
                        margin: "0 0 0.25rem",
                      }}
                    >
                      {title}
                    </h4>
                    <p
                      style={{
                        color: C.onSurfaceVariant,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        margin: 0,
                      }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right image */}
          <div style={{ flex: 1, minWidth: "280px", position: "relative" }}>
            <div
              style={{
                aspectRatio: "4/5",
                borderRadius: "2rem",
                overflow: "hidden",
                boxShadow: "0 12px 40px rgba(27,28,27,0.06)",
              }}
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL5BlXdw9nZDe_tWpfA_PQSkruqh-HpRkVrkaK2t7MRbMTm-3HBspnOKKAauKooPRyviv7y-FLY05iOLir3wG7vqYe8qPtbqTIzlp2LxSCQxakNOIbt4-rQAQpC8HdVRIDqTn9p_EX3eQ1jP7I7T9oiU1H5HQEIkz7ErtdDkueyrluUUfy-OWjCOJeRoOYiABRQpP2IP7OnLfuxkJHKfx8P8Bmb2eZImSna6AxdWzdn3HWDsAvcinkKDbQiWJACJ3lQJUwO5k05f8R"
                alt="Three joyful children in a rural Malawian village at golden hour"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            {/* Blur orb */}
            <div
              style={{
                position: "absolute",
                bottom: "-2rem",
                left: "-2rem",
                width: "12rem",
                height: "12rem",
                background: `${C.primaryContainer}33`,
                borderRadius: "999px",
                filter: "blur(48px)",
                zIndex: -1,
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Secondary CTA Block ────────────────────────────────────────────────── */}
      <section style={{ padding: "8rem 2rem" }}>
        <div
          style={{
            maxWidth: "64rem",
            margin: "0 auto",
            background: C.primary,
            borderRadius: "2rem",
            padding: "5rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          }}
        >
          {/* BG image overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.2,
              pointerEvents: "none",
            }}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjjSaXKP4-m05qvzsvBk33V2y5Ex1ee3YLeC-PmTyoCq98dMcRA8_AEbL3_6XMF5_h93-nXpD_AQ5wuVE6K6ImW-3FXpG-kpxf_vm69pYMVqHZeKVQEgfT_wHXyHDLbVVgvLs1p0OKbMT5WeYjfErs1RGHeJkTxVN7e4GVBWkPSgC2bKSfZeLK6YPqfVsEFLVc0OKUE9XDlOTdY9P5X598W0qNJurOyatI4hQRxQ-n3GBbwf3ity-SQ2wy4kY77FaiFokz0OEHW5E5"
              alt=""
              aria-hidden
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.75rem)",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Ready to start your journey?
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "1.25rem",
                maxWidth: "28rem",
                fontWeight: 500,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Join over 50,000 donors who are making the world a softer, more compassionate place every single day.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: "1.5rem",
                paddingTop: "1rem",
              }}
            >
              <button
                  onClick={() => router.push('/donor/login')}
                  style={{
                    background: "#ffffff",
                    color: C.primaryContainer,
                    padding: "1rem 2.5rem",
                    borderRadius: "1rem",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    fontFamily: "Manrope, sans-serif",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                >
                  Create Your Hopecard
                </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: C.surfaceContainerLow,
          borderTop: `1px solid ${C.outlineVariant}33`,
          padding: "4rem 2rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "3rem",
            maxWidth: "80rem",
            margin: "0 auto",
          }}
        >
          {/* Brand col */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h1
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                fontSize: "1.5rem",
                color: C.primaryContainer,
                opacity: 0.7,
                margin: 0,
              }}
            >
              HOPECARD
            </h1>
            <p
              style={{
                color: C.onSurfaceVariant,
                fontWeight: 500,
                fontSize: "0.875rem",
                lineHeight: 1.6,
                maxWidth: "24rem",
                margin: 0,
              }}
            >
              Cultivating a world where compassion is the primary currency. Join us in our mission to humanize the act of giving.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <FooterColumn key={col.heading} {...col} />
          ))}

          {/* Connect col */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h5
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                color: C.onSurface,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: 0,
              }}
            >
              Connect
            </h5>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {[<Globe key="g" size={22} />, <Mail key="m" size={22} />].map((icon, i) => (
                <span
                  key={i}
                  style={{
                    color: C.onSurfaceVariant,
                    cursor: "pointer",
                    transition: "color 0.15s",
                    display: "flex",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = C.primaryContainer)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = C.onSurfaceVariant)}
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            maxWidth: "80rem",
            margin: "4rem auto 0",
            paddingTop: "2rem",
            borderTop: `1px solid ${C.outlineVariant}33`,
          }}
        >
          <p
            style={{
              color: C.onSurfaceVariant,
              fontSize: "0.625rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            © 2026 HOPECARD | The Human Embrace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
