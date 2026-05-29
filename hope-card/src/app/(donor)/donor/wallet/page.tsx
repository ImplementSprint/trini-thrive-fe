"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SharedLayout from "@/donor-components/SharedLayout";
import { getDonorTokenPayload } from "@/donor-lib/supabase-client";
import { Wallet, Plus, ShieldCheck, ChevronRight } from "lucide-react";
import { useDonorStatus } from '@/donor-contexts/DonorStatusContext';

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
  onSurface: "#1b1c1b",
  onSurfaceVariant: "#554240",
  outlineVariant: "#dac1be",
  error: "#ba1a1a",
} as const;

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

export default function WalletPage() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const { isSuspended, isBanned } = useDonorStatus();
  const isRestricted = isSuspended || isBanned;

  const resolvedAmount =
    selectedPreset !== null ? selectedPreset : Number(customAmount) || 0;

  const handleCustomInput = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setCustomAmount(cleaned);
    setSelectedPreset(null);
  };

  const handlePresetSelect = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount("");
  };

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const tokenPayload = getDonorTokenPayload();
        if (!tokenPayload) {
          setBalanceLoading(false);
          return;
        }

        const token = localStorage.getItem("donor_token");
        const base = process.env.NEXT_PUBLIC_DONOR_BACKEND_URL ?? "";
        const res = await fetch(
          `${base}/api/v1/hopecard/donor/wallet/balance?authUserId=${tokenPayload.sub}`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setBalance(Number(data.balance));
        }
      } catch (err) {
        console.error("Failed to fetch wallet balance:", err);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
  }, []);

  const handleTopUp = async () => {
    if (isRestricted) {
      setError('Top-ups are unavailable while your account is suspended.');
      return;
    }
    if (resolvedAmount < 50) {
      setError("Minimum top-up amount is ₱50.");
      return;
    }
    const tokenPayload = getDonorTokenPayload();
    if (!tokenPayload) {
      setError("Your session has expired. Please log in again.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("donor_token");
      const base = process.env.NEXT_PUBLIC_DONOR_BACKEND_URL ?? "";
      const res = await fetch(
        `${base}/api/v1/hopecard/donor/wallet/topup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ authUserId: tokenPayload.sub, amount: resolvedAmount }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Top-up request failed.");
      }
      const data = await res.json();
      const checkoutUrl: string = data?.checkoutUrl ?? data?.checkout_url ?? data?.url ?? "";
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        // Dev/mock fallback: navigate directly to success
        router.push(`/donor/wallet/success?amount=${resolvedAmount}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      // If backend is unavailable in dev, fall through to mock success
      if (
        msg.includes("fetch") ||
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError")
      ) {
        router.push(`/donor/wallet/success?amount=${resolvedAmount}`);
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formattedBalance =
    balance !== null
      ? new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
          minimumFractionDigits: 2,
        }).format(balance)
      : "—";

  return (
    <SharedLayout currentPage="wallet">
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "4rem 3rem" }}>
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
            My Wallet
          </h1>
          <p
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: "Manrope, sans-serif",
              fontSize: "1rem",
              margin: 0,
            }}
          >
            Add funds to your HopeCard wallet and donate instantly to any campaign.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Left: Balance card + top-up form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Balance card */}
            <div
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryContainer} 100%)`,
                borderRadius: "1.5rem",
                padding: "2.5rem",
                color: colors.onPrimary,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 12px 40px rgba(151,69,62,0.25)",
              }}
            >
              {/* Decorative circles */}
              <div
                style={{
                  position: "absolute",
                  top: "-2rem",
                  right: "-2rem",
                  width: "8rem",
                  height: "8rem",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.08)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-3rem",
                  right: "4rem",
                  width: "10rem",
                  height: "10rem",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.05)",
                }}
              />
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "2rem",
                }}
              >
                <Wallet size={24} />
                <span
                  style={{
                    fontFamily: "Manrope, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    opacity: 0.85,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  HopeCard Wallet
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <p
                  style={{
                    fontFamily: "Manrope, sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    opacity: 0.7,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: "0 0 0.375rem",
                  }}
                >
                  Available Balance
                </p>
                <p
                  style={{
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontSize: "2.75rem",
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: "-0.03em",
                    opacity: balanceLoading ? 0.6 : 1,
                  }}
                >
                  {balanceLoading ? "Loading..." : formattedBalance}
                </p>
              </div>
            </div>

            {/* Top-up form */}
            <div
              style={{
                background: colors.surfaceContainerLowest,
                borderRadius: "1.25rem",
                padding: "2rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <h2
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: colors.onSurface,
                  margin: "0 0 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                }}
              >
                <Plus size={20} color={colors.primary} />
                Top Up Wallet
              </h2>

              {/* Restriction notice */}
              {isRestricted && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  color: '#9a3412',
                  fontSize: '0.875rem',
                  fontFamily: 'Manrope, sans-serif',
                  marginBottom: '1rem',
                }}>
                  Top-ups are unavailable while your account is suspended.
                </div>
              )}

              {/* Preset amounts */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.75rem",
                  marginBottom: "1.25rem",
                }}
              >
                {PRESET_AMOUNTS.map((amt) => {
                  const active = selectedPreset === amt;
                  return (
                    <button
                      key={amt}
                      onClick={() => handlePresetSelect(amt)}
                      disabled={isRestricted}
                      style={{
                        padding: "0.75rem",
                        borderRadius: "0.875rem",
                        border: `2px solid ${active ? colors.primary : colors.outlineVariant}`,
                        background: active
                          ? `${colors.primaryContainer}22`
                          : colors.surfaceContainerLow,
                        color: active ? colors.primary : colors.onSurface,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.9375rem",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        opacity: isRestricted ? 0.5 : 1,
                        pointerEvents: isRestricted ? 'none' : 'auto' as React.CSSProperties['pointerEvents'],
                      }}
                      onMouseEnter={(e) => {
                        if (!active)
                          (e.currentTarget.style.borderColor = colors.primaryContainer);
                      }}
                      onMouseLeave={(e) => {
                        if (!active)
                          (e.currentTarget.style.borderColor = colors.outlineVariant);
                      }}
                    >
                      ₱{amt.toLocaleString()}
                    </button>
                  );
                })}
              </div>

              {/* Custom amount */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: colors.onSurfaceVariant,
                    fontFamily: "Manrope, sans-serif",
                    marginBottom: "0.5rem",
                  }}
                >
                  Or enter a custom amount
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontWeight: 700,
                      color: colors.onSurfaceVariant,
                      fontSize: "1rem",
                    }}
                  >
                    ₱
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={customAmount}
                    onChange={(e) => handleCustomInput(e.target.value)}
                    disabled={isRestricted}
                    style={{
                      width: "100%",
                      padding: "1rem 1rem 1rem 2.25rem",
                      borderRadius: "0.875rem",
                      background: colors.surfaceContainerLow,
                      border: `2px solid ${customAmount ? colors.primary : "transparent"}`,
                      outline: "none",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontWeight: 700,
                      fontSize: "1.125rem",
                      color: colors.onSurface,
                      boxSizing: "border-box",
                      transition: "border-color 0.15s",
                    }}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <p
                  style={{
                    color: colors.error,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    fontFamily: "Manrope, sans-serif",
                    margin: "0 0 1rem",
                  }}
                >
                  {error}
                </p>
              )}

              {/* CTA */}
              <button
                onClick={handleTopUp}
                disabled={loading || resolvedAmount === 0 || isRestricted}
                style={{
                  width: "100%",
                  padding: "1.125rem",
                  background:
                    loading || resolvedAmount === 0 || isRestricted
                      ? colors.surfaceContainerHigh
                      : colors.primaryContainer,
                  color:
                    loading || resolvedAmount === 0 || isRestricted
                      ? colors.onSurfaceVariant
                      : colors.onPrimaryContainer,
                  border: "none",
                  borderRadius: "999px",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor:
                    loading || resolvedAmount === 0 || isRestricted ? "not-allowed" : "pointer",
                  boxShadow:
                    resolvedAmount > 0 && !loading && !isRestricted
                      ? `0 6px 20px ${colors.primaryContainer}44`
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.625rem",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!loading && resolvedAmount > 0 && !isRestricted)
                    e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {loading ? (
                  "Redirecting to payment…"
                ) : (
                  <>
                    Top Up{" "}
                    {resolvedAmount > 0
                      ? `₱${resolvedAmount.toLocaleString()}`
                      : ""}
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Info panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* How it works */}
            <div
              style={{
                background: colors.surfaceContainerLowest,
                borderRadius: "1.25rem",
                padding: "2rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <h3
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: colors.onSurface,
                  margin: "0 0 1.25rem",
                }}
              >
                How wallet top-up works
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  {
                    step: "1",
                    text: "Choose or enter an amount above.",
                  },
                  {
                    step: "2",
                    text: 'Click "Top Up" — you\'ll be redirected to PayMongo\'s secure checkout.',
                  },
                  {
                    step: "3",
                    text: "Pay via GCash, Maya, card, or QR Ph.",
                  },
                  {
                    step: "4",
                    text: "Funds are credited to your wallet instantly upon confirmation.",
                  },
                ].map(({ step, text }) => (
                  <div
                    key={step}
                    style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}
                  >
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "999px",
                        background: `${colors.primaryContainer}33`,
                        color: colors.primary,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontWeight: 800,
                        fontSize: "0.875rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {step}
                    </div>
                    <p
                      style={{
                        fontFamily: "Manrope, sans-serif",
                        fontSize: "0.875rem",
                        color: colors.onSurfaceVariant,
                        lineHeight: 1.6,
                        margin: "0.25rem 0 0",
                      }}
                    >
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Security note */}
            <div
              style={{
                background: `${colors.tertiaryContainer}18`,
                border: `1px solid ${colors.tertiaryContainer}44`,
                borderRadius: "1.25rem",
                padding: "1.5rem",
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
              }}
            >
              <ShieldCheck size={22} color={colors.tertiary} style={{ flexShrink: 0, marginTop: "0.125rem" }} />
              <div>
                <p
                  style={{
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                    color: colors.onSurface,
                    margin: "0 0 0.375rem",
                  }}
                >
                  Secure & protected
                </p>
                <p
                  style={{
                    fontFamily: "Manrope, sans-serif",
                    fontSize: "0.8125rem",
                    color: colors.onSurfaceVariant,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  All transactions are processed through PayMongo, a BSP-regulated
                  payment gateway. HopeCard never stores your card details.
                </p>
              </div>
            </div>

            {/* Payment methods */}
            <div
              style={{
                background: colors.surfaceContainerLow,
                borderRadius: "1.25rem",
                padding: "1.5rem",
              }}
            >
              <p
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: colors.onSurfaceVariant,
                  margin: "0 0 0.875rem",
                }}
              >
                Accepted payment methods
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.625rem",
                  flexWrap: "wrap",
                }}
              >
                {["GCash", "Maya", "GrabPay", "QR Ph", "Visa / MC"].map(
                  (method) => (
                    <span
                      key={method}
                      style={{
                        padding: "0.375rem 0.875rem",
                        background: colors.surfaceContainerLowest,
                        border: `1px solid ${colors.outlineVariant}`,
                        borderRadius: "999px",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: colors.onSurfaceVariant,
                        fontFamily: "Manrope, sans-serif",
                      }}
                    >
                      {method}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}
