"use client";
import { BeneficiaryNotificationBell } from "@/app/(beneficiary)/beneficiary/shared/BeneficiaryNotificationBell";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Menu, LayoutDashboard, CreditCard,
  Landmark, IdCard, User, ShieldCheck, HelpCircle,
  LogOut,
} from "lucide-react";
import { S, LOGO_SRC, LOGO_WIDTH, LOGO_HEIGHT, BeneficiaryStyle } from "@/app/(beneficiary)/beneficiary/shared/beneficiary-shared";
import { createClient } from "@/beneficiary-utils/supabase/client";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Invitation {
  id: string;
  campaign_id: string;
  title: string;
  category: string | null;
  description: string | null;
  organization_name: string | null;
  target_amount: number;
  invited_at: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORY_ICON: Record<string, string> = {
  Education: "school",
  Health: "medical_services",
  Environment: "eco",
  Community: "volunteer_activism",
  Food: "restaurant",
  Energy: "electric_bolt",
  Housing: "home",
  Youth: "child_care",
  Disaster: "emergency",
};

function categoryToIcon(category: string | null): string {
  return (category && CATEGORY_ICON[category]) || "campaign";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="px-4 py-1.5 rounded-full bg-[#f4dddc] text-[#79342e] text-[10px] font-extrabold uppercase tracking-widest">
      {label}
    </span>
  );
}

interface InvitationCardProps {
  invitation: Invitation;
  onAccept: (id: string, title: string) => void;
  onDecline: (id: string) => void;
}

function FeaturedCard({ invitation, onAccept, onDecline }: InvitationCardProps) {
  return (
    <div className="lg:col-span-8 bg-white rounded-[2rem] p-8 shadow-[0px_12px_32px_rgba(151,69,62,0.06)] border border-[#dac1be]/10 flex flex-col md:flex-row gap-8 relative overflow-hidden group">
      <div className="flex-shrink-0 w-24 h-24 rounded-[1.5rem] bg-[#fae3e1] flex items-center justify-center text-[#97453e] shadow-sm">
        <span className="material-symbols-outlined text-[3rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {categoryToIcon(invitation.category)}
        </span>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <CategoryBadge label={invitation.category ?? "Campaign"} />
          <span className="text-[#97453e] font-bold text-lg">
            ₱{(invitation.target_amount ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })} Goal
          </span>
        </div>
        <h3 className="text-2xl font-extrabold text-[#241918] mb-1">{invitation.title}</h3>
        <p className="text-[#f28d83] font-bold text-xs mb-4 uppercase tracking-wide">
          {invitation.organization_name ?? ""}
        </p>
        {invitation.description && (
          <p className="text-[#554240] leading-relaxed mb-8 font-medium">{invitation.description}</p>
        )}
        <div className="mt-auto flex items-center gap-4">
          <button
            onClick={() => onAccept(invitation.id, invitation.title)}
            className="bg-[#f28d83] text-[#6e2621] px-8 py-3 rounded-[1rem] font-bold text-sm hover:opacity-90 transition-all active:scale-95"
          >
            Accept Invitation
          </button>
          <button
            onClick={() => onDecline(invitation.id)}
            className="px-6 py-3 text-[#97453e] font-bold text-sm hover:bg-[#97453e]/5 rounded-[1rem] transition-all"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

function StandardCard({ invitation, onAccept, onDecline }: InvitationCardProps) {
  return (
    <div className="lg:col-span-4 bg-white rounded-[2rem] p-8 shadow-[0px_12px_32px_rgba(151,69,62,0.06)] border border-[#dac1be]/10 flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 bg-[#fae3e1] rounded-[1.25rem] flex items-center justify-center text-[#97453e] shadow-sm">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {categoryToIcon(invitation.category)}
          </span>
        </div>
        <CategoryBadge label={invitation.category ?? "Campaign"} />
      </div>
      <h3 className="text-xl font-bold text-[#241918] mb-1">{invitation.title}</h3>
      <p className="text-[#f28d83] font-bold text-xs mb-4 uppercase tracking-wide">
        {invitation.organization_name ?? ""}
      </p>
      {invitation.description && (
        <p className="text-[#554240] text-sm font-medium leading-relaxed mb-6">{invitation.description}</p>
      )}
      <div className="mt-auto space-y-4">
        <div className="flex justify-between text-sm font-medium pt-4 border-t border-[#dac1be]/10">
          <span className="text-[#554240]/70">Campaign Goal</span>
          <span className="font-extrabold text-[#241918]">
            ₱{invitation.target_amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <button
          onClick={() => onAccept(invitation.id, invitation.title)}
          className="w-full py-3 bg-[#f28d83] text-[#6e2621] rounded-[1rem] font-bold text-sm hover:opacity-90 transition-all"
        >
          Accept Invitation
        </button>
        <button
          onClick={() => onDecline(invitation.id)}
          className="w-full py-2 text-[#97453e] font-bold text-xs hover:opacity-80 transition-all"
        >
          Decline
        </button>
      </div>
    </div>
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
];

const SIDEBAR_W_EXPANDED = 220;
const SIDEBAR_W_COLLAPSED = 80;

// ─── Main Component ───────────────────────────────────────────────────────────

const CampaignInvitationsPage: React.FC = () => {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
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

        const res = await fetch("/beneficiary/api/campaigns/invitations");
        if (res.ok) {
          const data = await res.json();
          setInvitations(Array.isArray(data.invitations) ? data.invitations : []);
        }
      } catch (error) {
        console.error("Error fetching invitations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAccept = async (invitationId: string, campaignTitle: string) => {
    const res = await fetch(`/beneficiary/api/campaigns/invitations/${invitationId}/accept`, { method: "POST" });
    if (res.ok) {
      router.push(`/campaigns/invitation-accepted?campaign=${encodeURIComponent(campaignTitle)}`);
    } else {
      alert("Unable to accept invitation. Please try again.");
    }
  };

  const handleDecline = async (invitationId: string) => {
    const res = await fetch(`/beneficiary/api/campaigns/invitations/${invitationId}/decline`, { method: "POST" });
    if (res.ok) {
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } else {
      alert("Unable to decline invitation. Please try again.");
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
            padding: "2rem 3rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            minHeight: "calc(100vh - 5rem)",
          }}
        >
          {/* Header */}
          <header className="space-y-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-[#241918] tracking-tight">
                Campaign Invitations
              </h1>
              <p className="text-lg text-[#554240] max-w-2xl leading-relaxed mt-2">
                You have been nominated for the following support initiatives. Review and accept invitations to begin receiving benefits.
              </p>
            </div>
          </header>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-[#554240] font-medium">Loading invitations…</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <span className="material-symbols-outlined text-[4rem] text-[#dac1be]">mail</span>
              <p className="text-[#554240] font-bold text-lg">No pending invitations</p>
              <p className="text-[#554240]/70 text-sm">Check back later — campaign managers will notify you when you&apos;ve been invited.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {invitations[0] && (
                <FeaturedCard invitation={invitations[0]} onAccept={handleAccept} onDecline={handleDecline} />
              )}
              {invitations.slice(1).map((inv) => (
                <StandardCard key={inv.id} invitation={inv} onAccept={handleAccept} onDecline={handleDecline} />
              ))}
            </div>
          )}

          <footer className="pt-8 pb-12 text-center text-[#554240]/50 text-[10px] font-bold uppercase tracking-widest">
            © 2026 HOPECARD Beneficiary Portal. Built for community impact.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default CampaignInvitationsPage;
