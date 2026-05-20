﻿"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import {
  Menu, Bell, LayoutDashboard, CreditCard,
  Landmark, IdCard, User, ShieldCheck,
  HelpCircle, TrendingUp, ArrowRight,
  X, AlertCircle, AlertTriangle, Search, Receipt, Info,
} from "lucide-react";
import { S, LOGO_SRC, LOGO_WIDTH, LOGO_HEIGHT, BeneficiaryStyle } from "@/app/(beneficiary)/beneficiary/shared/beneficiary-shared";

interface RecentTransaction {
  ref_no: string;
  date: string;
  amount: string;
  status: "Approved" | "Pending" | "Rejected";
}

interface DashboardClientProps {
  displayName: string;
  totalAmount: string;
  verificationStatus: string;
  logoutAction: () => Promise<void>;
  lastPaymentDate: string;
  lastPaymentAmount: string;
  totalTransfers: number;
  recentTransactions: RecentTransaction[];
  activeSince: number | null;
  hasBankDetails: boolean;
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
  href: string;
}

interface TransactionRowProps {
  ref_no: string;
  date: string;
  amount: string;
  status: "Approved" | "Pending" | "Rejected";
  actionIcon: React.ReactNode;
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
      marginLeft: active ? "1rem" : (collapsed ? "0.75rem" : 0),
      marginRight: active ? 0 : (collapsed ? "0.75rem" : 0),
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
    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = S.primary; e.currentTarget.style.transform = "translateX(4px)"; } }}
    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = "#78716c"; e.currentTarget.style.transform = "translateX(0)"; } }}
  >
    {icon}
    {!collapsed && <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>{label}</span>}
  </a>
));
NavItem.displayName = "NavItem";

// ─── Transaction Row Component ─────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Approved: { bg: S.surfaceContainerHighest, color: S.onSecondaryContainer },
  Pending:  { bg: S.tertiaryFixed,           color: S.onTertiaryContainer  },
  Rejected: { bg: S.errorContainer,          color: S.onErrorContainer     },
};

const TransactionRow = React.memo<TransactionRowProps>(({ ref_no, date, amount, status, actionIcon }) => {
  const style = STATUS_STYLES[status];
  return (
    <tr style={{ borderBottom: `1px solid ${S.outlineVariant}1a` }}>
      <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", fontWeight: 500 }}>{ref_no}</td>
      <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: S.onSurfaceVariant }}>{date}</td>
      <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", fontWeight: 700 }}>{amount}</td>
      <td style={{ padding: "1rem 1.5rem" }}>
        <span style={{ padding: "0.25rem 0.75rem", background: style.bg, color: style.color, borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
          {status}
        </span>
      </td>
      <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
        <button style={{ color: S.primary, background: "none", border: "none", cursor: "pointer", padding: "0.5rem", borderRadius: "999px", display: "inline-flex" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = `${S.primaryContainer}1a`)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {actionIcon}
        </button>
      </td>
    </tr>
  );
});
TransactionRow.displayName = "TransactionRow";

// ─── Nav Data ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: "Overview",   active: true,  href: "/beneficiary/dashboard"  },
  { icon: <CreditCard size={20} />,      label: "Campaigns",  active: false, href: "/beneficiary/campaigns" },
  { icon: <CreditCard size={20} />,      label: "Funds",      active: false, href: "/beneficiary/fund-management" },
  { icon: <Landmark size={20} />,        label: "Banking",    active: false, href: "/beneficiary/banking-details" },
  { icon: <IdCard size={20} />,          label: "Identity",   active: false, href: "/beneficiary/identity-verification" },
  { icon: <User size={20} />,            label: "Profile",    active: false, href: "/beneficiary/profile-settings" },
  { icon: <ShieldCheck size={20} />,     label: "Security",   active: false, href: "/beneficiary/security-settings" },
];


const SIDEBAR_W_EXPANDED = 220;
const SIDEBAR_W_COLLAPSED = 80;

export function DashboardClient({
  displayName,
  totalAmount,
  verificationStatus,
  logoutAction,
  lastPaymentDate,
  lastPaymentAmount,
  totalTransfers,
  recentTransactions,
  activeSince,
  hasBankDetails,
}: DashboardClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [toastOpen, setToastOpen] = useState(!hasBankDetails);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleSidebar = useCallback(() => setCollapsed((p) => !p), []);
  const sidebarW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  return (
    <div style={{ background: S.surface, minHeight: "100vh", color: S.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      <BeneficiaryStyle />
      <style>{`
        .nav-transition { transition: width 0.3s cubic-bezier(0.4,0,0.2,1); }
        .main-transition { transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
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
            onClick={toggleSidebar}
            style={{ padding: "0.5rem", background: "none", border: "none", cursor: "pointer", color: "#78716c", borderRadius: "999px", display: "flex", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = S.surfaceContainerHigh)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Menu size={22} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Image src={LOGO_SRC} alt="HOPECARD Logo" width={LOGO_WIDTH} height={LOGO_HEIGHT} />
            <span style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.03em", color: S.primary }}>HOPECARD</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <button
            style={{ padding: "0.5rem", background: "none", border: "none", cursor: "pointer", color: "#78716c", borderRadius: "999px", display: "flex", position: "relative", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = S.surfaceContainerHigh)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Bell size={22} />
            <span style={{ position: "absolute", top: "0.5rem", right: "0.5rem", width: "0.5rem", height: "0.5rem", background: S.error, borderRadius: "999px" }} />
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
                      {displayName}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: S.onSurfaceVariant, margin: 0 }}>
                      Beneficiary Account
                    </p>
                  </div>
                  <div style={{ padding: "0.5rem" }}>
                    <button
                      onClick={() => logoutAction()}
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
                        textAlign: "left",
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
        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
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
              <p style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: S.onSurfaceVariant, marginBottom: "0.5rem" }}>
                Member Portal
              </p>
              <div style={{ padding: "1rem", background: S.surfaceContainerLowest, borderRadius: "0.5rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: S.primary, margin: "0 0 0.125rem" }}>Verified Member</p>
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

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main
          className="main-transition"
          style={{
            flex: 1,
            marginLeft: `${sidebarW}px`,
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            minHeight: "calc(100vh - 5rem)",
          }}
        >
          {/* ── Verification Banner (Only show if rejected) ──────────────────── */}
          {verificationStatus === "rejected" && (
            <section
              style={{
                background: `${S.errorContainer}66`,
                padding: "2rem",
                borderRadius: "0.75rem",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1.5rem",
                border: `1px solid ${S.error}1a`,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem" }}>
                <div
                  style={{
                    width: "3.5rem",
                    height: "3.5rem",
                    background: S.errorContainer,
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: S.error,
                    flexShrink: 0,
                  }}
                >
                  <AlertCircle size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: S.onErrorContainer, margin: "0 0 0.25rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                    Verification Update Required
                  </h2>
                  <p style={{ color: S.onSurfaceVariant, margin: 0, maxWidth: "40rem", lineHeight: 1.5, fontSize: "0.9375rem" }}>
                    Your account verification status is currently{" "}
                    <strong style={{ color: S.error }}>Rejected</strong>. Please re-upload your valid government ID to restore full access to your funds.
                  </p>
                </div>
              </div>
              <button
                style={{
                  padding: "0.75rem 2rem",
                  background: S.error,
                  color: "#ffffff",
                  borderRadius: "999px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Re-upload Documents
              </button>
            </section>
          )}

          {/* ── Fund Tracking Panel ───────────────────────────────────────── */}
          <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {/* Total Disbursed */}
              <div style={{ background: S.surfaceContainerLowest, padding: "2rem 2.5rem", borderRadius: "1rem", boxShadow: "0px 12px 32px rgba(151,69,62,0.06)" }}>
                <p style={{ fontSize: "0.625rem", fontWeight: 700, color: S.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 1rem", opacity: 0.7 }}>
                  Total Disbursed
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontSize: "3rem", color: S.onSurface, fontWeight: 700, margin: 0, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {totalAmount.replace('₱', '').trim()}
                  </h3>
                  <span style={{ fontSize: "1.125rem", color: S.onSurfaceVariant, fontWeight: 500, opacity: 0.6 }}>PHP</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", color: S.primary, gap: "0.375rem" }}>
                  <TrendingUp size={16} />
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>+12% from last month</span>
                </div>
              </div>

              {/* Last Payment */}
              <div style={{ background: S.surfaceContainerLowest, padding: "2rem 2.5rem", borderRadius: "1rem", boxShadow: "0px 12px 32px rgba(151,69,62,0.06)" }}>
                <p style={{ fontSize: "0.625rem", fontWeight: 700, color: S.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 1rem", opacity: 0.7 }}>
                  Last Payment
                </p>
                <h3 style={{ fontSize: "2.25rem", color: S.onSurface, fontWeight: 700, margin: "0 0 1.25rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                  {lastPaymentDate}
                </h3>
                <p style={{ fontSize: "0.8125rem", color: S.onSurfaceVariant, fontWeight: 500, margin: 0, opacity: 0.7 }}>
                  {lastPaymentAmount !== "—" ? `Amount: ${lastPaymentAmount}` : "No payments yet"}
                </p>
              </div>

              {/* Total Transfers */}
              <div style={{ background: S.surfaceContainerLowest, padding: "2rem 2.5rem", borderRadius: "1rem", boxShadow: "0px 12px 32px rgba(151,69,62,0.06)" }}>
                <p style={{ fontSize: "0.625rem", fontWeight: 700, color: S.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 1rem", opacity: 0.7 }}>
                  Total Transfers
                </p>
                <h3 style={{ fontSize: "3rem", color: S.onSurface, fontWeight: 700, margin: "0 0 1.25rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {String(totalTransfers).padStart(2, "0")}
                </h3>
                <button 
                  type="button"
                  style={{ 
                    background: "none", 
                    border: "none", 
                    cursor: "pointer", 
                    color: S.primary, 
                    fontSize: "0.8125rem", 
                    fontWeight: 600, 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.375rem", 
                    padding: 0, 
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    transition: "opacity 0.15s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  View all history <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Transaction Table */}
            <div style={{ background: S.surfaceContainerLowest, borderRadius: "0.75rem", boxShadow: "0px 12px 32px rgba(151,69,62,0.06)", overflow: "hidden" }}>
              {/* Table Header */}
              <div
                style={{
                  padding: "1.5rem",
                  borderBottom: `1px solid ${S.outlineVariant}1a`,
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, fontFamily: "Plus Jakarta Sans, sans-serif" }}>Recent Transactions</h3>
                <div style={{ position: "relative", width: "18rem" }}>
                  <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#a8a29e" }} />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: "100%",
                      paddingLeft: "2.5rem",
                      paddingRight: "1rem",
                      paddingTop: "0.5rem",
                      paddingBottom: "0.5rem",
                      borderRadius: "999px",
                      border: "none",
                      background: S.surfaceContainer,
                      fontSize: "0.875rem",
                      outline: "none",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${S.primaryContainer}66`)}
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  />
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: S.surfaceContainerLow }}>
                      {["Reference", "Date", "Amount", "Status", ""].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "1rem 1.5rem",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: S.onSurfaceVariant,
                            textAlign: i === 4 ? "right" : "left",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: S.onSurfaceVariant, fontSize: "0.875rem" }}>
                          No transactions yet
                        </td>
                      </tr>
                    ) : recentTransactions
                      .filter(
                        (t) =>
                          !search ||
                          t.ref_no.toLowerCase().includes(search.toLowerCase()) ||
                          t.status.toLowerCase().includes(search.toLowerCase()),
                      )
                      .map((t) => (
                        <TransactionRow
                          key={t.ref_no}
                          {...t}
                          actionIcon={t.status === "Approved" ? <Receipt size={20} /> : <Info size={20} />}
                        />
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toastOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            zIndex: 100,
            background: S.inverseSurface,
            color: S.inverseOnSurface,
            padding: "1rem 1.5rem",
            borderRadius: "0.75rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <AlertTriangle size={20} style={{ color: S.primaryContainer, flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, margin: 0 }}>Action required</p>
            <p style={{ fontSize: "0.75rem", opacity: 0.8, margin: 0 }}>Update your bank details</p>
          </div>
          <button
            onClick={() => setToastOpen(false)}
            style={{
              marginLeft: "1rem",
              padding: "0.25rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: S.inverseOnSurface,
              display: "flex",
              borderRadius: "999px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
