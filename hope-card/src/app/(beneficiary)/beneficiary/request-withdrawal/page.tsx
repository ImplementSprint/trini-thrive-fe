"use client";
import { BeneficiaryNotificationBell } from "@/app/(beneficiary)/beneficiary/shared/BeneficiaryNotificationBell";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/beneficiary-utils/supabase/client";
import {
  Menu, LayoutDashboard, CreditCard,
  Landmark, IdCard, User, ShieldCheck, HelpCircle, ChevronDown, Clock, Info,
  LogOut,
} from "lucide-react";
import { S, LOGO_SRC, LOGO_WIDTH, LOGO_HEIGHT, BeneficiaryStyle } from "@/app/(beneficiary)/beneficiary/shared/beneficiary-shared";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BankOption {
  value: string;
  label: string;
}

interface WithdrawalFormState {
  amount: string;
  bank: string;
  notes: string;
}

const GUIDELINES = [
  {
    icon: <Clock size={20} />,
    title: "Processing Time",
    desc: "Requests before 2 PM EST are reviewed same-day. Funds arrive in 1-3 business days.",
  },
  {
    icon: <Info size={20} />,
    title: "Limit Thresholds",
    desc: "Daily limit of $5,000 for standard accounts. Contact support for higher volume transfers.",
  },
];

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
];

const SIDEBAR_W_EXPANDED = 220;
const SIDEBAR_W_COLLAPSED = 80;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RequestWithdrawal() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [bankOptions, setBankOptions] = useState<BankOption[]>([]);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeSince, setActiveSince] = useState<number | null>(null);
  const [form, setForm] = useState<WithdrawalFormState>({ amount: "", bank: "", notes: "" });
  const supabase = createClient();

  const toggleSidebar = useCallback(() => setCollapsed((p) => !p), []);
  const sidebarW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("beneficiary_profiles")
        .select("id, bank_name, account_number, account_name, created_at")
        .eq("auth_user_id", user.id)
        .single();

      const { data: beneficiary } = await supabase
        .from("beneficiaries")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile || !beneficiary) return;
      setActiveSince(new Date((profile as any).created_at).getFullYear());

      // Fetch approved bank accounts via proxy (bypasses RLS)
      const opts: BankOption[] = [];
      try {
        const bankRes = await fetch("/beneficiary/api/bank-accounts");
        if (bankRes.ok) {
          const bankData = await bankRes.json();
          (bankData.accounts ?? []).forEach((a: any) => {
            opts.push({
              value: a.id,
              label: `${a.bank_name} •••• ${String(a.account_number).slice(-4)}${a.is_primary ? " (Primary)" : ""}`,
            });
          });
        }
      } catch { /* ignore */ }
      setBankOptions(opts);
      if (opts.length > 0) setForm((f) => ({ ...f, bank: opts[0].value }));

      // Compute available balance
      const [{ data: txRows }, { data: wdRows }] = await Promise.all([
        supabase.from("beneficiary_transactions").select("amount").eq("beneficiary_id", beneficiary.id).eq("status", "approved"),
        supabase.from("beneficiary_withdrawals").select("amount").eq("beneficiary_id", beneficiary.id).eq("status", "approved"),
      ]);
      const totalRx = (txRows ?? []).reduce((s: number, r: any) => s + Number(r.amount), 0);
      const totalWd = (wdRows ?? []).reduce((s: number, r: any) => s + Number(r.amount), 0);
      setAvailableBalance(Math.max(0, totalRx - totalWd));
    }
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const amount = parseFloat(form.amount);
    if (!amount || amount < 100) { setSubmitError("Minimum withdrawal is ₱100"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/beneficiary/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          bank_account_id: form.bank !== "profile" ? form.bank : null,
          notes: form.notes || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) { setSubmitError(json.error || "Request failed"); return; }

      window.location.href = "/beneficiary/fund-management";
    } catch (err) {
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
          <BeneficiaryNotificationBell />

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
              onClick={async () => {
                const { createClient } = await import("@/beneficiary-utils/supabase/client");
                await createClient().auth.signOut();
                document.cookie = "persona=; path=/; SameSite=Strict; Max-Age=0";
                window.location.href = "/beneficiary/login";
              }}
            >
              <LogOut size={18} />
              {!collapsed && "Log Out"}
            </button>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main
          className="main-transition"
          style={{
            flex: 1,
            marginLeft: `${sidebarW}px`,
            padding: "3rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            minHeight: "calc(100vh - 5rem)",
          }}
        >
          <div style={{ maxWidth: "64rem", margin: "0 auto", width: "100%" }}>
            {/* Header */}
            <header style={{ marginBottom: "3rem" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: S.primary, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "0.5rem" }}>
                Banking &amp; Withdrawals
              </span>
              <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: S.onSurface, letterSpacing: "-0.02em", marginBottom: "0.75rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                Request Withdrawal
              </h1>
              <p style={{ color: S.onSurfaceVariant, fontSize: "1.125rem", maxWidth: "40rem", lineHeight: 1.5 }}>
                Securely transfer your accumulated benefits to your verified bank account. Most requests are processed within 24-48 business hours.
              </p>
            </header>

            {/* Form Card */}
            <div style={{ background: S.surfaceContainerLowest, borderRadius: "0.75rem", padding: "2.5rem", boxShadow: "0px 12px 32px rgba(151,69,62,0.06)", marginBottom: "2rem" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {/* Amount */}
                <div>
                  <label
                    htmlFor="amount"
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      color: S.onSurfaceVariant,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      display: "block",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Amount to Withdraw
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", fontSize: "1.5rem", fontWeight: 700, color: "#877270" }}>
                      ₱
                    </span>
                    <input
                      id="amount"
                      type="number"
                      value={form.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        background: S.surfaceContainerLow,
                        borderRadius: "0.75rem",
                        padding: "1.25rem 1.5rem 1.25rem 3rem",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: S.onSurface,
                        border: `1px solid ${S.outlineVariant}26`,
                        outline: "none",
                        transition: "all 0.15s",
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = S.primary;
                        e.currentTarget.style.boxShadow = `0 0 0 4px ${S.primaryContainer}33`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = `${S.outlineVariant}26`;
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                    <span style={{ color: S.onSurfaceVariant }}>
                      Min: ₱100.00 &nbsp;·&nbsp; Available:{" "}
                      {availableBalance === null ? "…" : `₱${availableBalance.toLocaleString("en-PH")}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => availableBalance !== null && setForm((f) => ({ ...f, amount: String(availableBalance) }))}
                      style={{ color: S.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "Plus Jakarta Sans, sans-serif" }}
                    >
                      Withdraw Max Funds
                    </button>
                  </div>
                </div>

                {/* Bank Select */}
                <div>
                  <label
                    htmlFor="bank"
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      color: S.onSurfaceVariant,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      display: "block",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Select Bank Account
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      id="bank"
                      value={form.bank}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        background: S.surfaceContainerLow,
                        borderRadius: "0.75rem",
                        padding: "1rem 3rem 1rem 1.5rem",
                        color: S.onSurface,
                        fontWeight: 600,
                        border: `1px solid ${S.outlineVariant}26`,
                        outline: "none",
                        appearance: "none",
                        transition: "all 0.15s",
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        cursor: "pointer",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = S.primary;
                        e.currentTarget.style.boxShadow = `0 0 0 4px ${S.primaryContainer}33`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = `${S.outlineVariant}26`;
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {bankOptions.length === 0 && (
                        <option value="" disabled>No bank accounts found</option>
                      )}
                      {bankOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={20}
                      style={{
                        position: "absolute",
                        right: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        color: S.onSurfaceVariant,
                      }}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="notes"
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      color: S.onSurfaceVariant,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      display: "block",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Briefly describe the purpose of this withdrawal..."
                    style={{
                      width: "100%",
                      background: S.surfaceContainerLow,
                      borderRadius: "0.75rem",
                      padding: "1.5rem",
                      color: S.onSurface,
                      fontWeight: 500,
                      border: `1px solid ${S.outlineVariant}26`,
                      outline: "none",
                      transition: "all 0.15s",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      resize: "vertical",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = S.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 4px ${S.primaryContainer}33`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = `${S.outlineVariant}26`;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                {/* Error message */}
                {submitError && (
                  <div style={{ padding: "0.875rem 1rem", background: `${S.errorContainer}33`, border: `1px solid ${S.error}33`, borderRadius: "0.75rem", color: S.error, fontWeight: 600, fontSize: "0.875rem" }}>
                    {submitError}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: "1rem", paddingTop: "1rem" }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      flex: 1,
                      background: "#F28D83",
                      color: "#6e2621",
                      fontWeight: 700,
                      padding: "1.25rem",
                      borderRadius: "999px",
                      fontSize: "1.125rem",
                      border: "none",
                      cursor: submitting ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 16px rgba(242,141,131,0.3)",
                      transition: "transform 0.15s, opacity 0.15s",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      opacity: submitting ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.transform = "scale(1.01)"; }}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {submitting ? "Submitting…" : "Submit Request"}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    style={{
                      width: "33%",
                      background: "transparent",
                      color: S.primary,
                      fontWeight: 700,
                      padding: "1.25rem",
                      borderRadius: "999px",
                      fontSize: "1.125rem",
                      border: `2px solid ${S.primary}33`,
                      cursor: "pointer",
                      transition: "background 0.15s",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = `${S.primaryContainer}33`)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Guidelines Card */}
            <div style={{ background: `${S.surfaceContainerLow}80`, borderRadius: "0.75rem", padding: "2rem", border: `1px solid ${S.outlineVariant}1a` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <ShieldCheck size={20} style={{ color: S.primary }} />
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: S.onSurface, margin: 0 }}>
                  Withdrawal Guidelines
                </h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "1.5rem" }}>
                {GUIDELINES.map((g) => (
                  <div key={g.title} style={{ display: "flex", gap: "1rem" }}>
                    <div
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        flexShrink: 0,
                        background: S.surfaceContainerLowest,
                        borderRadius: "999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: S.primary,
                      }}
                    >
                      {g.icon}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "0.875rem", color: S.onSurface, margin: "0 0 0.25rem" }}>
                        {g.title}
                      </p>
                      <p style={{ fontSize: "0.875rem", color: S.onSurfaceVariant, lineHeight: 1.5, margin: 0 }}>
                        {g.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
