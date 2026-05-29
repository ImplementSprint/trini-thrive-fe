"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SharedLayout from "@/donor-components/SharedLayout";
import { getDonorTokenPayload } from "@/donor-lib/supabase-client";
import { CheckCircle, Wallet, Home, ArrowRight } from "lucide-react";

const colors = {
  primary: "#97453e",
  primaryContainer: "#f28d83",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6e2621",
  tertiary: "#775a00",
  tertiaryContainer: "#cda336",
  tertiaryFixed: "#ffedb8",
  onTertiaryFixed: "#3f2e00",
  surface: "#fcf9f8",
  surfaceContainer: "#f0edec",
  surfaceContainerLow: "#f6f3f2",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#1b1c1b",
  onSurfaceVariant: "#554240",
  outlineVariant: "#dac1be",
} as const;

function WalletSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addedAmount = Number(searchParams.get("amount") ?? 0);
  const referenceId = searchParams.get("ref") ?? "";
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    const confirmAndFetch = async () => {
      try {
        const tokenPayload = getDonorTokenPayload();
        if (!tokenPayload) {
          setBalanceLoading(false);
          return;
        }

        const token = localStorage.getItem("donor_token");
        const base = process.env.NEXT_PUBLIC_DONOR_BACKEND_URL ?? "";

        // If we have a PayMongo referenceId, confirm the top-up to credit the wallet
        if (referenceId) {
          const confirmRes = await fetch(`${base}/api/v1/hopecard/donor/wallet/topup/confirm`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              authUserId: tokenPayload.sub,
              referenceId,
              amount: addedAmount,
            }),
          });
          const confirmData = await confirmRes.json().catch(() => ({}));
          if (confirmRes.ok) {
            setNewBalance(Number(confirmData.newBalance));
            setBalanceLoading(false);
            return;
          }
          // If confirmation fails, surface the error but still show the balance
          setConfirmError(confirmData?.message ?? "Could not confirm top-up. Please contact support.");
        }

        // Fallback: fetch current balance (mock flow or confirm failed)
        const res = await fetch(
          `${base}/api/v1/hopecard/donor/wallet/balance?authUserId=${tokenPayload.sub}`,
          { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } },
        );
        if (res.ok) {
          const data = await res.json();
          setNewBalance(Number(data.balance));
        }
      } catch (err) {
        console.error("Failed to confirm top-up:", err);
      } finally {
        setBalanceLoading(false);
      }
    };

    confirmAndFetch();
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(n);

  return (
    <SharedLayout currentPage="wallet">
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          padding: "5rem 3rem 6rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Success icon */}
        <div style={{ position: "relative", marginBottom: "2.5rem" }}>
          <div
            style={{
              position: "absolute",
              inset: "-1rem",
              background: `${colors.primaryContainer}22`,
              borderRadius: "999px",
              transform: "rotate(-12deg) scale(1.2)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "-0.5rem",
              background: `${colors.tertiaryFixed}33`,
              borderRadius: "999px",
              transform: "rotate(20deg) scale(1.1)",
            }}
          />
          <div
            style={{
              position: "relative",
              width: "5.5rem",
              height: "5.5rem",
              borderRadius: "999px",
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryContainer})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 32px rgba(151,69,62,0.25)",
            }}
          >
            <CheckCircle size={44} color={colors.onPrimary} fill={colors.onPrimary} strokeWidth={0} />
          </div>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: "2.5rem",
            fontWeight: 800,
            color: colors.primary,
            letterSpacing: "-0.04em",
            margin: "0 0 0.75rem",
          }}
        >
          Top-Up Successful!
        </h1>
        <p
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: "1.0625rem",
            color: colors.onSurfaceVariant,
            lineHeight: 1.6,
            margin: "0 0 3rem",
          }}
        >
          Your wallet has been credited. Ready to support a cause you care about?
        </p>

        {/* Confirm error (non-fatal) */}
        {confirmError && (
          <p style={{ fontFamily: "Manrope, sans-serif", fontSize: "0.8125rem", color: "#ba1a1a", fontWeight: 600, marginBottom: "1rem", lineHeight: 1.5 }}>
            {confirmError}
          </p>
        )}

        {/* Balance summary card */}
        <div
          style={{
            width: "100%",
            background: colors.surfaceContainerLowest,
            borderRadius: "1.25rem",
            padding: "2rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
            marginBottom: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {addedAmount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "1.25rem",
                borderBottom: `1px solid ${colors.outlineVariant}33`,
              }}
            >
              <span
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "0.875rem",
                  color: colors.onSurfaceVariant,
                }}
              >
                Amount added
              </span>
              <span
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  color: colors.tertiary,
                }}
              >
                + {fmt(addedAmount)}
              </span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <Wallet size={20} color={colors.primary} />
              <span
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: colors.onSurfaceVariant,
                }}
              >
                New wallet balance
              </span>
            </div>
            <span
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 800,
                fontSize: "1.625rem",
                color: colors.primary,
                letterSpacing: "-0.03em",
                opacity: balanceLoading ? 0.6 : 1,
              }}
            >
              {balanceLoading ? "Loading..." : newBalance !== null ? fmt(newBalance) : "—"}
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", width: "100%" }}>
          <button
            onClick={() => router.push("/donor/explore")}
            style={{
              width: "100%",
              padding: "1.125rem",
              background: colors.primaryContainer,
              color: colors.onPrimaryContainer,
              border: "none",
              borderRadius: "999px",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: `0 6px 20px ${colors.primaryContainer}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.625rem",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Explore Campaigns <ArrowRight size={18} />
          </button>

          <button
            onClick={() => router.push("/donor/wallet")}
            style={{
              width: "100%",
              padding: "1.125rem",
              background: "transparent",
              color: colors.primary,
              border: `2px solid ${colors.primaryContainer}`,
              borderRadius: "999px",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.625rem",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = `${colors.primaryContainer}18`)
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Wallet size={18} /> Back to Wallet
          </button>

          <button
            onClick={() => router.push("/donor/home")}
            style={{
              background: "none",
              border: "none",
              color: colors.onSurfaceVariant,
              fontFamily: "Manrope, sans-serif",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.5rem",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.onSurfaceVariant)}
          >
            <Home size={16} /> Go to Home
          </button>
        </div>
      </div>
    </SharedLayout>
  );
}

export default function WalletSuccessPage() {
  return (
    <Suspense>
      <WalletSuccessContent />
    </Suspense>
  );
}
