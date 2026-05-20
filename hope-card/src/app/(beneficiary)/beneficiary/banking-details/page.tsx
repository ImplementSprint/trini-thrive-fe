﻿﻿﻿"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Menu, Bell, LayoutDashboard, CreditCard,
  Landmark, IdCard, User, ShieldCheck, HelpCircle, Plus, Edit, Trash2, CheckCircle
} from "lucide-react";
import { S, LOGO_SRC, LOGO_WIDTH, LOGO_HEIGHT, BeneficiaryStyle } from "@/app/(beneficiary)/beneficiary/shared/beneficiary-shared";
import { createClient } from "@/beneficiary-utils/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BankAccount {
  id: string;
  bank_name: string;
  account_holder: string;
  account_number: string;
  is_primary: boolean;
  is_profile_account: boolean;
  created_at: string;
}

interface BankingEvent {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  date: string;
  status: "Completed" | "Pending" | "Failed";
  details: string | null;
}

// ─── Banking Activity Display Map ─────────────────────────────────────────────

const EVENT_DISPLAY: Record<string, { icon: string; iconBg: string; iconColor: string; label: string }> = {
  account_added:        { icon: "🔗", iconBg: "rgba(254,160,150,0.15)", iconColor: "#934841", label: "Bank Account Added" },
  account_deactivated:  { icon: "✕",  iconBg: "rgba(255,218,214,0.5)",  iconColor: "#ba1a1a", label: "Bank Account Removed" },
  disbursement_received:{ icon: "↓",  iconBg: "rgba(186,246,196,0.3)",  iconColor: "#1b6b2d", label: "Disbursement Received" },
  withdrawal_requested: { icon: "↑",  iconBg: "rgba(254,160,150,0.15)", iconColor: "#934841", label: "Withdrawal Requested" },
  withdrawal_approved:  { icon: "✓",  iconBg: "rgba(255,223,152,0.4)", iconColor: "#775a00", label: "Withdrawal Approved" },
  withdrawal_rejected:  { icon: "!",  iconBg: "rgba(255,218,214,0.5)",  iconColor: "#ba1a1a", label: "Withdrawal Rejected" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: BankingEvent["status"] }> = ({ status }) => {
  const base: React.CSSProperties = { padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.625rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" };
  if (status === "Completed") return <span style={{ ...base, background: "#f4dddc", color: "#79342e" }}>Completed</span>;
  if (status === "Pending")   return <span style={{ ...base, background: "#ffdf98", color: "#4f3b00" }}>Pending</span>;
  return <span style={{ ...base, background: "rgba(255,218,214,0.6)", color: "#ba1a1a" }}>Failed</span>;
};

const EventRow: React.FC<{ event: BankingEvent }> = ({ event }) => (
  <tr style={{ borderBottom: `1px solid ${S.outlineVariant}1a` }}>
    <td style={{ padding: "1.5rem 2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", background: event.iconBg, color: event.iconColor, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", fontSize: "1.125rem", fontWeight: 700 }}>
          {event.icon}
        </div>
        <span style={{ fontWeight: 700, color: S.onSurface, fontSize: "0.9375rem" }}>{event.label}</span>
      </div>
    </td>
    <td style={{ padding: "1.5rem 2rem", fontSize: "0.875rem", fontWeight: 500, color: "#554240" }}>{event.date}</td>
    <td style={{ padding: "1.5rem 2rem" }}><StatusBadge status={event.status} /></td>
    <td style={{ padding: "1.5rem 2rem", fontSize: "0.8125rem", color: S.onSurfaceVariant, textAlign: "right" }}>{event.details ?? "—"}</td>
  </tr>
);

// ─── Nav Item Component ───────────────────────────────────────────────────────

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  href: string;
}

const NavItem = React.memo<NavItemProps>(({ icon, label, active, collapsed, href }) => {
  const paddingValue = collapsed ? "0.75rem" : "0.75rem 1rem 0.75rem 2rem";
  
  let marginLeftValue: string | number = 0;
  if (active) {
    marginLeftValue = "1rem";
  } else if (collapsed) {
    marginLeftValue = "0.75rem";
  }
  
  let marginRightValue: string | number = 0;
  if (!active && collapsed) {
    marginRightValue = "0.75rem";
  }
  
  return (
    <a
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: paddingValue,
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: active ? "999px 0 0 999px" : "999px",
        marginLeft: marginLeftValue,
        marginRight: marginRightValue,
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
  );
});
NavItem.displayName = "NavItem";

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: "Overview", active: false, href: "/beneficiary/dashboard" },
  { icon: <CreditCard size={20} />, label: "Campaigns", active: false, href: "/beneficiary/campaigns" },
  { icon: <CreditCard size={20} />, label: "Funds", active: false, href: "/beneficiary/fund-management" },
  { icon: <Landmark size={20} />, label: "Banking", active: true, href: "/beneficiary/banking-details" },
  { icon: <IdCard size={20} />, label: "Identity", active: false, href: "/beneficiary/identity-verification" },
  { icon: <User size={20} />, label: "Profile", active: false, href: "/beneficiary/profile-settings" },
  { icon: <ShieldCheck size={20} />, label: "Security", active: false, href: "/beneficiary/security-settings" },
];

const SIDEBAR_W_EXPANDED = 220;
const SIDEBAR_W_COLLAPSED = 80;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BankingDetailsPage() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankingActivity, setBankingActivity] = useState<BankingEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ bank_name: "", account_holder: "", account_number: "" });
  const [saving, setSaving] = useState(false);
  const [activeSince, setActiveSince] = useState<number | null>(null);
  const supabase = createClient();

  const toggleSidebar = useCallback(() => setCollapsed((p) => !p), []);
  const sidebarW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("beneficiary_profiles")
        .select("id, bank_name, account_name, account_number, created_at")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile) return;
      setActiveSince(new Date(profile.created_at).getFullYear());

      const [{ data: additionalAccounts }, { data: activityRows }] = await Promise.all([
        supabase
          .from("beneficiary_bank_accounts")
          .select("id, bank_name, account_holder_name, account_number, is_primary, created_at")
          .eq("beneficiary_profile_id", profile.id)
          .eq("is_active", true)
          .order("created_at"),
        supabase
          .from("beneficiary_banking_activity")
          .select("id, event_type, status, details, event_date")
          .eq("beneficiary_profile_id", profile.id)
          .order("event_date", { ascending: false })
          .limit(20),
      ]);

      // Build accounts list: initial profile account first, then additional
      const accounts: BankAccount[] = [];
      if (profile.account_number) {
        accounts.push({
          id: profile.id,
          bank_name: profile.bank_name || "Bank Account",
          account_holder: profile.account_name || "Account Holder",
          account_number: profile.account_number,
          is_primary: true,
          is_profile_account: true,
          created_at: profile.created_at ?? new Date().toISOString(),
        });
      }
      (additionalAccounts ?? []).forEach((a: any) => {
        accounts.push({
          id: a.id,
          bank_name: a.bank_name,
          account_holder: a.account_holder_name,
          account_number: a.account_number,
          is_primary: a.is_primary,
          is_profile_account: false,
          created_at: a.created_at,
        });
      });
      setBankAccounts(accounts);

      // Build banking activity
      const activity: BankingEvent[] = (activityRows ?? []).map((row: any) => {
        const display = EVENT_DISPLAY[row.event_type] ?? {
          icon: "•", iconBg: S.surfaceContainerHigh, iconColor: S.onSurfaceVariant, label: row.event_type,
        };
        return {
          id: row.id,
          ...display,
          date: new Date(row.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          status: (row.status === "completed" ? "Completed" : row.status === "pending" ? "Pending" : "Failed") as BankingEvent["status"],
          details: row.details,
        };
      });
      setBankingActivity(activity);
    } catch (err) {
      console.error("Error fetching banking data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (account: BankAccount) => {
    if (!confirm("Are you sure you want to remove this bank account?")) return;

    try {
      if (account.is_profile_account) {
        const { error } = await supabase
          .from("beneficiary_profiles")
          .update({ bank_name: null, account_name: null, account_number: null })
          .eq("id", account.id);
        if (error) { alert("Failed to remove bank details"); return; }
      } else {
        const res = await fetch(`/beneficiary/api/bank-accounts/${account.id}`, { method: "PATCH" });
        if (!res.ok) { alert("Failed to remove bank account"); return; }
      }
      fetchAllData();
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to remove bank account");
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return "•••• " + accountNumber.slice(-4);
  };

  const startEdit = (account: BankAccount) => {
    setEditingId(account.id);
    setEditForm({
      bank_name: account.bank_name,
      account_holder: account.account_holder,
      account_number: account.account_number,
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (account: BankAccount) => {
    if (!editForm.bank_name || !editForm.account_holder || !editForm.account_number) {
      alert("Please fill in all fields");
      return;
    }
    setSaving(true);
    try {
      if (account.is_profile_account) {
        const { error } = await supabase
          .from("beneficiary_profiles")
          .update({ bank_name: editForm.bank_name, account_name: editForm.account_holder, account_number: editForm.account_number })
          .eq("id", account.id);
        if (error) { alert("Failed to update bank details"); return; }
      } else {
        const { error } = await supabase
          .from("beneficiary_bank_accounts")
          .update({ bank_name: editForm.bank_name, account_holder_name: editForm.account_holder, account_number: editForm.account_number })
          .eq("id", account.id);
        if (error) { alert("Failed to update bank details"); return; }
      }
      setEditingId(null);
      fetchAllData();
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to update bank details");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

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
            gap: "3rem",
            minHeight: "calc(100vh - 5rem)",
          }}
        >
          {/* Header */}
          <header style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: S.onSurface, letterSpacing: "-0.02em", marginBottom: "0.5rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Banking Details
            </h1>
            <p style={{ color: S.onSurfaceVariant, fontSize: "1.125rem", maxWidth: "40rem", lineHeight: 1.5 }}>
              Manage your verified bank accounts for disbursements. Your security is our highest priority.
            </p>
          </header>

          {/* Layout */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "64rem", margin: "0 auto", width: "100%" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: S.onSurfaceVariant }}>
                <p>Loading bank accounts...</p>
              </div>
            ) : bankAccounts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ color: S.onSurfaceVariant, marginBottom: "1.5rem" }}>No bank accounts connected yet</p>
              </div>
            ) : (
              <>
                {/* Bank Account Cards */}
                {bankAccounts.map((account) => (
                  <div 
                    key={account.id}
                    style={{ 
                      background: S.surfaceContainerLowest, 
                      borderRadius: "0.75rem", 
                      padding: "2rem", 
                      position: "relative", 
                      overflow: "hidden", 
                      boxShadow: "0px 12px 32px rgba(151,69,62,0.06)" 
                    }}
                  >
                    <div style={{ position: "absolute", right: "-1rem", top: "-1rem", width: "6rem", height: "6rem", background: `${S.primary}05`, borderRadius: "999px" }} />
                    <div style={{ position: "absolute", top: "1.5rem", right: "2rem" }}>
                      {account.is_primary && (
                        <span style={{
                          background: "#f4dddc",
                          color: "#79342e",
                          padding: "0.375rem 1rem",
                          borderRadius: "999px",
                          fontSize: "0.625rem",
                          fontWeight: 800,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.375rem",
                        }}>
                          <CheckCircle size={14} fill="#79342e" />
                          Primary
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", position: "relative", zIndex: 10 }}>
                      <div style={{
                        width: "4rem",
                        height: "4rem",
                        borderRadius: "0.75rem",
                        background: "#fae3e1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: S.primary,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        flexShrink: 0,
                      }}>
                        <Landmark size={32} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1 }}>
                        {editingId === account.id ? (
                          /* ── Edit Mode ── */
                          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {[
                              { label: "Bank Name",       key: "bank_name",       placeholder: "e.g. Chase Bank" },
                              { label: "Account Holder",  key: "account_holder",  placeholder: "Full legal name" },
                              { label: "Account Number",  key: "account_number",  placeholder: "Account number" },
                            ].map(({ label, key, placeholder }) => (
                              <div key={key}>
                                <p style={{ fontSize: "0.625rem", fontWeight: 800, color: `${S.onSurfaceVariant}80`, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.375rem" }}>
                                  {label}
                                </p>
                                <input
                                  type="text"
                                  value={editForm[key as keyof typeof editForm]}
                                  onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                                  placeholder={placeholder}
                                  style={{
                                    width: "100%",
                                    height: "2.75rem",
                                    padding: "0 0.875rem",
                                    borderRadius: "0.625rem",
                                    border: `1px solid ${S.outlineVariant}4d`,
                                    background: S.surfaceContainerLow,
                                    color: S.onSurface,
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    outline: "none",
                                    fontFamily: "Plus Jakarta Sans, sans-serif",
                                    transition: "border-color 0.15s",
                                    boxSizing: "border-box",
                                  }}
                                  onFocus={(e) => { e.currentTarget.style.borderColor = S.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${S.primaryContainer}33`; }}
                                  onBlur={(e) => { e.currentTarget.style.borderColor = `${S.outlineVariant}4d`; e.currentTarget.style.boxShadow = "none"; }}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* ── View Mode ── */
                          <>
                            <div>
                              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: S.onSurface, letterSpacing: "-0.01em", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                                {account.bank_name}
                              </h3>
                              <p style={{ color: S.onSurfaceVariant, fontSize: "0.875rem", fontWeight: 500 }}>
                                {account.is_primary ? "Primary Disbursement Account" : "Disbursement Account"}
                              </p>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2rem" }}>
                              <div>
                                <p style={{ fontSize: "0.625rem", fontWeight: 800, color: `${S.onSurfaceVariant}80`, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>
                                  Account Holder
                                </p>
                                <p style={{ fontWeight: 700, color: S.onSurface }}>{account.account_holder}</p>
                              </div>
                              <div>
                                <p style={{ fontSize: "0.625rem", fontWeight: 800, color: `${S.onSurfaceVariant}80`, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>
                                  Account Number
                                </p>
                                <p style={{ fontWeight: 700, color: S.onSurface }}>{maskAccountNumber(account.account_number)}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "1.5rem", borderTop: `1px solid ${S.outlineVariant}1a`, paddingTop: "1.5rem" }}>
                      {editingId === account.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEdit(account)}
                            disabled={saving}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              color: saving ? S.onSurfaceVariant : S.onPrimaryContainer,
                              fontWeight: 700,
                              fontSize: "0.8125rem",
                              background: saving ? S.surfaceContainerLow : S.primaryContainer,
                              border: "none",
                              cursor: saving ? "not-allowed" : "pointer",
                              padding: "0.5rem 1.25rem",
                              borderRadius: "999px",
                              fontFamily: "Plus Jakarta Sans, sans-serif",
                              transition: "opacity 0.15s",
                              opacity: saving ? 0.6 : 1,
                            }}
                          >
                            {saving ? "Saving…" : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={saving}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              color: S.onSurfaceVariant,
                              fontWeight: 700,
                              fontSize: "0.8125rem",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "Plus Jakarta Sans, sans-serif",
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(account)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              color: S.primary,
                              fontWeight: 700,
                              fontSize: "0.8125rem",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "Plus Jakarta Sans, sans-serif",
                              transition: "transform 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(4px)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
                          >
                            <Edit size={18} />
                            <span>Edit Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAccount(account)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              color: S.error,
                              fontWeight: 700,
                              fontSize: "0.8125rem",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              marginLeft: "auto",
                              fontFamily: "Plus Jakarta Sans, sans-serif",
                              transition: "opacity 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                          >
                            <Trash2 size={18} />
                            <span>Remove</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Add New Bank CTA */}
            <a 
              href="/beneficiary/connect-bank" 
              style={{
                width: "100%",
                border: `2px dashed ${S.outlineVariant}4d`,
                borderRadius: "0.75rem",
                padding: "2.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                textDecoration: "none",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fff0ef")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "999px",
                background: `${S.primary}15`,
                color: S.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                transition: "transform 0.15s",
              }}>
                <Plus size={28} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 800, color: S.onSurface, fontSize: "1.125rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  Add New Bank Account
                </p>
                <p style={{ fontSize: "0.875rem", color: S.onSurfaceVariant, fontWeight: 500 }}>
                  Connect another secure source for your fund transfers
                </p>
              </div>
            </a>
          </div>

          {/* Banking Activity */}
          <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 0.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.01em", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  Banking Activity
                </h3>
                <p style={{ fontSize: "0.875rem", color: S.onSurfaceVariant, fontWeight: 500 }}>
                  History of account links and verifications
                </p>
              </div>
              <button 
                type="button"
                style={{ 
                  color: S.primary, 
                  fontSize: "0.8125rem", 
                  fontWeight: 800, 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.25rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  transition: "opacity 0.15s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Download Report
                {" "}
                <span style={{ fontSize: "0.875rem" }}>↓</span>
              </button>
            </div>
            <div style={{ background: S.surfaceContainerLowest, borderRadius: "0.75rem", boxShadow: "0px 12px 32px rgba(151,69,62,0.06)", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: S.surfaceContainerLow }}>
                      {["Event", "Date", "Status", "Details"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "1.25rem 2rem",
                            fontSize: "0.625rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: S.onSurfaceVariant,
                            textAlign: h === "Details" ? "right" : "left",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bankingActivity.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: S.onSurfaceVariant, fontSize: "0.875rem" }}>No banking activity yet</td></tr>
                    ) : bankingActivity.map((event) => (
                      <EventRow key={event.id} event={event} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

