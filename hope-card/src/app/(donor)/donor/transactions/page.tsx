"use client";

import React, { useCallback } from "react";
import SharedLayout from "@/donor-components/SharedLayout";
import { MapPin, CheckCircle, Clock } from "lucide-react";
import { useImpact } from "@/donor-hooks/useImpact";

// Design Tokens
const colors = {
  primary: "#97453e",
  primaryContainer: "#f28d83",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6e2621",
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
  surfaceContainerLowest: "#ffffff",
  surfaceContainerHigh: "#eae7e7",
  surfaceContainerHighest: "#e4e1e0",
  onSurface: "#1b1c1b",
  onSurfaceVariant: "#554240",
} as const;

export default function TransactionsPage() {
  const { data, loading, error } = useImpact();

  const handleViewImpactMap = useCallback(() => console.log("View Impact Map"), []);

  return (
    <SharedLayout currentPage="transactions">
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 3rem" }}>
        {/* Dashboard Header */}
        <header style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: colors.primary, marginBottom: "0.5rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Welcome home, {data?.first_name ?? ''}.
          </h1>
          <p style={{ color: colors.onSurfaceVariant, fontSize: "1.125rem" }}>
            Your heart is changing the world, one pulse at a time.
          </p>
        </header>

        {/* Hero: Impact Record — full width */}
        <div style={{ marginBottom: "3rem" }}>
          {/* Impact Record */}
          <div style={{ background: colors.primary, padding: "2.5rem", borderRadius: "1rem", color: colors.onPrimary, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.75rem", background: "rgba(255,255,255,0.1)", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                  <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "999px", background: colors.primaryContainer, animation: "pulse 2s infinite" }} />
                  ACTIVE IMPACT
                </div>
                <h2 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {data?.stats.lives_touched ?? 0} Lives Touched
                </h2>
                <p style={{ fontSize: "1.25rem", opacity: 0.9, maxWidth: "600px", lineHeight: 1.6 }}>
                  Through your contributions to HOPECARD, you've helped {data?.stats.lives_touched ?? 0} individuals this year.
                </p>
              </div>
              <div style={{ marginTop: "2rem" }}>
                <button onClick={handleViewImpactMap} style={{ background: colors.onPrimary, color: colors.primary, padding: "0.875rem 1.5rem", borderRadius: "1rem", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "Plus Jakarta Sans, sans-serif", transition: "transform 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                  View Impact Map <MapPin size={18} />
                </button>
              </div>
            </div>
            <div style={{ position: "absolute", top: 0, right: 0, width: "24rem", height: "24rem", background: "rgba(255,255,255,0.05)", borderRadius: "999px", transform: "translate(25%, -25%)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, width: "20rem", height: "20rem", background: "rgba(242,141,131,0.1)", borderRadius: "999px", transform: "translate(-25%, 33%)" }} />
          </div>
        </div>

        {/* History Grids */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
          {/* Donation History */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif" }}>Donation History</h3>
              <a href="#" style={{ color: colors.primary, fontWeight: 700, fontSize: "0.875rem", textDecoration: "underline", textDecorationColor: colors.primaryContainer }}>
                View All
              </a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {loading && <p style={{ color: colors.onSurfaceVariant }}>Loading history...</p>}
              {error && <p style={{ color: colors.secondary }}>Could not load donation history.</p>}
              {!loading && (data?.donation_history ?? []).map((item) => {
                const isProcessed = item.status === 'paid';
                return (
                  <div key={item.id} style={{ background: colors.surfaceContainerLow, padding: "1.25rem", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = colors.surfaceContainerLowest; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = colors.surfaceContainerLow; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: "3rem", height: "3rem", background: colors.surfaceContainerLowest, borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {isProcessed ? <CheckCircle size={20} color={colors.secondary} /> : <Clock size={20} color={colors.onSurfaceVariant} />}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 700, color: colors.onSurface, marginBottom: "0.125rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{item.campaign_title}</h4>
                        <p style={{ fontSize: "0.75rem", color: colors.onSurfaceVariant }}>{new Date(item.purchased_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontWeight: 800, color: colors.onSurface, marginBottom: "0.25rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>₱{item.amount_paid.toLocaleString()}</p>
                      <span style={{ fontSize: "0.625rem", padding: "0.25rem 0.5rem", borderRadius: "999px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: isProcessed ? `${colors.secondaryContainer}33` : colors.surfaceContainerHigh, color: isProcessed ? colors.onSecondaryContainer : colors.onSurfaceVariant }}>
                        {isProcessed ? 'Processed' : item.status}
                      </span>
                    </div>
                  </div>
                );
              })}
              {!loading && (data?.donation_history ?? []).length === 0 && !error && (
                <p style={{ color: colors.onSurfaceVariant }}>No donations yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </SharedLayout>
  );
}
