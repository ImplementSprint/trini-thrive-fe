﻿﻿"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Menu, Bell, LayoutDashboard, CreditCard,
  Landmark, IdCard, User, ShieldCheck, HelpCircle
} from "lucide-react";
import { useParams } from "next/navigation";
import { S, LOGO_SRC, LOGO_WIDTH, LOGO_HEIGHT, BeneficiaryStyle } from "@/app/(beneficiary)/beneficiary/shared/beneficiary-shared";
import { createClient } from "@/beneficiary-utils/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type DisbursementStatus = "approved" | "pending" | "rejected";

const STATUS_STYLES: Record<DisbursementStatus, string> = {
  approved: "bg-[#f4dddc] text-[#79342e]",
  pending:  "bg-[#ffdf98]/40 text-[#4f3b00]",
  rejected: "bg-[#ffdad6]/40 text-[#ba1a1a]",
};

interface CampaignDetail {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  target_amount: number;
  collected_amount: number;
  start_date: string;
  end_date: string | null;
}

interface ManagerDetail {
  full_name: string;
  organization_name: string | null;
  email: string | null;
  phone: string | null;
}

interface DisbursementRow {
  id: string;
  reference_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  disbursed_at: string | null;
  created_at: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DisbursementStatus }) {
  return (
    <span className={`px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full ${STATUS_STYLES[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Nav Item Component ───────────────────────────────────────────────────────

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  href: string;
}

const NavItem = React.memo<NavItemProps>(({ icon, label, active, collapsed, href }) => (
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

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: "Overview", active: false, href: "/beneficiary/dashboard" },
  { icon: <CreditCard size={20} />, label: "Campaigns", active: true, href: "/beneficiary/campaigns" },
  { icon: <CreditCard size={20} />, label: "Funds", active: false, href: "/beneficiary/fund-management" },
  { icon: <Landmark size={20} />, label: "Banking", active: false, href: "/beneficiary/banking-details" },
  { icon: <IdCard size={20} />, label: "Identity", active: false, href: "/beneficiary/identity-verification" },
  { icon: <User size={20} />, label: "Profile", active: false, href: "/beneficiary/profile-settings" },
  { icon: <ShieldCheck size={20} />, label: "Security", active: false, href: "/beneficiary/security-settings" },
];

const SIDEBAR_W_EXPANDED = 220;
const SIDEBAR_W_COLLAPSED = 80;

// ─── Main Component ───────────────────────────────────────────────────────────

const CampaignDetailsPage: React.FC = () => {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [manager, setManager] = useState<ManagerDetail | null>(null);
  const [disbursements, setDisbursements] = useState<DisbursementRow[]>([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [activeSince, setActiveSince] = useState<number | null>(null);

  const toggleSidebar = useCallback(() => setCollapsed((p) => !p), []);
  const sidebarW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("beneficiary_profiles")
          .select("created_at")
          .eq("auth_user_id", user.id)
          .single();
        if (profile?.created_at) setActiveSince(new Date(profile.created_at).getFullYear());

        const res = await fetch(`/beneficiary/api/campaigns/${campaignId}`);
        if (res.status === 403 || res.status === 404) {
          window.location.href = "/beneficiary/campaigns";
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setCampaign(data.campaign);
          setManager(data.manager);
          setDisbursements(data.disbursements);
          setTotalReceived(data.total_received);
        }
      } catch (error) {
        console.error("Error fetching campaign details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [campaignId]);

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
          borderBottom: `1px solid ${S.outlineVariant}1a`,
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
            padding: "2rem 3rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            minHeight: "calc(100vh - 5rem)",
          }}
        >
          {/* Header */}
          <div className="max-w-7xl mx-auto mb-12 w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-[#f4dddc] text-[#79342e] text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                {campaign?.status ?? "…"}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#241918] leading-tight mb-4">
              {loading ? "Loading…" : (campaign?.title ?? "Campaign")}
            </h1>
            <p className="text-[#554240] max-w-2xl text-lg leading-relaxed font-medium">
              {campaign?.description ?? ""}
            </p>
          </div>

          {/* Bento Grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-2 w-full">
            {/* Funding Status */}
            <div className="bg-white p-8 rounded-[2rem] shadow-[0px_12px_32px_rgba(151,69,62,0.06)] border border-[#dac1be]/10 flex flex-col justify-center min-h-[200px]">
              <p className="text-[10px] uppercase font-extrabold tracking-[0.2em] text-[#97453e] mb-4">
                Total Received
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-[#241918]">
                  ₱{totalReceived.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[#554240] font-bold text-lg">
                  / ₱{(campaign?.target_amount ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })} goal
                </span>
              </div>
              {campaign && campaign.target_amount > 0 && (
                <>
                  {(() => {
                    const pct = Math.min(100, Math.round((campaign.collected_amount / campaign.target_amount) * 100));
                    return (
                      <>
                        <div className="mt-8 w-full bg-[#fae3e1] rounded-full h-2 overflow-hidden">
                          <div className="bg-[#f28d83] h-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-4 text-[10px] font-extrabold text-[#554240] uppercase tracking-widest">
                          {pct}% of goal reached
                        </p>
                      </>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Campaign Manager */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0px_12px_32px_rgba(151,69,62,0.06)] border border-[#dac1be]/10 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#241918] mb-6 uppercase tracking-wider">
                  Campaign Manager
                </h3>
                {manager ? (
                  <>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-[#fae3e1] border-2 border-[#fff8f7] shadow-sm flex items-center justify-center">
                        <User size={28} style={{ color: S.primary }} />
                      </div>
                      <div>
                        <p className="font-extrabold text-[#241918]">{manager.full_name}</p>
                        <p className="text-sm font-bold text-[#f28d83] uppercase tracking-wide">
                          {manager.organization_name ?? "Organization"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {manager.email && (
                        <div className="flex items-center gap-3 text-sm text-[#554240] font-medium">
                          <span className="material-symbols-outlined text-[#f28d83] text-xl">mail</span>
                          {manager.email}
                        </div>
                      )}
                      {manager.phone && (
                        <div className="flex items-center gap-3 text-sm text-[#554240] font-medium">
                          <span className="material-symbols-outlined text-[#f28d83] text-xl">call</span>
                          {manager.phone}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[#554240]/70 mt-4">
                    {loading ? "Loading…" : "Manager information unavailable."}
                  </p>
                )}
              </div>
              <button
                disabled
                className="mt-8 py-3 w-full bg-[#f28d83]/50 text-[#6e2621]/60 rounded-full text-xs font-extrabold uppercase tracking-widest cursor-not-allowed shadow-sm"
              >
                Contact Organization
              </button>
            </div>

            {/* Disbursement Table */}
            <div className="bg-white rounded-[2rem] overflow-hidden border border-[#dac1be]/10 shadow-[0px_12px_32px_rgba(151,69,62,0.06)] lg:col-span-2">
              <div className="p-8 bg-[#f4dddc]/10 flex justify-between items-center border-b border-[#dac1be]/10">
                <h3 className="text-xl font-extrabold text-[#241918]">Disbursement History</h3>
                <button className="flex items-center gap-2 text-[#97453e] font-extrabold text-xs uppercase tracking-widest hover:opacity-70 transition-opacity">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export Data
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-extrabold uppercase tracking-widest text-[#554240] bg-[#fff0ef]/50">
                      <th className="px-8 py-4">Date</th>
                      <th className="px-8 py-4">Reference ID</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dac1be]/10">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-sm text-[#554240]/60 font-medium">
                          Loading…
                        </td>
                      </tr>
                    ) : disbursements.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-sm text-[#554240]/60 font-medium">
                          No disbursements yet.
                        </td>
                      </tr>
                    ) : (
                      disbursements.map((d) => (
                        <tr key={d.id} className="hover:bg-[#fff0ef]/30 transition-colors">
                          <td className="px-8 py-6 text-sm font-bold">
                            {d.disbursed_at
                              ? new Date(d.disbursed_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                              : new Date(d.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-8 py-6 text-sm font-mono text-[#554240]">#{d.reference_id}</td>
                          <td className="px-8 py-6">
                            <StatusBadge status={d.status as DisbursementStatus} />
                          </td>
                          <td className="px-8 py-6 text-right font-extrabold text-[#241918]">
                            ₱{d.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-6 text-center border-t border-[#dac1be]/10">
                <button className="text-[#97453e] font-extrabold text-xs uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
                  View Full History
                </button>
              </div>
            </div>
          </div>

          <footer className="mt-12 pb-12 text-center text-[#554240]/50 text-[10px] font-bold uppercase tracking-[0.2em]">
            © 2024 HOPECARD Beneficiary Portal. Built for community impact.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default CampaignDetailsPage;
