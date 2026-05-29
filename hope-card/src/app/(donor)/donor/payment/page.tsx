"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import SharedLayout from "@/donor-components/SharedLayout";
import { useCart } from "@/donor-contexts/CartContext";
import { ShieldCheck, Wallet, Lock, ChevronRight, AlertTriangle } from "lucide-react";
import { supabase, getDonorTokenPayload } from "@/donor-lib/supabase-client";

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
  error: "#ba1a1a",
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
  const router = useRouter();
  const { cart, cartTotal, loading: cartLoading, checkoutFromWallet } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);

  const currency = "₱";
  const total = cartTotal;
  const [annualDonated, setAnnualDonated] = useState(0);
  const trainPct = Math.min(100, (annualDonated / 250_000) * 100);
  const insufficientFunds = walletBalance !== null && walletBalance < total;

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      const payload = session?.user ? null : getDonorTokenPayload();
      const userId = session?.user?.id ?? payload?.sub;
      const token = localStorage.getItem('donor_token') ?? session?.access_token ?? '';

      if (userId && token) {
        // Fetch wallet balance
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/hopecard/donor/wallet/balance?authUserId=${userId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (res.ok) {
            const data = await res.json();
            setWalletBalance(data.balance ?? 0);
          }
        } catch { /* silently fail */ }

        // Fetch annual donation total for TRAIN Law
        if (session?.user) {
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
          if (data) setAnnualDonated(data.reduce((sum: number, r: any) => sum + (r.amount_paid ?? 0), 0));
        }
      }

      setWalletLoading(false);
    }
    fetchData();
  }, []);

  const isDisabled = cartLoading || walletLoading || submitting || cart.length === 0 || insufficientFunds;

  const handleComplete = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      sessionStorage.setItem('lastOrder', JSON.stringify({ cart, cartTotal, apiTotal: cartTotal, processingFee: 0 }));
      const result = await checkoutFromWallet();
      router.push(
        `/donor/payment/success?source=wallet&ref=${encodeURIComponent(result.walletTransactionRef)}`,
      );
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred during checkout");
      setSubmitting(false);
    }
  }, [checkoutFromWallet, cart, cartTotal, router]);

  return (
    <SharedLayout>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "4rem 3rem" }}>
        
        {/* Step Indicator */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", width: "100%", maxWidth: "600px", justifyContent: "space-between", position: "relative" }}>
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

        {/* Page header */}
        <div style={{ marginBottom: "3rem" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              color: colors.primary,
              fontFamily: "Plus Jakarta Sans, sans-serif",
              letterSpacing: "-0.04em",
              margin: "0 0 0.5rem",
            }}
          >
            Complete Donation
          </h1>
          <p
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: "Manrope, sans-serif",
              fontSize: "1rem",
              margin: 0,
            }}
          >
            Your donation will be deducted directly from your HopeCard wallet.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
          
          {/* Left: Donation Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ background: colors.surfaceContainerLowest, borderRadius: "1.25rem", padding: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.25rem", color: colors.onSurface, margin: "0 0 1.5rem" }}>
                Donation Summary
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
                {cartLoading && (
                  <p style={{ color: colors.onSurfaceVariant, fontSize: "0.875rem", fontFamily: "Manrope, sans-serif" }}>Loading cart…</p>
                )}
                {!cartLoading && cart.length === 0 && (
                  <p style={{ color: colors.onSurfaceVariant, fontSize: "0.875rem", fontFamily: "Manrope, sans-serif" }}>Your cart is empty.</p>
                )}
                {cart.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontWeight: 700, color: colors.onSurface, marginBottom: "0.25rem", fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.9375rem" }}>
                        {String(item.quantity).padStart(2, "0")}x {item.title}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Manrope, sans-serif" }}>
                        {item.category ?? "Campaign"}
                      </p>
                    </div>
                    <p style={{ fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.9375rem" }}>
                      {currency}{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingTop: "1.5rem", borderTop: `1px solid ${colors.outlineVariant}33`, marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem", alignItems: "center" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif", color: colors.onSurface }}>Total Donation</span>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: colors.primary, fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "-0.02em" }}>
                    {currency}{total.toLocaleString()}
                  </span>
                </div>
                {/* Wallet balance row */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontFamily: "Manrope, sans-serif", paddingTop: "0.5rem", borderTop: `1px solid ${colors.outlineVariant}33` }}>
                  <span style={{ color: colors.onSurfaceVariant, display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Wallet size={14} />
                    Wallet Balance
                  </span>
                  <span style={{ fontWeight: 700, color: insufficientFunds ? colors.error : colors.onSurface }}>
                    {walletLoading ? "Loading…" : walletBalance === null ? "—" : `${currency}${walletBalance.toLocaleString()}`}
                  </span>
                </div>
                {insufficientFunds && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.75rem 1rem", background: `${colors.error}12`, borderRadius: "0.75rem", marginTop: "0.25rem" }}>
                    <AlertTriangle size={16} color={colors.error} style={{ flexShrink: 0, marginTop: "0.125rem" }} />
                    <p style={{ fontSize: "0.8125rem", color: colors.error, fontFamily: "Manrope, sans-serif", fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                      Insufficient wallet balance. Please <a href="/donor/wallet" style={{ color: colors.error, textDecoration: "underline" }}>top up your wallet</a> before donating.
                    </p>
                  </div>
                )}
              </div>

              {/* TRAIN Law */}
              <div style={{ background: colors.surfaceContainerLow, padding: "1.25rem", borderRadius: "1rem", marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.75rem" }}>
                  <div>
                    <p style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: `${colors.onSurfaceVariant}B3`, fontFamily: "Manrope, sans-serif", marginBottom: "0.25rem" }}>
                      TRAIN Law Limit Usage
                    </p>
                    <p style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.tertiary, fontFamily: "Plus Jakarta Sans, sans-serif", margin: 0 }}>{trainPct.toFixed(2)}%</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.625rem", fontWeight: 700, color: colors.onSurfaceVariant, fontFamily: "Manrope, sans-serif", margin: 0 }}>
                      {currency}{annualDonated.toLocaleString()} / {currency}250,000
                    </p>
                  </div>
                </div>
                <div style={{ width: "100%", height: "0.5rem", background: colors.surfaceContainerHighest, borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${trainPct}%`, background: colors.tertiaryContainer, borderRadius: "999px" }} />
                </div>
              </div>

              {/* Error */}
              {submitError && (
                <p
                  style={{
                    color: colors.error,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    fontFamily: "Manrope, sans-serif",
                    margin: "0 0 1rem",
                  }}
                >
                  {submitError}
                </p>
              )}

              {/* CTA */}
              <button
                onClick={handleComplete}
                disabled={isDisabled}
                style={{
                  width: "100%",
                  padding: "1.125rem",
                  background: isDisabled ? colors.surfaceContainerHigh : colors.primaryContainer,
                  color: isDisabled ? colors.onSurfaceVariant : colors.onPrimaryContainer,
                  border: "none",
                  borderRadius: "999px",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  boxShadow: !isDisabled ? `0 6px 20px ${colors.primaryContainer}44` : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.625rem",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled) e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {cartLoading || walletLoading ? "Loading…" : submitting ? "Processing…" : (
                  <>
                    <Wallet size={18} />
                    Donate from Wallet
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
              <p style={{ textAlign: "center", margin: "1.25rem 0 0", fontSize: "0.6875rem", color: colors.onSurfaceVariant, fontWeight: 500, fontFamily: "Manrope, sans-serif", lineHeight: 1.5 }}>
                Your donation is tax-deductible. A certificate of donation will be sent to your email immediately upon completion.
              </p>
            </div>
          </div>

          {/* Right: Info panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* How it works */}
            <div style={{ background: colors.surfaceContainerLowest, borderRadius: "1.25rem", padding: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1rem", color: colors.onSurface, margin: "0 0 1.25rem" }}>
                What happens next?
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  { step: "1", text: 'Confirm your donation summary on the left.' },
                  { step: "2", text: 'Click "Donate from Wallet" — no redirect needed.' },
                  { step: "3", text: "The total is instantly deducted from your HopeCard wallet." },
                  { step: "4", text: "Your donation is confirmed immediately." },
                ].map(({ step, text }) => (
                  <div key={step} style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                    <div style={{ width: "2rem", height: "2rem", borderRadius: "999px", background: `${colors.primaryContainer}33`, color: colors.primary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {step}
                    </div>
                    <p style={{ fontFamily: "Manrope, sans-serif", fontSize: "0.875rem", color: colors.onSurfaceVariant, lineHeight: 1.6, margin: "0.25rem 0 0" }}>
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Security note */}
            <div style={{ background: `${colors.tertiaryContainer}18`, border: `1px solid ${colors.tertiaryContainer}44`, borderRadius: "1.25rem", padding: "1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <ShieldCheck size={22} color={colors.tertiary} style={{ flexShrink: 0, marginTop: "0.125rem" }} />
              <div>
                <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "0.9375rem", color: colors.onSurface, margin: "0 0 0.375rem" }}>
                  Instant & secure
                </p>
                <p style={{ fontFamily: "Manrope, sans-serif", fontSize: "0.8125rem", color: colors.onSurfaceVariant, lineHeight: 1.6, margin: 0 }}>
                  Wallet payments are processed instantly with no external redirects. Your balance is deducted only once — no double charges.
                </p>
              </div>
            </div>

            {/* Top-up prompt */}
            <div style={{ background: colors.surfaceContainerLow, borderRadius: "1.25rem", padding: "1.5rem" }}>
              <p style={{ fontFamily: "Manrope, sans-serif", fontSize: "0.8125rem", color: colors.onSurfaceVariant, margin: 0, lineHeight: 1.6 }}>
                Need more funds?{" "}
                <a href="/donor/wallet" style={{ color: colors.primary, fontWeight: 700, textDecoration: "none" }}>
                  Top up your wallet
                </a>{" "}
                via GCash, Maya, QR Ph, or card.
              </p>
            </div>

          </div>
        </div>
      </div>
    </SharedLayout>
  );
}
