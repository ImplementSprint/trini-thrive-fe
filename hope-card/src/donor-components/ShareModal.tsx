"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { X, Copy, Check, Share2 } from "lucide-react";

const C = {
  primary:              "#97453e",
  primaryContainer:     "#f28d83",
  onPrimaryContainer:   "#6e2621",
  surface:              "#fcf9f8",
  surfaceContainerHigh: "#eae7e7",
  surfaceContainerLowest: "#ffffff",
  onSurface:            "#1b1c1b",
  onSurfaceVariant:     "#554240",
  outline:              "#877270",
  outlineVariant:       "#dac1be",
} as const;

export interface ShareCampaign {
  id: string;
  title: string;
  category: string;
  cover_image_url: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: ShareCampaign;
}

export default function ShareModal({ isOpen, onClose, campaign }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const shareUrl = useMemo(
    () => `${process.env.NEXT_PUBLIC_APP_URL}/explore?campaign_id=${campaign.id}&utm_medium=facebook&utm_source=share`,
    [campaign.id]
  );
  const caption = useMemo(
    () => `I'm supporting "${campaign.title}" on Hopecard — a platform connecting donors with verified local causes. Every contribution counts 💙`,
    [campaign.title]
  );

  const copyLinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyCaptionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyToClipboard = useCallback(async (
    text: string,
    setCopied: (v: boolean) => void,
    timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleCopyLink = useCallback(
    () => copyToClipboard(shareUrl, setCopiedLink, copyLinkTimerRef),
    [shareUrl, copyToClipboard]
  );
  const handleCopyCaption = useCallback(
    () => copyToClipboard(caption, setCopiedCaption, copyCaptionTimerRef),
    [caption, copyToClipboard]
  );
  const handleShareFacebook = useCallback(() => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(caption)}`;
    const popup = window.open(fbUrl, "_blank", "width=600,height=500,resizable=yes");
    if (!popup) {
      window.open(fbUrl, "_blank");
    }
  }, [shareUrl, caption]);

  useEffect(() => {
    return () => {
      if (copyLinkTimerRef.current) clearTimeout(copyLinkTimerRef.current);
      if (copyCaptionTimerRef.current) clearTimeout(copyCaptionTimerRef.current);
    };
  }, []);

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
          maxWidth: "52rem",
          background: C.surfaceContainerLowest,
          borderRadius: "1rem",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          overflow: "hidden",
          display: "flex",
          flexWrap: "wrap",
          position: "relative",
        }}
      >
        {/* Left: campaign image */}
        <div style={{ flex: "0 0 41.666%", minWidth: "240px", position: "relative", minHeight: "300px" }}>
          <img
            src={campaign.cover_image_url || "https://placehold.co/400x300?text=Campaign"}
            alt={campaign.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />
          <div style={{ position: "absolute", top: "1rem", left: "1rem" }}>
            <span style={{
              background: "rgba(252,249,248,0.9)",
              backdropFilter: "blur(8px)",
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
              fontSize: "0.625rem",
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
              fontFamily: "Manrope, sans-serif",
            }}>
              {campaign.category}
            </span>
          </div>
          <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", right: "1.5rem" }}>
            <h3 style={{ color: "#ffffff", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.2, margin: 0 }}>
              {campaign.title}
            </h3>
          </div>
        </div>

        {/* Right: share form */}
        <div style={{ flex: 1, minWidth: "260px", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: C.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif", margin: "0 0 0.25rem" }}>
                Share This Campaign
              </h3>
              <p style={{ color: C.onSurfaceVariant, fontSize: "0.875rem", margin: 0 }}>
                Spread the word and help more people discover this cause.
              </p>
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

          {/* Caption */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: C.onSurfaceVariant, marginBottom: "0.5rem", fontFamily: "Manrope, sans-serif" }}>
              Caption
            </label>
            <div style={{ background: C.surfaceContainerHigh, borderRadius: "0.75rem", padding: "1rem" }}>
              <p style={{ fontSize: "0.875rem", color: C.onSurface, lineHeight: 1.6, margin: "0 0 0.75rem", fontFamily: "Manrope, sans-serif" }}>
                {caption}
              </p>
              <button
                onClick={handleCopyCaption}
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  background: "none", border: `1px solid ${C.outlineVariant}`,
                  borderRadius: "0.5rem", padding: "0.375rem 0.75rem",
                  cursor: "pointer", fontSize: "0.75rem", fontWeight: 700,
                  color: copiedCaption ? C.primary : C.onSurfaceVariant,
                  fontFamily: "Manrope, sans-serif", transition: "color 0.15s",
                }}
              >
                {copiedCaption ? <Check size={14} /> : <Copy size={14} />}
                {copiedCaption ? "Copied!" : "Copy Caption"}
              </button>
            </div>
          </div>

          {/* Share link */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: C.onSurfaceVariant, marginBottom: "0.5rem", fontFamily: "Manrope, sans-serif" }}>
              Share Link
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <div style={{
                flex: 1, background: C.surfaceContainerHigh, borderRadius: "0.75rem",
                padding: "0.75rem 1rem", fontSize: "0.75rem", color: C.onSurfaceVariant,
                fontFamily: "Manrope, sans-serif", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
              }}>
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  background: copiedLink ? C.primaryContainer : C.surfaceContainerHigh,
                  border: "none", borderRadius: "0.75rem", padding: "0.75rem 1rem",
                  cursor: "pointer", fontSize: "0.75rem", fontWeight: 700,
                  color: copiedLink ? C.onPrimaryContainer : C.onSurfaceVariant,
                  fontFamily: "Manrope, sans-serif", whiteSpace: "nowrap" as const,
                  transition: "background 0.2s, color 0.2s", flexShrink: 0,
                }}
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                {copiedLink ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>

          {/* Facebook CTA */}
          <button
            onClick={handleShareFacebook}
            style={{
              marginTop: "auto", width: "100%", background: "#1877F2", color: "#ffffff",
              padding: "1rem", borderRadius: "1rem", fontWeight: 700, fontSize: "1rem",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "0.75rem", fontFamily: "Manrope, sans-serif",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Share2 size={18} /> Share on Facebook
          </button>
        </div>
      </div>
    </div>
  );
}
