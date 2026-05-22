"use client";

import React, { useState } from "react";
import SharedLayout from "@/donor-components/SharedLayout";
import DonationModal from "@/donor-components/DonationModal";
import ShareModal, { ShareCampaign } from "@/donor-components/ShareModal";
import { Share2 } from "lucide-react";
import { useCampaigns } from "@/donor-hooks/useCampaigns";

// Design Tokens
const colors = {
  primary: "#97453e",
  primaryContainer: "#f28d83",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6e2621",
  secondary: "#a8372c",
  secondaryContainer: "#ff7766",
  tertiary: "#775a00",
  surface: "#fcf9f8",
  surfaceContainer: "#f0edec",
  surfaceContainerLow: "#f6f3f2",
  surfaceContainerHigh: "#eae7e7",
  surfaceContainerHighest: "#e5e2e1",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#1b1c1b",
  onSurfaceVariant: "#554240",
  outlineVariant: "#dac1be",
} as const;

const FILTER_CATEGORIES = ["All", "Education", "Health", "Environment", "Disaster Relief"] as const;

interface ModalCampaign {
  id: string;
  title: string;
  description: string;
  category: string;
  imageSrc: string;
}

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedCampaign, setSelectedCampaign] = useState<ModalCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShareCampaign, setSelectedShareCampaign] = useState<ShareCampaign | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleShareClick = (campaign: ShareCampaign) => {
    setSelectedShareCampaign(campaign);
    setShareModalOpen(true);
  };

  const categoryParam =
    activeCategory === "All" ? undefined :
    activeCategory === "Disaster Relief" ? "disaster" :
    activeCategory.toLowerCase();
  const { campaigns, loading, error } = useCampaigns(categoryParam);

  const handleCampaignClick = (campaign: ModalCampaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  return (
    <SharedLayout currentPage="explore">
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "2rem 3rem 4rem" }}>
        {/* Header */}
        <header style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 800, color: colors.primary, marginBottom: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>
            Explore Campaigns
          </h1>
          <p style={{ color: colors.onSurfaceVariant, fontSize: "1.125rem", lineHeight: 1.6, maxWidth: "800px" }}>
            Discover meaningful causes and make a lasting impact. Every contribution brings hope to communities in need.
          </p>
        </header>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem", flexWrap: "wrap" }}>
          {FILTER_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "all 0.2s",
                background: activeCategory === category ? colors.primaryContainer : colors.surfaceContainerLow,
                color: activeCategory === category ? colors.onPrimaryContainer : colors.onSurfaceVariant,
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== category) {
                  e.currentTarget.style.background = colors.surfaceContainer;
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== category) {
                  e.currentTarget.style.background = colors.surfaceContainerLow;
                }
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Campaigns Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2rem" }}>
          {loading && (
            <p style={{ color: colors.onSurfaceVariant, gridColumn: "1/-1" }}>Loading campaigns...</p>
          )}
          {error && (
            <p style={{ color: colors.secondary, gridColumn: "1/-1" }}>Could not load campaigns.</p>
          )}
          {!loading && campaigns.map((c) => (
            <div
              key={c.id}
              onClick={() => handleCampaignClick({ id: c.id, title: c.title, description: c.description, category: c.category, imageSrc: c.cover_image_url ?? '' })}
              style={{
                background: colors.surfaceContainerLowest,
                borderRadius: "1.5rem",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(151,69,62,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
              }}
            >
              {/* Image */}
              <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
                <img
                  src={c.cover_image_url ?? 'https://placehold.co/400x300?text=Campaign'}
                  alt={c.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", top: "1rem", left: "1rem" }}>
                  <span style={{
                    background: colors.surfaceContainerLowest,
                    padding: "0.375rem 0.875rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontFamily: "Manrope, sans-serif",
                    color: colors.onSurface,
                  }}>
                    {c.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: colors.onSurface, marginBottom: "0.75rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.2 }}>
                  {c.title}
                </h3>
                <p style={{ color: colors.onSurfaceVariant, fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {c.description}
                </p>

                {/* Progress */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ height: "0.5rem", width: "100%", background: colors.surfaceContainerHigh, borderRadius: "999px", overflow: "hidden", marginBottom: "0.75rem" }}>
                    <div style={{ height: "100%", width: `${c.progress_pct}%`, background: `linear-gradient(to right, ${colors.primary}, ${colors.secondaryContainer})`, borderRadius: "999px" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      {`₱${c.collected_amount.toLocaleString()}`}{" "}
                      <span style={{ fontSize: "0.875rem", fontWeight: 400, color: colors.onSurfaceVariant }}>
                        raised of ₱{c.target_amount.toLocaleString()}
                      </span>
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <button
                        aria-label="Share campaign"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareClick({ id: c.id, title: c.title, category: c.category, cover_image_url: c.cover_image_url ?? '' });
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: colors.onSurfaceVariant,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = colors.onSurfaceVariant)}
                      >
                        <Share2 size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCampaignClick({ id: c.id, title: c.title, description: c.description, category: c.category, imageSrc: c.cover_image_url ?? '' });
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: colors.primary,
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          cursor: "pointer",
                          textDecoration: "underline",
                          textDecorationColor: colors.primaryContainer,
                          textUnderlineOffset: "4px",
                        }}
                      >
                        Support
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!loading && campaigns.length === 0 && !error && (
            <p style={{ color: colors.onSurfaceVariant, gridColumn: "1/-1" }}>No campaigns found.</p>
          )}
        </div>
      </div>

      {/* Donation Modal */}
      {selectedCampaign && (
        <DonationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          campaign={{
            id: selectedCampaign.id,
            title: selectedCampaign.title,
            description: selectedCampaign.description,
            category: selectedCampaign.category,
            imageSrc: selectedCampaign.imageSrc,
          }}
        />
      )}
      {selectedShareCampaign && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => { setShareModalOpen(false); setSelectedShareCampaign(null); }}
          campaign={selectedShareCampaign}
        />
      )}
    </SharedLayout>
  );
}
