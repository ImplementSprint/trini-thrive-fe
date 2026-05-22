"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SharedLayout from "@/donor-components/SharedLayout";
import { XCircle, ShoppingCart } from "lucide-react";

const colors = {
  primary: "#97453e",
  primaryContainer: "#f28d83",
  onPrimaryContainer: "#6e2621",
  surface: "#fcf9f8",
  surfaceContainerLow: "#f6f3f2",
  onSurface: "#1b1c1b",
  onSurfaceVariant: "#554240",
  secondary: "#a8372c",
} as const;

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <SharedLayout>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1.5rem", textAlign: "center", padding: "2rem" }}>
        <div style={{ width: "5rem", height: "5rem", borderRadius: "999px", background: `${colors.secondary}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <XCircle size={40} color={colors.secondary} />
        </div>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif", marginBottom: "0.75rem" }}>
            Payment Cancelled
          </h1>
          <p style={{ fontSize: "1rem", color: colors.onSurfaceVariant, maxWidth: "420px", lineHeight: 1.6 }}>
            Your payment was cancelled. Your cart has been kept intact — you can try again whenever you're ready.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          <button
            onClick={() => router.push('/donor/basket')}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 1.75rem", background: colors.primaryContainer, color: colors.onPrimaryContainer, borderRadius: "0.75rem", border: "none", fontWeight: 700, fontSize: "0.9375rem", cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            <ShoppingCart size={18} /> Return to Basket
          </button>
          <button
            onClick={() => router.push('/donor/home')}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 1.75rem", background: colors.surfaceContainerLow, color: colors.onSurfaceVariant, borderRadius: "0.75rem", border: "none", fontWeight: 700, fontSize: "0.9375rem", cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </SharedLayout>
  );
}
