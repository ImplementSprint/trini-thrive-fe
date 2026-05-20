'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase-client';
import {
  Menu,
  Search,
  Bell,
  ShoppingCart,
  User,
  Heart,
  Globe,
  ShieldCheck,
  ArrowRight,
  X,
  BadgeCheck,
  Home,
  Compass,
  BookOpen,
  Wallet,
  History,
  Receipt,
  CreditCard,
  Settings,
  LogOut,
  HandHeart,
} from "lucide-react";

// Design Tokens
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

interface SharedLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

interface SideNavItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  secondary?: boolean;
  onClick?: () => void;
}

const SideNavItem = React.memo<SideNavItemProps>(
  ({ icon, label, href = "#", active = false, secondary = false, onClick }) => (
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
        padding: secondary ? "0.625rem 1rem" : "0.75rem 1rem",
        borderRadius: "999px",
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontWeight: active ? 700 : secondary ? 500 : 600,
        fontSize: secondary ? "0.875rem" : "1rem",
        color: active ? colors.onPrimaryContainer : colors.onSurfaceVariant,
        background: active ? colors.primaryContainer : "transparent",
        textDecoration: "none",
        transition: "background 0.15s",
        cursor: "pointer",
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

export default function SharedLayout({ children, currentPage = 'home' }: SharedLayoutProps) {
  const router = useRouter();
  const { cartCount } = useCart();
  const { profile, loading: profileLoading } = useProfile();
  const [searchFocused, setSearchFocused] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : '';

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : '';

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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=Manrope:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder { color: #877270; opacity: 0.7; }
        a { text-decoration: none; }
        img { display: block; }
      `}</style>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(28,21,21,0.3)",
            zIndex: 60,
            transition: "opacity 0.2s ease-out",
          }}
        />
      )}

      {/* Sidebar */}
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
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          willChange: "transform",
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
                  color: colors.primary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                HOPECARD
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
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
                background: colors.primaryContainer,
                color: colors.onPrimaryContainer,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1.125rem",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              {initials || <User size={18} />}
            </div>
            <div>
              <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, color: colors.onSurface, margin: 0 }}>
                {profileLoading ? 'Loading...' : (fullName || 'Guest')}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: colors.primary,
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
          <SideNavItem 
            icon={<Home size={20} />} 
            label="Home" 
            active={currentPage === 'home'}
            onClick={() => { router.push('/donor/home'); setSidebarOpen(false); }}
          />
          <SideNavItem 
            icon={<Compass size={20} />} 
            label="Explore" 
            active={currentPage === 'explore'}
            onClick={() => { router.push('/donor/explore'); setSidebarOpen(false); }}
          />
          <SideNavItem 
            icon={<BookOpen size={20} />} 
            label="Stories" 
            active={currentPage === 'stories'}
            onClick={() => { router.push('/donor/stories'); setSidebarOpen(false); }}
          />
          <SideNavItem 
            icon={<HandHeart size={20} />} 
            label="Impact" 
            active={currentPage === 'transactions'}
            onClick={() => { router.push('/donor/transactions'); setSidebarOpen(false); }}
          />
          <SideNavItem 
            icon={<Wallet size={20} />} 
            label="Wallet" 
            onClick={() => { router.push('/donor/profile'); setSidebarOpen(false); }}
          />
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
          <SideNavItem 
            icon={<History size={20} />} 
            label="Donation History" 
            secondary 
            onClick={() => { router.push('/donor/transactions'); setSidebarOpen(false); }}
          />
          <SideNavItem 
            icon={<Receipt size={20} />} 
            label="Tax Receipts" 
            secondary 
            onClick={() => { router.push('/donor/transactions'); setSidebarOpen(false); }}
          />
          <SideNavItem 
            icon={<CreditCard size={20} />} 
            label="Payment Methods" 
            secondary 
            onClick={() => { router.push('/donor/profile'); setSidebarOpen(false); }}
          />
          <SideNavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            secondary 
            active={currentPage === 'settings'}
            onClick={() => { router.push('/donor/settings'); setSidebarOpen(false); }}
          />
        </nav>

        {/* Logout */}
        <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
          <button
            onClick={async () => { await supabase.auth.signOut(); document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0'; router.push('/donor/login'); }}
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
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </aside>

      {/* Navigation */}
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
          {/* Brand & Menu */}
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: "0.5rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.primaryContainer,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Menu size={24} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <img 
                src="/donor/logo_h.png" 
                alt="Hopecard Logo" 
                style={{ 
                  height: "2rem", 
                  width: "auto",
                  objectFit: "contain"
                }} 
              />
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                  color: colors.primaryContainer,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                HOPECARD
              </span>
            </div>

            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              {[
                { label: "Home", path: "/home", page: "home" },
                { label: "Explore", path: "/explore", page: "explore" },
                { label: "Stories", path: "/stories", page: "stories" },
                { label: "Basket", path: "/basket", page: "basket" }
              ].map((item) => {
                const isActive = currentPage === item.page || (item.page === "basket" && currentPage === "basket");
                return (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.path)}
                    style={{
                      background: "none",
                      border: "none",
                      color: isActive ? colors.primary : "#78716c",
                      transition: "color 0.15s",
                      cursor: "pointer",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 700 : 400,
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.color = "#e11d48";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.color = "#78716c";
                    }}
                  >
                    {item.label}
                    {isActive && (
                      <span style={{
                        position: "absolute",
                        bottom: "-0.5rem",
                        left: 0,
                        right: 0,
                        height: "2px",
                        background: colors.primary,
                        borderRadius: "999px",
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: "28rem", margin: "0 2rem", position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#a8a29e",
              }}
            />
            <input
              type="text"
              autoComplete="off"
              placeholder="Find a cause to support..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: "100%",
                background: "#f5f5f4",
                border: "none",
                borderRadius: "999px",
                padding: "0.625rem 1rem 0.625rem 2.75rem",
                fontSize: "0.875rem",
                outline: "none",
                boxShadow: searchFocused ? `0 0 0 2px ${colors.primaryContainer}33` : "none",
                fontFamily: "Manrope, sans-serif",
              }}
            />
          </div>

          {/* Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <button
              style={{
                position: "relative",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: colors.primaryContainer,
              }}
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
                  border: `2px solid ${colors.surface}`,
                }}
              >
                3
              </span>
            </button>
            <button
              onClick={() => router.push('/donor/basket')}
              style={{
                position: "relative",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: colors.primaryContainer,
              }}
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
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
                    border: `2px solid ${colors.surface}`,
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => router.push('/donor/profile')}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: colors.primaryContainer,
              }}
            >
              <User size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content with top padding for fixed nav */}
      <main style={{ paddingTop: "5rem" }}>
        {children}
      </main>

      {/* Footer */}
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
