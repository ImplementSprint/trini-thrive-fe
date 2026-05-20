"use client";

import React, { useState, useCallback } from "react";
import { useCart } from "../contexts/CartContext";
import {
  GraduationCap,
  Star,
  Info,
  ArrowRight,
  X,
} from "lucide-react";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  primary:                "#97453e",
  primaryContainer:       "#f28d83",
  primaryFixed:           "#ffdad6",
  primaryFixedDim:        "#ffb4ab",
  onPrimary:              "#ffffff",
  onPrimaryContainer:     "#6e2621",
  onPrimaryFixedVariant:  "#792e29",
  secondary:              "#a8372c",
  tertiaryContainer:      "#cda336",
  surface:                "#fcf9f8",
  surfaceContainer:       "#f0edec",
  surfaceContainerLow:    "#f6f3f2",
  surfaceContainerHigh:   "#eae7e7",
  surfaceContainerHighest:"#e5e2e1",
  surfaceContainerLowest: "#ffffff",
  onSurface:              "#1b1c1b",
  onSurfaceVariant:       "#554240",
  outline:                "#877270",
  outlineVariant:         "#dac1be",
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────────
interface AmountCardProps {
  amount: string;
  pts: number;
  selected?: boolean;
  onClick: () => void;
}

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    title: string;
    description: string;
    category: string;
    imageSrc: string;
  };
}

// ─── Sub-Components ────────────────────────────────────────────────────────────

const AmountCard = React.memo<AmountCardProps>(({ amount, pts, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "1rem",
      borderRadius: "1rem",
      background: selected ? C.primaryFixed : C.surfaceContainer,
      border: `2px solid ${selected ? C.primaryContainer : "transparent"}`,
      boxShadow: selected ? `0 0 0 2px ${C.primaryContainer}33` : "none",
      textAlign: "center",
      cursor: "pointer",
      transition: "border-color 0.15s, background 0.15s",
    }}
    onMouseEnter={(e) => {
      if (!selected) e.currentTarget.style.borderColor = C.primaryContainer;
    }}
    onMouseLeave={(e) => {
      if (!selected) e.currentTarget.style.borderColor = "transparent";
    }}
  >
    <div
      style={{
        fontSize: "1.125rem",
        fontWeight: 700,
        color: selected ? C.onPrimaryContainer : C.onSurface,
        fontFamily: "Manrope, sans-serif",
      }}
    >
      {amount}
    </div>
    <div
      style={{
        fontSize: "0.75rem",
        fontWeight: 600,
        color: selected ? C.onPrimaryFixedVariant : C.tertiaryContainer,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.25rem",
        marginTop: "0.25rem",
        fontFamily: "Manrope, sans-serif",
      }}
    >
      <Star size={12} fill="currentColor" /> {pts} PTS
    </div>
  </button>
));
AmountCard.displayName = "AmountCard";

// ─── Amount Data ───────────────────────────────────────────────────────────────
const AMOUNTS: { amount: string; pts: number }[] = [
  { amount: "₱50",    pts: 5   },
  { amount: "₱100",   pts: 10  },
  { amount: "₱250",   pts: 25  },
  { amount: "₱500",   pts: 50  },
  { amount: "₱750",   pts: 75  },
  { amount: "₱1,000", pts: 100 },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function DonationModal({ isOpen, onClose, campaign }: DonationModalProps) {
  const { addToCart } = useCart();
  const [selectedIndex, setSelectedIndex] = useState<number>(3); // ₱500 selected by default
  const [customAmount, setCustomAmount]   = useState<string>("");
  const [customAmountError, setCustomAmountError] = useState<string>("");

  const handleSelect = useCallback((i: number) => {
    setCustomAmountError("");
    setSelectedIndex(i);
    setCustomAmount("");
  }, []);

  const handleAddToCart = useCallback(() => {
    let amount = 0;

    if (customAmount) {
      const parsed = parseFloat(customAmount);
      if (parsed < 50) {
        setCustomAmountError("Minimum donation amount is ₱50.");
        return;
      }
      amount = parsed;
    } else if (selectedIndex >= 0 && selectedIndex < AMOUNTS.length) {
      amount = parseFloat(AMOUNTS[selectedIndex].amount.replace(/[₱,]/g, ''));
    }

    setCustomAmountError("");
    if (amount > 0) {
      addToCart({
        campaign_id: campaign.id,
        title: campaign.title,
        price: amount,
        imageSrc: campaign.imageSrc,
        imageAlt: campaign.description,
        category: campaign.category,
      })
      .then(() => {
        onClose();
      })
      .catch((err: any) => {
        alert(err.message || 'Failed to add to cart');
      });
    }
  }, [addToCart, campaign, customAmount, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "rgba(28,21,21,0.4)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "56rem",
          background: C.surfaceContainerLowest,
          borderRadius: "1rem",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          overflow: "hidden",
          display: "flex",
          flexWrap: "wrap",
          position: "relative",
        }}
      >
        {/* ── Left: Campaign Visual ────────────────────────────────────── */}
        <div style={{ flex: "0 0 41.666%", minWidth: "260px", position: "relative", minHeight: "300px" }}>
          <img
            src={campaign.imageSrc || 'https://placehold.co/400x300?text=Campaign'}
            alt={campaign.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Gradient overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />
          {/* Text overlay */}
          <div style={{ position: "absolute", bottom: 0, left: 0, padding: "2rem", color: "#ffffff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <GraduationCap size={18} style={{ color: C.primaryContainer }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>{campaign.category}</span>
            </div>
            <h2 style={{ fontSize: "1.875rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "0.5rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{campaign.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", lineHeight: 1.6, maxWidth: "18rem", margin: 0 }}>
              {campaign.description}
            </p>
          </div>
        </div>

        {/* ── Right: Donation Form ─────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: "260px", padding: "3rem", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
            <div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: C.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif", margin: "0 0 0.25rem" }}>Choose Amount</h3>
              <p style={{ color: C.onSurfaceVariant, fontSize: "0.875rem", margin: 0 }}>Select a contribution level to start making an impact.</p>
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.outline, display: "flex", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.onSurface)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.outline)}
            >
              <X size={22} />
            </button>
          </div>

          {/* Amount Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
            {AMOUNTS.map((a, i) => (
              <AmountCard
                key={a.amount}
                amount={a.amount}
                pts={a.pts}
                selected={selectedIndex === i}
                onClick={() => handleSelect(i)}
              />
            ))}
          </div>

          {/* Custom Amount */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: C.onSurfaceVariant, marginBottom: "0.5rem", fontFamily: "Manrope, sans-serif" }}>
              Enter custom amount
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: C.onSurface, fontWeight: 700 }}>₱</span>
              <input
                type="number"
                placeholder="0.00"
                min={50}
                value={customAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCustomAmount(e.target.value);
                  setSelectedIndex(-1);
                  setCustomAmountError("");
                }}
                style={{
                  width: "100%",
                  background: C.surfaceContainerHighest,
                  border: customAmountError ? `1.5px solid ${C.primary}` : "none",
                  borderRadius: "0.75rem",
                  padding: "1rem 1rem 1rem 2.5rem",
                  outline: "none",
                  color: C.onSurface,
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  fontFamily: "Manrope, sans-serif",
                }}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${C.primaryContainer}80`; }}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            {customAmountError && (
              <p style={{ marginTop: "0.4rem", fontSize: "0.8rem", color: C.primary, fontFamily: "Manrope, sans-serif", fontWeight: 600 }}>
                {customAmountError}
              </p>
            )}
          </div>

          {/* Compliance Note */}
          <div style={{ background: C.surfaceContainerLow, borderRadius: "1rem", padding: "1.25rem", marginBottom: "2.5rem", display: "flex", gap: "0.75rem" }}>
            <Info size={20} fill="currentColor" style={{ color: C.primary, flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: C.onSurface, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.25rem", fontFamily: "Manrope, sans-serif" }}>Annual Contribution Limit</p>
              <p style={{ fontSize: "0.75rem", color: C.onSurfaceVariant, lineHeight: 1.6, margin: 0, fontFamily: "Manrope, sans-serif" }}>
                Your contributions are subject to individual limits as per the TRAIN Law disclosure guidelines. Impact points are credited upon verified transaction completion.
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleAddToCart}
            style={{
              width: "100%",
              background: C.primaryContainer,
              color: C.onPrimaryContainer,
              fontWeight: 700,
              padding: "1.25rem",
              borderRadius: "1rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: `0 8px 24px ${C.primaryContainer}33`,
              transition: "background 0.15s, transform 0.1s",
              fontFamily: "Manrope, sans-serif",
              fontSize: "1rem",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.color = "#ffffff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.primaryContainer; e.currentTarget.style.color = C.onPrimaryContainer; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <span>Add to Cart</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
