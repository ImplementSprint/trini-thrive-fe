"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SharedLayout from "@/donor-components/SharedLayout";
import { Trash2, Plus, Minus, Building2, Heart, Shield } from "lucide-react";
import { useCart } from "@/donor-contexts/CartContext";

// Design Tokens
const colors = {
  primary: "#97453e",
  primaryContainer: "#f28d83",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6e2621",
  secondary: "#a8372c",
  surface: "#fcf9f8",
  surfaceContainer: "#f0edec",
  surfaceContainerLow: "#f6f3f2",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#1b1c1b",
  onSurfaceVariant: "#554240",
  outline: "#877270",
  outlineVariant: "#dac1be",
  tertiary: "#775a00",
} as const;

const TRAIN_LAW_LIMIT = 250000;

export default function BasketPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, cartTotal, loading, processingFee, apiTotal } = useCart();

  const subtotal = cartTotal;
  const trainUsedPercent = Math.min(100, Math.round((subtotal / TRAIN_LAW_LIMIT) * 100));

  return (
    <SharedLayout currentPage="basket">
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "2rem 3rem" }}>
        {loading && (
          <p style={{ color: colors.onSurfaceVariant, padding: "2rem 0" }}>Loading basket...</p>
        )}
        {/* Header */}
        <header style={{ marginBottom: "3rem", maxWidth: "800px" }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 800, color: colors.primary, marginBottom: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>
            Your Selection
          </h1>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif", fontStyle: "italic", opacity: 0.9, margin: "0 0 0.5rem" }}>
            Impact Basket
          </h2>
          <p style={{ color: colors.onSurfaceVariant, fontSize: "1.125rem", lineHeight: 1.6, margin: 0 }}>
            Every contribution is a seed of hope. Review your choices and see the ripple effect of your generosity.
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "3rem" }}>
          {/* Cart Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {cart.map((item) => (
              <div key={item.id} style={{ background: colors.surfaceContainerLowest, borderRadius: "1rem", padding: "2rem", display: "flex", gap: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "box-shadow 0.3s" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(151,69,62,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)")}>
                <div style={{ width: "16rem", height: "12rem", borderRadius: "0.75rem", overflow: "hidden", flexShrink: 0 }}>
                  <img src={item.imageSrc} alt={item.imageAlt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: colors.onSurface, marginBottom: "0.5rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{item.title}</h3>
                      <p style={{ color: colors.primary, fontWeight: 700, fontSize: "1.25rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                        {item.currency}{item.price.toLocaleString()}
                      </p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: colors.onSurfaceVariant, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = colors.secondary)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = colors.onSurfaceVariant)}>
                      <Trash2 size={18} /> Remove
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", background: colors.surfaceContainerLow, borderRadius: "999px", padding: "0.25rem", border: `1px solid ${colors.outlineVariant}` }}>
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} style={{ width: "2.5rem", height: "2.5rem", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: colors.primary, transition: "background 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = colors.surfaceContainer)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <Minus size={18} />
                      </button>
                      <span style={{ width: "3rem", textAlign: "center", fontWeight: 700, fontSize: "1.125rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                        {String(item.quantity).padStart(2, "0")}
                      </span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: "2.5rem", height: "2.5rem", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: colors.primary, transition: "background 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = colors.surfaceContainer)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <Plus size={18} />
                      </button>
                    </div>
                    <span style={{ color: colors.onSurfaceVariant, fontSize: "0.875rem" }}>Units of Impact</span>
                  </div>
                </div>
              </div>
            ))}
            {!loading && cart.length === 0 && (
              <p style={{ color: colors.onSurfaceVariant }}>Your basket is empty.</p>
            )}
          </div>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* TRAIN Law Credit */}
            <div style={{ background: colors.surfaceContainerLow, borderRadius: "1rem", padding: "2rem", border: `1px solid ${colors.outlineVariant}33` }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.125rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: `${colors.tertiary}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={20} color={colors.tertiary} />
                </div>
                <span>TRAIN Law Credit</span>
              </h3>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                  <span style={{ color: colors.onSurfaceVariant }}>Annual Limit Status</span>
                  <span style={{ fontWeight: 700, color: colors.onSurface }}>₱{TRAIN_LAW_LIMIT.toLocaleString()} Limit</span>
                </div>
                <div style={{ height: "0.75rem", width: "100%", background: colors.surfaceContainer, borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${trainUsedPercent}%`, background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryContainer})`, transition: "width 1s" }} />
                </div>
                <p style={{ fontSize: "0.875rem", fontWeight: 500, color: colors.onSurfaceVariant, marginTop: "0.75rem" }}>
                  <span style={{ color: colors.primary, fontWeight: 700 }}>₱{subtotal.toLocaleString()}</span> of ₱{TRAIN_LAW_LIMIT.toLocaleString()} USED
                </p>
              </div>
            </div>

            {/* Impact Summary */}
            <div style={{ background: colors.surfaceContainerLowest, borderRadius: "1rem", padding: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.5rem", marginBottom: "2rem" }}>Impact Summary</h3>
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", color: colors.onSurfaceVariant }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600, color: colors.onSurface }}>₱{subtotal.toLocaleString()}.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", color: colors.onSurfaceVariant }}>
                  <span>Processing Fee</span>
                  <span style={{ color: colors.secondary, fontWeight: 500, fontStyle: "italic" }}>₱{processingFee.toLocaleString()}.00</span>
                </div>
                <div style={{ paddingTop: "1rem", borderTop: `1px solid ${colors.outlineVariant}33`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>Total</span>
                  <span style={{ fontWeight: 700, fontSize: "2rem", color: colors.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>₱{(apiTotal > 0 ? apiTotal : subtotal).toLocaleString()}.00</span>
                </div>
              </div>
              <button onClick={() => router.push('/donor/payment')} disabled={cart.length === 0} style={{ width: "100%", background: cart.length === 0 ? colors.surfaceContainer : colors.primaryContainer, color: cart.length === 0 ? colors.onSurfaceVariant : colors.onPrimaryContainer, padding: "1.25rem", borderRadius: "1rem", fontWeight: 700, fontSize: "1.125rem", border: "none", cursor: cart.length === 0 ? "not-allowed" : "pointer", boxShadow: cart.length === 0 ? "none" : `0 8px 20px ${colors.primaryContainer}33`, transition: "transform 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}
                onMouseEnter={(e) => { if (cart.length > 0) e.currentTarget.style.transform = "scale(1.02)" }}
                onMouseLeave={(e) => { if (cart.length > 0) e.currentTarget.style.transform = "scale(1)" }}>
                <Heart size={20} fill="currentColor" />
                Complete Donation
              </button>
              <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", color: colors.onSurfaceVariant, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", opacity: 0.6 }}>
                <Shield size={16} />
                <span>Secure Philanthropic Transfer</span>
              </div>
            </div>

            <p style={{ textAlign: "center", fontSize: "0.875rem", color: colors.onSurfaceVariant, lineHeight: 1.6, padding: "0 1rem" }}>
              Your contribution is tax-deductible under Philippine Law. A digital BIR receipt will be sent to your registered email immediately.
            </p>
          </aside>
        </div>
      </div>
    </SharedLayout>
  );
}
