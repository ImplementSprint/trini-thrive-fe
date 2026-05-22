"use client";

import React, { useState, useCallback, useEffect } from "react";
import SharedLayout from "@/donor-components/SharedLayout";
import { useCart } from "@/donor-contexts/CartContext";
import { ShieldCheck, Heart } from "lucide-react";
import { supabase } from "@/donor-lib/supabase-client";

// Design Tokens
const colors = {
  primary: "#97453e",
  primaryContainer: "#f28d83",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6e2621",
  secondary: "#a8372c",
  secondaryContainer: "#ff7766",
  tertiary: "#775a00",
  tertiaryContainer: "#cda336",
  surface: "#fcf9f8",
  surfaceContainer: "#f0edec",
  surfaceContainerLow: "#f6f3f2",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerHigh: "#eae7e7",
  surfaceContainerHighest: "#e4e1e0",
  onSurface: "#1b1c1b",
  onSurfaceVariant: "#554240",
  outline: "#877270",
  outlineVariant: "#dac1be",
} as const;

type CheckoutStepState = "completed" | "active" | "pending";

interface CheckoutStep {
  number: number;
  label: string;
  state: CheckoutStepState;
}

const STEPS: CheckoutStep[] = [
  { number: 1, label: "Review", state: "completed" },
  { number: 2, label: "Payment", state: "active" },
  { number: 3, label: "Confirm", state: "pending" },
];


export default function PaymentPage() {
  const { cart, cartTotal, processingFee, apiTotal, loading: cartLoading, checkout } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currency = "₱";
  const total = apiTotal > 0 ? apiTotal : cartTotal;
  const [annualDonated, setAnnualDonated] = useState(0);
  const trainPct = Math.min(100, (annualDonated / 250_000) * 100);

  useEffect(() => {
    async function fetchAnnualTotal() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const created = new Date(session.user.created_at);
      const now = new Date();
      const periodStart = new Date(created);
      periodStart.setFullYear(now.getFullYear());
      if (periodStart > now) periodStart.setFullYear(now.getFullYear() - 1);
      const { data } = await supabase
        .from('hopecard_purchases')
        .select('amount_paid')
        .eq('buyer_auth_id', session.user.id)
        .eq('status', 'paid')
        .gte('purchased_at', periodStart.toISOString());
      if (data) setAnnualDonated(data.reduce((sum, r) => sum + (r.amount_paid ?? 0), 0));
    }
    fetchAnnualTotal();
  }, []);
  const isDisabled = cartLoading || submitting || cart.length === 0;

  const handleComplete = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      sessionStorage.setItem('lastOrder', JSON.stringify({ cart, cartTotal, apiTotal, processingFee }));
      const checkoutUrl = await checkout();
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred during checkout");
      setSubmitting(false);
    }
  }, [checkout, cart, cartTotal, apiTotal, processingFee]);

  return (
    <SharedLayout>
      <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "2rem 3rem" }}>
        {/* Step Indicator */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "4rem" }}>
          <div style={{ display: "flex", alignItems: "center", width: "100%", maxWidth: "768px", justifyContent: "space-between", position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: "2px", background: `${colors.outlineVariant}33`, transform: "translateY(-50%)", zIndex: 0 }} />
            {STEPS.map((step) => {
              const isCompleted = step.state === "completed";
              const isActive = step.state === "active";
              const isPending = step.state === "pending";
              return (
                <div key={step.number} style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    boxShadow: isActive ? "0 4px 12px rgba(151,69,62,0.15)" : "0 2px 4px rgba(0,0,0,0.04)",
                    ...(isActive ? {
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "999px",
                      background: colors.primaryContainer,
                      color: colors.onPrimaryContainer,
                      border: `4px solid ${colors.surface}`,
                    } : isCompleted ? {
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "999px",
                      background: colors.primary,
                      color: colors.onPrimary,
                    } : {
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "999px",
                      background: colors.surfaceContainerHighest,
                      color: colors.onSurfaceVariant,
                    })
                  }}>
                    {step.number}
                  </div>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: isCompleted ? colors.primary : isPending ? `${colors.onSurfaceVariant}99` : colors.onSurface,
                    fontFamily: "Manrope, sans-serif",
                  }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: "3rem", alignItems: "start" }}>
          {/* Left: Secure checkout notice */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            <section>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "2rem", color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                Secure Checkout
              </h2>
              <div style={{ background: colors.surfaceContainerLow, padding: "3rem", borderRadius: "1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", textAlign: "center" }}>
                <div style={{ width: "5rem", height: "5rem", borderRadius: "999px", background: `${colors.primaryContainer}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck size={40} color={colors.primary} />
                </div>
                <div>
                  <p style={{ fontSize: "1.25rem", fontWeight: 700, color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif", marginBottom: "0.75rem" }}>
                    You'll be redirected to a secure payment page
                  </p>
                  <p style={{ fontSize: "0.9375rem", color: colors.onSurfaceVariant, lineHeight: 1.6, maxWidth: "400px" }}>
                    Clicking <strong>Complete Donation</strong> will take you to our payment partner's secure checkout where you can pay via GCash, Maya, GrabPay, QR Ph, or card.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", marginTop: "0.5rem" }}>
                  {["GCash", "Maya", "GrabPay", "QR Ph", "Card"].map((method) => (
                    <span key={method} style={{ padding: "0.375rem 1rem", background: colors.surfaceContainerLowest, border: `1px solid ${colors.outlineVariant}`, borderRadius: "999px", fontSize: "0.8125rem", fontWeight: 600, color: colors.onSurfaceVariant, fontFamily: "Manrope, sans-serif" }}>
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right: Sticky order summary */}
          <div style={{ position: "sticky", top: "6rem" }}>
            <div style={{ background: colors.surfaceContainerLowest, borderRadius: "1rem", padding: "2.5rem", boxShadow: "0 12px 40px rgba(27,28,27,0.06)" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "2rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Donation Summary</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2.5rem" }}>
                {cartLoading && (
                  <p style={{ color: colors.onSurfaceVariant, fontSize: "0.875rem" }}>Loading cart…</p>
                )}
                {!cartLoading && cart.length === 0 && (
                  <p style={{ color: colors.onSurfaceVariant, fontSize: "0.875rem" }}>Your cart is empty.</p>
                )}
                {cart.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontWeight: 700, color: colors.onSurface, marginBottom: "0.25rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                        {String(item.quantity).padStart(2, "0")}x {item.title}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Manrope, sans-serif" }}>
                        {item.category ?? "Campaign"}
                      </p>
                    </div>
                    <p style={{ fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      {currency}{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingTop: "2rem", borderTop: `1px solid ${colors.outlineVariant}33`, marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                  <span style={{ color: colors.onSurfaceVariant }}>Subtotal</span>
                  <span style={{ fontWeight: 500 }}>{currency}{cartTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                  <span style={{ color: colors.onSurfaceVariant }}>Processing Fee</span>
                  <span style={{ fontWeight: 500, color: colors.secondaryContainer }}>{currency}{processingFee.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem" }}>
                  <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>Total Donation</span>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                    {currency}{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* TRAIN Law */}
              <div style={{ background: colors.surfaceContainerLow, padding: "1.5rem", borderRadius: "1rem", marginBottom: "2.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.75rem" }}>
                  <div>
                    <p style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: `${colors.onSurfaceVariant}B3`, fontFamily: "Manrope, sans-serif" }}>
                      TRAIN Law Limit Usage
                    </p>
                    <p style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.tertiary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{trainPct.toFixed(2)}%</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.625rem", fontWeight: 700, color: colors.onSurfaceVariant }}>
                      {currency}{annualDonated.toLocaleString()} / {currency}250,000
                    </p>
                  </div>
                </div>
                <div style={{ width: "100%", height: "0.5rem", background: colors.surfaceContainerHighest, borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${trainPct}%`, background: colors.tertiaryContainer, borderRadius: "999px" }} />
                </div>
              </div>

              <button
                onClick={handleComplete}
                disabled={isDisabled}
                style={{
                  width: "100%",
                  height: "4rem",
                  background: isDisabled ? colors.surfaceContainerHigh : colors.primaryContainer,
                  color: isDisabled ? colors.onSurfaceVariant : colors.onPrimaryContainer,
                  borderRadius: "1rem",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  border: "none",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  boxShadow: isDisabled ? "none" : `0 8px 20px ${colors.primaryContainer}33`,
                  transition: "transform 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
                onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <Heart size={20} fill="currentColor" />
                {cartLoading ? "Loading…" : submitting ? "Processing…" : "Complete Donation"}
              </button>
              {submitError && (
                <p style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.875rem", color: colors.secondary, fontWeight: 600 }}>
                  {submitError}
                </p>
              )}

              <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.625rem", color: `${colors.onSurfaceVariant}99`, fontWeight: 500, padding: "0 1rem", lineHeight: 1.6 }}>
                Your donation is tax-deductible. A certificate of donation will be sent to your email immediately upon completion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}
