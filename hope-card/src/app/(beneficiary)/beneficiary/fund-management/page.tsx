﻿﻿﻿"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/beneficiary-utils/supabase/client";
import {
  Menu, Bell, LayoutDashboard, CreditCard,
  Landmark, IdCard, User, ShieldCheck, HelpCircle
} from "lucide-react";
import { S, LOGO_SRC, LOGO_WIDTH, LOGO_HEIGHT, BeneficiaryStyle } from "@/app/(beneficiary)/beneficiary/shared/beneficiary-shared";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  date: string;
  campaign: string;
  refId: string;
  amount: string;
  status: "Completed" | "Pending" | "Rejected";
}

interface Withdrawal {
  id: string;
  date: string;
  label: string;
  amount: string;
  status: "Successful" | "Processing" | "Failed";
  dotColor: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: Transaction["status"] }> = ({ status }) => {
  const base = "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider";
  if (status === "Completed") return <span className={`${base} bg-[#f4dddc] text-[#79342e]`}>Completed</span>;
  if (status === "Rejected")  return <span className={`${base} bg-[#ffdad6] text-[#ba1a1a]`}>Rejected</span>;
  return <span className={`${base} bg-[#ffdf98] text-[#4f3b00]`}>Pending</span>;
};

const TransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => (
  <tr className="hover:bg-[#fff0ef] transition-colors group">
    <td className="px-8 py-6 text-sm font-bold">{tx.date}</td>
    <td className="px-8 py-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f4dddc]">
          <span className="material-symbols-outlined text-sm text-[#97453e]">payments</span>
        </div>
        <span className="text-sm font-medium">{tx.campaign}</span>
      </div>
    </td>
    <td className="px-8 py-6 text-sm font-mono text-[#554240]">{tx.refId}</td>
    <td className="px-8 py-6 text-sm font-extrabold text-right">{tx.amount}</td>
    <td className="px-8 py-6 text-center">
      <StatusBadge status={tx.status} />
    </td>
  </tr>
);

const WithdrawalItem: React.FC<{ w: Withdrawal }> = ({ w }) => (
  <div className="relative pl-8 border-l-2 border-[#f28d83]/30">
    <div
      className="absolute -left-[9px] top-0 w-4 h-4 rounded-full ring-4 ring-white"
      style={{ background: w.dotColor }}
    />
    <p className="text-[10px] font-extrabold text-[#554240] uppercase tracking-widest mb-1">
      {w.date}
    </p>
    <p className="text-sm font-bold">{w.label}</p>
    <p className="text-lg font-extrabold text-[#97453e] mt-1">{w.amount}</p>
    <p
      className={`text-[10px] font-bold uppercase mt-2 ${
        w.status === "Successful" ? "text-green-600" : "text-[#4f3b00]"
      }`}
    >
      {w.status}
    </p>
  </div>
);

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
  { icon: <CreditCard size={20} />, label: "Campaigns", active: false, href: "/beneficiary/campaigns" },
  { icon: <CreditCard size={20} />, label: "Funds", active: true, href: "/beneficiary/fund-management" },
  { icon: <Landmark size={20} />, label: "Banking", active: false, href: "/beneficiary/banking-details" },
  { icon: <IdCard size={20} />, label: "Identity", active: false, href: "/beneficiary/identity-verification" },
  { icon: <User size={20} />, label: "Profile", active: false, href: "/beneficiary/profile-settings" },
  { icon: <ShieldCheck size={20} />, label: "Security", active: false, href: "/beneficiary/security-settings" },
];

const SIDEBAR_W_EXPANDED = 220;
const SIDEBAR_W_COLLAPSED = 80;

// ─── Main Component ───────────────────────────────────────────────────────────

const FundManagement: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [totalFundsReceived, setTotalFundsReceived] = useState(0);
  const [pendingDisbursements, setPendingDisbursements] = useState(0);
  const [availableForWithdrawal, setAvailableForWithdrawal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeSince, setActiveSince] = useState<number | null>(null);

  const toggleSidebar = useCallback(() => setCollapsed((p) => !p), []);
  const sidebarW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [{ data: beneficiary }, { data: profile }] = await Promise.all([
          supabase.from("beneficiaries").select("id").eq("auth_user_id", user.id).single(),
          supabase.from("beneficiary_profiles").select("created_at").eq("auth_user_id", user.id).single(),
        ]);

        if (!beneficiary) return;
        if (profile?.created_at) setActiveSince(new Date(profile.created_at).getFullYear());

        const [{ data: txRows }, { data: wdRows }] = await Promise.all([
          supabase
            .from("beneficiary_transactions")
            .select("id, reference_number, amount, status, created_at, hc_campaigns(title)")
            .eq("beneficiary_id", beneficiary.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("beneficiary_withdrawals")
            .select("id, reference_number, amount, status, created_at, beneficiary_bank_accounts(bank_name)")
            .eq("beneficiary_id", beneficiary.id)
            .order("created_at", { ascending: false }),
        ]);

        // Build transactions display
        const txDisplay: Transaction[] = (txRows ?? []).map((t: any) => ({
          id: t.id,
          date: formatDate(t.created_at),
          campaign: t.hc_campaigns?.title ?? "—",
          refId: t.reference_number,
          amount: formatCurrency(t.amount),
          status: t.status === "approved" ? "Completed" : t.status === "rejected" ? "Rejected" : "Pending",
        }));
        setTransactions(txDisplay);

        // Build withdrawals display
        const wdDisplay: Withdrawal[] = (wdRows ?? []).map((w: any) => ({
          id: w.id,
          date: formatDate(w.created_at),
          label: w.beneficiary_bank_accounts?.bank_name
            ? `Transfer to ${w.beneficiary_bank_accounts.bank_name}`
            : `Withdrawal ${w.reference_number}`,
          amount: formatCurrency(w.amount),
          status: w.status === "approved" ? "Successful" : w.status === "rejected" ? "Failed" : "Processing",
          dotColor: w.status === "approved" ? "#97453e" : w.status === "rejected" ? "#ba1a1a" : "#cda336",
        }));
        setWithdrawals(wdDisplay);

        // Compute scorecards
        const approved = (txRows ?? []).filter((t: any) => t.status === "approved");
        const pending  = (txRows ?? []).filter((t: any) => t.status === "pending");
        const wdApproved = (wdRows ?? []).filter((w: any) => w.status === "approved");

        const totalRx = approved.reduce((s: number, t: any) => s + Number(t.amount), 0);
        const totalPending = pending.reduce((s: number, t: any) => s + Number(t.amount), 0);
        const totalWd = wdApproved.reduce((s: number, w: any) => s + Number(w.amount), 0);

        setTotalFundsReceived(totalRx);
        setPendingDisbursements(totalPending);
        setAvailableForWithdrawal(Math.max(0, totalRx - totalWd));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#241918] tracking-tight mb-2">
                Fund Management
              </h1>
              <p className="text-[#554240] text-lg max-w-2xl">
                Track, manage, and withdraw your accumulated benefits with
                dignity.
              </p>
            </div>
            <a href="/beneficiary/request-withdrawal" className="bg-[#97453e] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap">
              <span className="material-symbols-outlined">
                account_balance_wallet
              </span>
              Request Withdrawal
            </a>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-xl shadow-[0px_12px_32px_rgba(151,69,62,0.06)] flex flex-col justify-between h-48 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#f28d83]/10 rounded-full group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold text-[#554240] tracking-widest uppercase">
                  Total Funds Received
                </p>
                <h3 className="text-4xl font-extrabold text-[#241918] mt-4 tracking-tight">
                  {loading ? "—" : totalFundsReceived.toLocaleString("en-PH")}{" "}
                  <span className="text-lg font-medium text-[#554240]">PHP</span>
                </h3>
              </div>
              <div className="flex items-center text-[#97453e] gap-1">
                <span className="material-symbols-outlined text-sm">
                  trending_up
                </span>
                <span className="text-xs font-bold">+12% from last month</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-xl shadow-[0px_12px_32px_rgba(151,69,62,0.06)] flex flex-col justify-between h-48 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#ffdf98]/20 rounded-full group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold text-[#554240] tracking-widest uppercase">
                  Pending Disbursements
                </p>
                <h3 className="text-4xl font-extrabold text-[#241918] mt-4 tracking-tight">
                  {loading ? "—" : pendingDisbursements.toLocaleString("en-PH")}{" "}
                  <span className="text-lg font-medium text-[#554240]">PHP</span>
                </h3>
              </div>
              <p className="text-xs text-[#554240]">
                Awaiting campaign verification
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#97453e] p-8 rounded-xl shadow-[0px_12px_32px_rgba(151,69,62,0.06)] flex flex-col justify-between h-48 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#f28d83]/20 rounded-full group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold opacity-80 tracking-widest uppercase">
                  Available for Withdrawal
                </p>
                <h3 className="text-4xl font-extrabold mt-4 tracking-tight">
                  {loading ? "—" : availableForWithdrawal.toLocaleString("en-PH")}{" "}
                  <span className="text-lg font-medium opacity-70">PHP</span>
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Ready to transfer</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Transactions */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl shadow-[0px_12px_32px_rgba(151,69,62,0.06)] overflow-hidden">
                <div className="p-8 border-b border-[#dac1be]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h3 className="text-xl font-extrabold">
                    Transaction History
                  </h3>
                  <div className="flex gap-2">
                    <button className="bg-[#fff0ef] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-[#dac1be]/20 hover:bg-[#f4dddc] transition-colors">
                      <span className="material-symbols-outlined text-sm">
                        calendar_month
                      </span>
                      Last 30 Days
                    </button>
                    <button className="bg-[#fff0ef] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-[#dac1be]/20 hover:bg-[#f4dddc] transition-colors">
                      <span className="material-symbols-outlined text-sm">
                        filter_list
                      </span>
                      Status
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#fff0ef]/50 text-[#554240] text-[10px] font-bold uppercase tracking-widest">
                        {["Date", "Source Campaign", "Reference ID", "Amount", "Status"].map(
                          (h) => (
                            <th
                              key={h}
                              className={`px-8 py-5 ${
                                h === "Amount" ? "text-right" : ""
                              } ${h === "Status" ? "text-center" : ""}`}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dac1be]/10">
                      {loading ? (
                        <tr><td colSpan={5} className="px-8 py-6 text-sm text-center text-[#554240]">Loading…</td></tr>
                      ) : transactions.length === 0 ? (
                        <tr><td colSpan={5} className="px-8 py-6 text-sm text-center text-[#554240]">No transactions yet</td></tr>
                      ) : transactions.map((tx) => (
                        <TransactionRow key={tx.id} tx={tx} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Withdrawals Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-[#fae3e1]/40 p-8 rounded-xl shadow-[0px_12px_32px_rgba(151,69,62,0.04)] border border-[#dac1be]/10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-extrabold">Withdrawals</h3>
                  <span className="material-symbols-outlined text-stone-400">
                    history
                  </span>
                </div>
                <div className="space-y-8">
                  {loading ? (
                    <p className="text-sm text-[#554240]">Loading…</p>
                  ) : withdrawals.length === 0 ? (
                    <p className="text-sm text-[#554240]">No withdrawals yet</p>
                  ) : withdrawals.map((w) => (
                    <WithdrawalItem key={w.id} w={w} />
                  ))}
                </div>
                <button className="w-full mt-10 text-[#97453e] font-bold text-xs flex items-center justify-center gap-2 hover:underline">
                  View Full Report
                  <span className="material-symbols-outlined text-sm">
                    open_in_new
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#dac1be]/15 flex justify-around py-4 z-50 shadow-lg">
        {[
          { icon: "dashboard", label: "Home", active: false, href: "/beneficiary/dashboard" },
          { icon: "payments", label: "Funds", active: true, href: "/beneficiary/fund-management" },
          { icon: "account_balance", label: "Bank", active: false, href: "/beneficiary/banking-details" },
          { icon: "person", label: "Profile", active: false, href: "/beneficiary/dashboard" },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center ${
              item.active ? "text-[#97453e]" : "text-stone-500"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                item.active
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-bold uppercase mt-1">
              {item.label}
            </span>
          </a>
        ))}
      </nav>
    </div>
  );
};

export default FundManagement;
