﻿﻿﻿"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Menu, Bell, LayoutDashboard, CreditCard,
  Landmark, IdCard, User, ShieldCheck,
  HelpCircle, MoreVertical, ZoomIn, UploadCloud, ArrowRight, Shield, HelpCircleIcon,
} from "lucide-react";
import { S, LOGO_SRC, LOGO_WIDTH, LOGO_HEIGHT, BeneficiaryStyle } from "@/app/(beneficiary)/beneficiary/shared/beneficiary-shared";
import { createClient } from "@/beneficiary-utils/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type VerificationStatus = "Approved" | "Pending" | "Rejected";

interface VerificationEntry {
  date: string;
  docType: string;
  docIcon: React.ReactNode;
  status: VerificationStatus;
}

interface ProfileDoc {
  id?: string;
  url: string | null;
  ext: string;
  status: VerificationStatus;
  uploadedAt: string;
  label: string;
  isSignupDoc?: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: VerificationStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<VerificationStatus, { bg: string; color: string }> = {
    Approved: { bg: S.surfaceContainerHighest, color: S.onSecondaryContainer },
    Pending: { bg: S.tertiaryFixed, color: S.onTertiaryContainer },
    Rejected: { bg: `${S.errorContainer}66`, color: S.onErrorContainer },
  };
  const style = styles[status];
  return (
    <span
      style={{
        padding: "0.25rem 0.75rem",
        background: style.bg,
        color: style.color,
        borderRadius: "999px",
        fontSize: "0.625rem",
        fontWeight: 700,
        textTransform: "uppercase",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      {status}
    </span>
  );
};

interface VerificationRowProps {
  entry: VerificationEntry;
}

const VerificationRow: React.FC<VerificationRowProps> = ({ entry }) => (
  <tr
    style={{
      borderBottom: `1px solid ${S.outlineVariant}1a`,
      transition: "background 0.15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = `${S.surfaceContainerLow}80`)}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
  >
    <td style={{ padding: "1.25rem 2rem", fontSize: "0.875rem", fontWeight: 500 }}>{entry.date}</td>
    <td style={{ padding: "1.25rem 2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ color: S.primary, display: "flex" }}>{entry.docIcon}</span>
        <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{entry.docType}</span>
      </div>
    </td>
    <td style={{ padding: "1.25rem 2rem" }}>
      <StatusBadge status={entry.status} />
    </td>
    <td style={{ padding: "1.25rem 2rem", textAlign: "right" }}>
      <button
        style={{
          color: S.onSurfaceVariant,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.5rem",
          borderRadius: "999px",
          display: "inline-flex",
          transition: "color 0.15s, background 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = S.primary;
          e.currentTarget.style.background = `${S.primary}0d`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = S.onSurfaceVariant;
          e.currentTarget.style.background = "transparent";
        }}
      >
        <MoreVertical size={20} />
      </button>
    </td>
  </tr>
);

// ─── Nav Item ──────────────────────────────────────────────────────────────────

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
  href: string;
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
      marginLeft: active ? "1rem" : collapsed ? "0.75rem" : 0,
      marginRight: active ? 0 : collapsed ? "0.75rem" : 0,
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
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.color = S.primary;
        e.currentTarget.style.transform = "translateX(4px)";
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.color = "#78716c";
        e.currentTarget.style.transform = "translateX(0)";
      }
    }}
  >
    {icon}
    {!collapsed && <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>{label}</span>}
  </a>
));
NavItem.displayName = "NavItem";

// ─── Nav Data ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: "Overview", active: false, href: "/beneficiary/dashboard" },
  { icon: <CreditCard size={20} />, label: "Campaigns", active: false, href: "/beneficiary/campaigns" },
  { icon: <CreditCard size={20} />, label: "Funds", active: false, href: "/beneficiary/fund-management" },
  { icon: <Landmark size={20} />, label: "Banking", active: false, href: "/beneficiary/banking-details" },
  { icon: <IdCard size={20} />, label: "Identity", active: true, href: "/beneficiary/identity-verification" },
  { icon: <User size={20} />, label: "Profile", active: false, href: "/beneficiary/profile-settings" },
  { icon: <ShieldCheck size={20} />, label: "Security", active: false, href: "/beneficiary/security-settings" },
];

const SIDEBAR_W_EXPANDED = 220;
const SIDEBAR_W_COLLAPSED = 80;

// ─── Main Component ───────────────────────────────────────────────────────────

const IdentityVerification: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<VerificationEntry[]>([]);
  const [allDocuments, setAllDocuments] = useState<ProfileDoc[]>([]);
  const [activeSince, setActiveSince] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const sidebarW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  useEffect(() => {
    async function fetchDocuments() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("beneficiary_profiles")
        .select("id, id_verification_key, status, created_at")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile) return;
      setActiveSince(new Date(profile.created_at).getFullYear());

      const documents: ProfileDoc[] = [];

      // Fetch additional docs and signup doc URL in parallel
      const [{ data: docs }, signedUrlRes] = await Promise.all([
        supabase
          .from("beneficiary_identity_documents")
          .select("id, document_label, document_key, status, submitted_at")
          .eq("beneficiary_profile_id", profile.id)
          .order("submitted_at", { ascending: false }),
        profile.id_verification_key
          ? fetch(`/beneficiary/api/identity-documents/signed-url?key=${encodeURIComponent(profile.id_verification_key)}`)
          : Promise.resolve(null),
      ]);

      // Add signup document as first card
      if (profile.id_verification_key) {
        const ext = profile.id_verification_key.split(".").pop()?.toLowerCase() ?? "";
        const profileStatus: VerificationStatus =
          profile.status === "active" ? "Approved" : profile.status === "rejected" ? "Rejected" : "Pending";
        let signedUrl: string | null = null;
        if (signedUrlRes && signedUrlRes.ok) {
          const json = await signedUrlRes.json();
          signedUrl = json.url ?? null;
        }
        documents.push({
          url: signedUrl,
          ext,
          status: profileStatus,
          uploadedAt: new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          label: "Government-Issued ID",
          isSignupDoc: true,
        });
      }

      // Add additional uploaded documents as cards
      if (docs && docs.length > 0) {
        const additionalDocs = await Promise.all(
          docs.map(async (d: any) => {
            const ext = d.document_key?.split(".").pop()?.toLowerCase() ?? "";
            const docStatus: VerificationStatus =
              d.status === "approved" ? "Approved" : d.status === "rejected" ? "Rejected" : "Pending";
            
            let signedUrl: string | null = null;
            if (d.document_key) {
              const res = await fetch(`/beneficiary/api/identity-documents/signed-url?key=${encodeURIComponent(d.document_key)}`);
              if (res.ok) {
                const json = await res.json();
                signedUrl = json.url ?? null;
              }
            }

            return {
              id: d.id,
              url: signedUrl,
              ext,
              status: docStatus,
              uploadedAt: new Date(d.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
              label: d.document_label || "Identity Document",
              isSignupDoc: false,
            };
          })
        );
        documents.push(...additionalDocs);
      }

      setAllDocuments(documents);

      // Build history for the table (keep existing functionality)
      const entries: VerificationEntry[] = (docs ?? []).map((d: any) => ({
        date: new Date(d.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        docType: d.document_label || "Identity Document",
        docIcon: <IdCard size={20} />,
        status: (d.status.charAt(0).toUpperCase() + d.status.slice(1)) as VerificationStatus,
      }));
      setHistory(entries);
    }
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/beneficiary/api/identity-documents", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "Upload failed");
        return;
      }

      // Fetch the signed URL for the newly uploaded document
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      let signedUrl: string | null = null;
      
      if (json.documentKey) {
        const urlRes = await fetch(`/beneficiary/api/identity-documents/signed-url?key=${encodeURIComponent(json.documentKey)}`);
        if (urlRes.ok) {
          const urlJson = await urlRes.json();
          signedUrl = urlJson.url ?? null;
        }
      }

      // Add new document to the cards display with preview
      const newDoc: ProfileDoc = {
        id: json.documentId,
        url: signedUrl,
        ext,
        status: "Pending",
        uploadedAt: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        label: json.documentLabel || file.name,
        isSignupDoc: false,
      };
      setAllDocuments((prev) => [...prev, newDoc]);

      // Also add to history table
      const newEntry: VerificationEntry = {
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        docType: json.documentLabel || file.name,
        docIcon: <IdCard size={20} />,
        status: "Pending",
      };
      setHistory((prev) => [newEntry, ...prev]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ background: S.surface, color: S.onSurface, minHeight: "100vh", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      <BeneficiaryStyle />
      <style>{`
        .nav-transition { transition: width 0.3s cubic-bezier(0.4,0,0.2,1); }
        .main-transition { transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      {/* TopNav */}
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
            onClick={() => setCollapsed((p) => !p)}
            style={{
              padding: "0.5rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#78716c",
              borderRadius: "999px",
              display: "flex",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = S.surfaceContainerHigh)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Menu size={22} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Image src={LOGO_SRC} alt="HOPECARD Logo" width={LOGO_WIDTH} height={LOGO_HEIGHT} />
            <span style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.03em", color: S.primary }}>
              HOPECARD
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <button
            style={{
              padding: "0.5rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#78716c",
              borderRadius: "999px",
              display: "flex",
              position: "relative",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = S.surfaceContainerHigh)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Bell size={22} />
            <span
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                width: "0.5rem",
                height: "0.5rem",
                background: S.error,
                borderRadius: "999px",
              }}
            />
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
        {/* Sidebar */}
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
              <p
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: S.onSurfaceVariant,
                  marginBottom: "0.5rem",
                }}
              >
                Member Portal
              </p>
              <div style={{ padding: "1rem", background: S.surfaceContainerLowest, borderRadius: "0.5rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: S.primary, margin: "0 0 0.125rem" }}>
                  Verified Member
                </p>
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
          {/* Header */}
          <header style={{ marginBottom: "2.5rem" }}>
            <h1
              style={{
                fontSize: "2.25rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: S.onSurface,
                margin: "0 0 0.5rem",
              }}
            >
              Identity Verification
            </h1>
            <p style={{ color: S.onSurfaceVariant, maxWidth: "48rem", lineHeight: 1.6, margin: 0 }}>
              Manage your identification documents and verification status. Securely upload and track the progress of your identity proofs.
            </p>
          </header>

          {/* Document Management */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Upload Button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Your Documents</h2>
                <p style={{ color: S.onSurfaceVariant, fontSize: "0.875rem", margin: 0 }}>
                  {allDocuments.length} document{allDocuments.length !== 1 ? "s" : ""} uploaded
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                style={{ display: "none" }}
                onChange={handleUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: "0.875rem 2.5rem",
                  background: S.primary,
                  color: S.onPrimary,
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  border: "none",
                  cursor: uploading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: `0 4px 16px ${S.primary}33`,
                  transition: "transform 0.15s",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  opacity: uploading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <UploadCloud size={18} />
                {uploading ? "Uploading…" : "Upload New Document"}
              </button>
            </div>

            {/* Document Cards - Stacked Vertically */}
            {allDocuments.length === 0 ? (
              <div
                style={{
                  background: S.surfaceContainerLowest,
                  borderRadius: "0.75rem",
                  padding: "4rem 2rem",
                  textAlign: "center",
                  border: `2px dashed ${S.outlineVariant}4d`,
                }}
              >
                <IdCard size={48} style={{ color: S.onSurfaceVariant, margin: "0 auto 1rem" }} />
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0 0 0.5rem" }}>No Documents Yet</h3>
                <p style={{ color: S.onSurfaceVariant, fontSize: "0.875rem", margin: 0 }}>
                  Upload your first identity document to get started
                </p>
              </div>
            ) : (
              allDocuments.map((doc, index) => (
                <div
                  key={doc.id || `${doc.label}-${doc.uploadedAt}-${index}`}
                  style={{
                    background: S.surfaceContainerLowest,
                    borderRadius: "0.75rem",
                    padding: "2rem",
                    boxShadow: "0px 12px 32px rgba(151,69,62,0.06)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                      {/* Document preview */}
                      <div
                        style={{
                          width: "16rem",
                          height: "11rem",
                          background: S.surfaceContainerHigh,
                          borderRadius: "0.75rem",
                          overflow: "hidden",
                          position: "relative",
                          border: `1px solid ${S.outlineVariant}26`,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {doc.url && doc.ext !== "pdf" ? (
                          <>
                            <img
                              alt={`${doc.label} preview`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              src={doc.url}
                            />
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: `${S.primary}33`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0,
                                transition: "opacity 0.15s",
                                backdropFilter: "blur(2px)",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                            >
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: S.surfaceContainerLowest,
                                  padding: "0.75rem",
                                  borderRadius: "999px",
                                  color: S.primary,
                                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                                  display: "flex",
                                  transition: "transform 0.15s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                              >
                                <ZoomIn size={20} />
                              </a>
                            </div>
                          </>
                        ) : doc.url && doc.ext === "pdf" ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", color: S.primary, textDecoration: "none" }}
                          >
                            <ShieldCheck size={40} />
                            <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>View PDF</span>
                          </a>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", color: S.onSurfaceVariant }}>
                            <IdCard size={40} />
                            <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                              Preview unavailable
                            </span>
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div>
                          {doc.isSignupDoc && (
                            <span
                              style={{
                                fontSize: "0.625rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.15em",
                                color: S.primary,
                                display: "block",
                                marginBottom: "0.25rem",
                              }}
                            >
                              Signup Document
                            </span>
                          )}
                          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0.25rem 0" }}>
                            {doc.label}
                          </h3>
                          <p style={{ color: S.onSurfaceVariant, fontSize: "0.875rem", margin: "0.25rem 0" }}>
                            Submitted for identity verification • {doc.ext.toUpperCase()}
                          </p>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))", gap: "1rem" }}>
                          <div style={{ background: S.surface, padding: "1rem", borderRadius: "0.75rem", border: `1px solid ${S.outlineVariant}1a` }}>
                            <p style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: S.onSurfaceVariant, margin: "0 0 0.25rem" }}>
                              Uploaded On
                            </p>
                            <p style={{ fontSize: "0.875rem", fontWeight: 600, margin: 0 }}>
                              {doc.uploadedAt}
                            </p>
                          </div>
                          <div style={{ background: S.surface, padding: "1rem", borderRadius: "0.75rem", border: `1px solid ${S.outlineVariant}1a` }}>
                            <p style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: S.onSurfaceVariant, margin: "0 0 0.25rem" }}>
                              Verification Status
                            </p>
                            <div style={{ marginTop: "0.25rem" }}>
                              <StatusBadge status={doc.status} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}


            {/* Verification History */}
            <div
              style={{
                background: S.surfaceContainerLowest,
                borderRadius: "0.75rem",
                boxShadow: "0px 12px 32px rgba(151,69,62,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "1.5rem",
                  borderBottom: `1px solid ${S.outlineVariant}1a`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Verification History</h3>
                <button
                  style={{
                    color: S.primary,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    transition: "opacity 0.15s",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Download Report
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: S.surfaceContainerLow }}>
                      {["Date", "Document Type", "Status", "Action"].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "1rem 2rem",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                            color: S.onSurfaceVariant,
                            textAlign: i === 3 ? "right" : "left",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: S.onSurfaceVariant, fontSize: "0.875rem" }}>
                          No additional documents uploaded yet
                        </td>
                      </tr>
                    ) : history.map((entry, i) => (
                      <VerificationRow key={`${entry.date}-${entry.docType}-${i}`} entry={entry} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Help */}
          <section style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "2rem", paddingBottom: "3rem" }}>
            <div
              style={{
                background: `${S.surfaceContainerHighest}4d`,
                borderRadius: "0.75rem",
                padding: "2rem",
                border: `1px solid ${S.outlineVariant}1a`,
              }}
            >
              <h4 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Shield size={20} style={{ color: S.primary }} />
                {" "}
                Privacy Matters
              </h4>
              <p style={{ color: S.onSurfaceVariant, fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
                Your identification documents are encrypted at rest and in transit. We only use this data for regulatory compliance and identity verification as per our privacy policy.
              </p>
            </div>
            <div
              style={{
                background: `${S.surfaceContainerHighest}4d`,
                borderRadius: "0.75rem",
                padding: "2rem",
                border: `1px solid ${S.outlineVariant}1a`,
              }}
            >
              <h4 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <HelpCircleIcon size={20} style={{ color: S.primary }} />
                {" "}
                Need Assistance?
              </h4>
              <p style={{ color: S.onSurfaceVariant, fontSize: "0.875rem", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
                If your document was rejected or you're experiencing issues uploading, our verification team is here to help.
              </p>
              <button
                style={{
                  color: S.primary,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Contact Verification Team
                {" "}
                <ArrowRight size={14} />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default IdentityVerification;
