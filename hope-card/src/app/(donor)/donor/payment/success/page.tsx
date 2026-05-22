"use client";

import React, { Suspense, useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SharedLayout from "@/donor-components/SharedLayout";
import { Download, Share2, Sparkles, Heart, Home } from "lucide-react";
import { useCart } from "@/donor-contexts/CartContext";
import { useProfile } from "@/donor-hooks/useProfile";
import ShareModal from "@/donor-components/ShareModal";

// Design Tokens
const colors = {
  primary: "#97453e",
  primaryContainer: "#f28d83",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6e2621",
  primaryFixed: "#ffdad6",
  secondary: "#a8372c",
  secondaryContainer: "#ff7766",
  onSecondary: "#ffffff",
  onSecondaryContainer: "#710d09",
  tertiary: "#775a00",
  tertiaryContainer: "#cda336",
  tertiaryFixed: "#ffedb8",
  onTertiary: "#ffffff",
  onTertiaryFixed: "#3f2e00",
  surface: "#fcf9f8",
  surfaceContainer: "#f0edec",
  surfaceContainerLow: "#f6f3f2",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerHigh: "#eae7e7",
  onSurface: "#1b1c1b",
  onSurfaceVariant: "#554240",
  outline: "#877270",
  outlineVariant: "#dac1be",
} as const;

const FALLBACK_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuB4F4ziaG0nqvRN4iqeFgPi3jU3IArnD6AwPZ_AsYXtgIFov6ojCwFJ1BMEbGSJL16Ga_986o0GhyN9lOXKWU5jGuKf9s8DEb8NuSgbsfFgr0rCpEkhsy-xq1uizloHBcU293QQcm60A9e4tV5VvXEhqP4YmFl1-k2WXhtkoB_YFbigY8-wXEeKJh7BuEUk4q0rqNWYQYujdrfll0AELYEpVVztJlxjx8uSsCRUnA56cor3w5hsKZIvUueVAutpFCTWqea7nFJ_HE6M";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const { profile } = useProfile();

  const referenceId = searchParams.get('ref') ?? '';
  const buyerAuthId = searchParams.get('buyerAuthId') ?? '';

  const [confirming, setConfirming] = useState(true);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Order snapshot saved before redirecting to PayMongo
  const { cart, cartTotal, processingFee, apiTotal } = React.useMemo(() => {
    try {
      const saved = sessionStorage.getItem('lastOrder');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { cart: [], cartTotal: 0, processingFee: 0, apiTotal: 0 };
  }, []);

  useEffect(() => {
    if (!referenceId || !buyerAuthId) {
      setConfirmError('Missing payment reference. Please contact support.');
      setConfirming(false);
      return;
    }
    const token = localStorage.getItem('donor_token') ?? '';
    fetch(`${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/hopecard/donor/purchases/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ referenceId, buyerAuthId }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data?.message ?? data?.error ?? 'Payment confirmation failed');
        clearCart();
        sessionStorage.removeItem('lastOrder');
      })
      .catch((err) => setConfirmError(err.message))
      .finally(() => setConfirming(false));
  }, [referenceId, buyerAuthId, clearCart]);

  const donorName = profile?.first_name || "Friend";
  const total = apiTotal > 0 ? apiTotal : cartTotal;
  const causes = cart.length > 0 ? cart.map((i: any) => i.title).join(" & ") : "Your selected campaigns";
  const impactImageSrc = cart[0]?.imageSrc || FALLBACK_IMAGE;

  const [date, setDate] = useState<string>("");

  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-PH", {
      year: "numeric", month: "long", day: "numeric",
    }));
  }, []);

  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleDownload = useCallback(() => console.log("Download e-receipt"), []);
  const handleShare = useCallback(() => setShareModalOpen(true), []);
  const handleBackToHome = useCallback(() => router.push('/donor/home'), [router]);

  const detailFields = [
    { label: "Cause Supported", value: causes, large: false },
    { label: "Amount", value: `₱${total.toLocaleString()}`, large: true },
    { label: "Transaction ID", value: referenceId ? `#${referenceId}` : "—", large: false },
    { label: "Date", value: date, large: false },
  ];

  if (confirming) {
    return (
      <SharedLayout>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem" }}>
          <Heart size={48} color={colors.primaryContainer} fill={colors.primaryContainer} style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
          <p style={{ fontSize: "1.25rem", fontWeight: 700, color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif" }}>Confirming your donation…</p>
          <p style={{ color: colors.onSurfaceVariant }}>Please wait while we verify your payment.</p>
        </div>
      </SharedLayout>
    );
  }

  if (confirmError) {
    return (
      <SharedLayout>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem", textAlign: "center" }}>
          <p style={{ fontSize: "1.25rem", fontWeight: 700, color: colors.secondary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>Payment Confirmation Failed</p>
          <p style={{ color: colors.onSurfaceVariant, maxWidth: "480px" }}>{confirmError}</p>
          <button onClick={() => router.push('/donor/basket')} style={{ marginTop: "1rem", padding: "0.75rem 2rem", background: colors.primaryContainer, color: colors.onPrimaryContainer, borderRadius: "0.75rem", border: "none", fontWeight: 700, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Return to Basket
          </button>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "2rem 3rem" }}>
        {/* Success Header */}
        <section style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "6rem", height: "6rem", marginBottom: "2rem" }}>
            <div style={{
              position: "absolute",
              inset: 0,
              background: `${colors.primaryContainer}33`,
              transform: "scale(1.25) rotate(-12deg) translateX(0.5rem)",
              borderRadius: "43% 57% 72% 28% / 30% 43% 57% 70%",
            }} />
            <div style={{
              position: "absolute",
              inset: 0,
              background: `${colors.tertiaryFixed}4D`,
              transform: "scale(1.1) rotate(45deg) translateY(-0.5rem)",
              borderRadius: "43% 57% 72% 28% / 30% 43% 57% 70%",
            }} />
            <div style={{
              position: "relative",
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryContainer})`,
              width: "6rem",
              height: "6rem",
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(151,69,62,0.25)",
            }}>
              <Heart size={48} fill={colors.surface} color={colors.surface} />
            </div>
          </div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "3.5rem", fontWeight: 800, color: colors.primary, marginBottom: "1rem", lineHeight: 1 }}>
            Donation Successful!
          </h1>
          <p style={{ fontSize: "1.25rem", color: colors.onSurfaceVariant, fontWeight: 500, maxWidth: "800px", margin: "0 auto", lineHeight: 1.6 }}>
            Thank you for your generosity,{" "}
            <span style={{ fontWeight: 700, color: colors.primary }}>{donorName}</span>. Your contribution fuels stories that matter.
          </p>
        </section>

        {/* Content grid */}
        <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: "2rem", alignItems: "start" }}>
          {/* Transaction Details Card */}
          <div style={{
            background: colors.surfaceContainerLowest,
            borderRadius: "1rem",
            padding: "2.5rem",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(27,28,27,0.06)",
          }}>
            {/* Decorative blur */}
            <div style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "8rem",
              height: "8rem",
              background: `${colors.tertiaryContainer}1A`,
              filter: "blur(60px)",
              borderRadius: "999px",
              transform: "translate(50%, -50%)",
            }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", paddingBottom: "1.5rem", borderBottom: `1px solid ${colors.outlineVariant}1A` }}>
              <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.5rem", fontWeight: 700, color: colors.onSurface, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: "0.375rem", height: "1.5rem", background: colors.secondaryContainer, borderRadius: "999px" }} />
                Transaction Details
              </h2>
              <span style={{ padding: "0.375rem 1rem", background: `${colors.secondaryContainer}33`, color: colors.secondary, fontWeight: 700, fontSize: "0.875rem", borderRadius: "999px", fontFamily: "Manrope, sans-serif" }}>
                Completed
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem 3rem" }}>
              {detailFields.map((field) => (
                <div key={field.label} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: `${colors.onSurfaceVariant}99`, fontFamily: "Manrope, sans-serif" }}>
                    {field.label}
                  </p>
                  {field.large ? (
                    <p style={{ fontSize: "2rem", fontWeight: 800, color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{field.value}</p>
                  ) : field.label === "Cause Supported" ? (
                    <p style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.primary, lineHeight: 1.4, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{field.value}</p>
                  ) : (
                    <p style={{ fontSize: "1.125rem", fontWeight: 600, color: colors.onSurface }}>{field.value}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Individual campaign breakdown if multiple items */}
            {cart.length > 1 && (
              <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: `1px solid ${colors.outlineVariant}1A`, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: `${colors.onSurfaceVariant}99`, fontFamily: "Manrope, sans-serif" }}>
                  Breakdown
                </p>
                {(cart as Array<{ id: string; title: string; quantity: number; price: number }>).map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.875rem", color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      {String(item.quantity).padStart(2, "0")}× {item.title}
                    </span>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      ₱{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                {processingFee > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: `1px solid ${colors.outlineVariant}1A` }}>
                    <span style={{ fontSize: "0.875rem", color: colors.onSurfaceVariant }}>Processing Fee</span>
                    <span style={{ fontSize: "0.875rem", color: colors.onSurfaceVariant }}>₱{processingFee.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* CTA buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "4rem", paddingTop: "2.5rem", borderTop: `1px solid ${colors.outlineVariant}1A` }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={handleDownload}
                  style={{
                    flex: 1,
                    background: colors.primaryContainer,
                    color: colors.onPrimaryContainer,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 700,
                    padding: "1.25rem",
                    borderRadius: "1rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(151,69,62,0.15)",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "scale(0.98)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <Download size={20} /> Download E-Receipt
                </button>
                <button
                  onClick={handleShare}
                  disabled={cart.length === 0}
                  style={{
                    flex: 1,
                    background: cart.length === 0 ? `${colors.secondary}0D` : `${colors.secondary}1A`,
                    color: cart.length === 0 ? `${colors.secondary}66` : colors.secondary,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 700,
                    padding: "1.25rem",
                    borderRadius: "1rem",
                    border: "none",
                    cursor: cart.length === 0 ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                  }}
                  onMouseEnter={(e) => { if (cart.length > 0) e.currentTarget.style.background = `${colors.secondary}33`; }}
                  onMouseLeave={(e) => { if (cart.length > 0) e.currentTarget.style.background = `${colors.secondary}1A`; }}
                >
                  <Share2 size={20} /> Share Your Impact
                </button>
              </div>
              <button
                onClick={handleBackToHome}
                style={{
                  width: "100%",
                  background: colors.primary,
                  color: colors.onPrimary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  padding: "1.25rem",
                  borderRadius: "1rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(151,69,62,0.2)",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <Home size={20} /> Back to Home
              </button>
            </div>
          </div>

          {/* Impact Visual */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "1rem",
              background: colors.surfaceContainerLow,
              aspectRatio: "4/5",
              boxShadow: "0 12px 40px rgba(27,28,27,0.06)",
            }}>
              <img
                src={impactImageSrc}
                alt={cart[0]?.title ?? "Impact visualization"}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.7s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(252,249,248,0.8), transparent)",
              }} />
              <div style={{ position: "absolute", bottom: "0.75rem", left: "1rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: colors.primary, background: `${colors.primaryFixed}80`, padding: "0.375rem 0.75rem", borderRadius: "999px", backdropFilter: "blur(8px)" }}>
                  Direct Impact
                </span>
              </div>
              <div style={{ position: "absolute", bottom: "4rem", left: 0, right: 0, padding: "2rem" }}>
                <div style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", padding: "2rem", borderRadius: "0.75rem", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                  <span style={{ fontSize: "1.5rem", color: colors.primary, marginBottom: "1rem", display: "block" }}>❝</span>
                  <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.125rem", fontWeight: 700, color: colors.onSurface, fontStyle: "italic", lineHeight: 1.5 }}>
                    {cart[0]
                      ? `"Your donation to ${cart[0].title} makes a real difference."`
                      : '"This donation will provide essential support for those in need."'}
                  </p>
                </div>
              </div>
            </div>

            {/* Milestone banner */}
            <div style={{ background: colors.surfaceContainerHigh, borderRadius: "1rem", padding: "2rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{
                background: colors.tertiaryFixed,
                color: colors.onTertiaryFixed,
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <Sparkles size={24} fill="currentColor" />
              </div>
              <div>
                <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, color: colors.onSurface, marginBottom: "0.25rem" }}>Impact Milestone Reached</p>
                <p style={{ fontSize: "0.875rem", color: colors.onSurfaceVariant }}>
                  {cart.length > 0
                    ? `You've just supported ${cart.length} cause${cart.length > 1 ? "s" : ""} with a total of ₱${cartTotal.toLocaleString()}.`
                    : "Your generosity creates ripples of change across communities."}
                </p>
              </div>
            </div>
          </div>
        </div>
        {cart.length > 0 && (
          <ShareModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            campaign={{
              id: cart[0].campaign_id,
              title: cart[0].title,
              category: cart[0].category ?? "Campaign",
              cover_image_url: cart[0].imageSrc,
            }}
          />
        )}
      </div>
    </SharedLayout>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}
