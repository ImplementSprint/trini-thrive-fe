"use client";

import React, { useState, useCallback } from "react";
import SharedLayout from "@/donor-components/SharedLayout";
import DonationModal from "@/donor-components/DonationModal";
import ShareModal, { ShareCampaign } from "@/donor-components/ShareModal";
import { Share2 } from "lucide-react";
import { useCampaigns } from "@/donor-hooks/useCampaigns";

// Design Tokens
const C = {
  primary: "#97453e",
  primaryContainer: "#f28d83",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6e2621",
  secondary: "#a8372c",
  secondaryContainer: "#ff7766",
  onSecondaryContainer: "#710d09",
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

interface CampaignCardProps {
  imageSrc: string;
  imageAlt: string;
  category: string;
  title: string;
  description: string;
  raised: string;
  targetAmount?: string;
  progressPct: number;
  onShare?: () => void;
}

const CampaignCard = React.memo<CampaignCardProps>(
  ({ imageSrc, imageAlt, category, title, description, raised, targetAmount, progressPct, onShare }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem", cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div
          style={{
            aspectRatio: "4/3",
            borderRadius: "1rem",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.7s",
              transform: hovered ? "scale(1.1)" : "scale(1)",
            }}
          />
          <div style={{ position: "absolute", top: "1rem", left: "1rem" }}>
            <span
              style={{
                background: "rgba(252,249,248,0.9)",
                backdropFilter: "blur(8px)",
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.625rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "Manrope, sans-serif",
              }}
            >
              {category}
            </span>
          </div>
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h3
            style={{
              fontSize: "1.5rem",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              color: hovered ? C.primary : C.onSurface,
              transition: "color 0.15s",
              margin: 0,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              color: C.onSurfaceVariant,
              fontSize: "0.875rem",
              lineHeight: 1.5,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div
            style={{
              width: "100%",
              height: "6px",
              background: C.surfaceContainerHigh,
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: C.primary,
                borderRadius: "999px",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              {raised}{" "}
              <span style={{ color: "#a8a29e", fontWeight: 400 }}>
                raised{targetAmount ? ` of ${targetAmount}` : ""}
              </span>
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {onShare && (
                <button
                  aria-label="Share campaign"
                  onClick={(e) => { e.stopPropagation(); onShare(); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#a8a29e", display: "flex", alignItems: "center",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#a8a29e")}
                >
                  <Share2 size={15} />
                </button>
              )}
              <a
                href="#"
                style={{
                  color: C.primary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  borderBottom: "2px solid transparent",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderBottomColor = C.primary)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderBottomColor = "transparent")
                }
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
CampaignCard.displayName = "CampaignCard";

const FILTER_PILLS = ["All", "Education", "Health", "Environment", "Disaster Relief"] as const;

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedCampaign, setSelectedCampaign] = useState<(CampaignCardProps & { id: string }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShareCampaign, setSelectedShareCampaign] = useState<ShareCampaign | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const categoryParam =
    activeFilter === "All" ? undefined :
    activeFilter === "Disaster Relief" ? "disaster" :
    activeFilter.toLowerCase();
  const { campaigns, loading, error } = useCampaigns(categoryParam);
  const featured = campaigns[0] ?? null;

  const handleCampaignClick = (campaign: CampaignCardProps & { id: string }) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  return (
    <SharedLayout currentPage="home">
      <main style={{ paddingBottom: "4rem" }}>
        {/* Hero Section */}
        <section
          style={{
            padding: "4rem 3rem 6rem",
            maxWidth: "80rem",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "4rem",
          }}
        >
          {/* Left copy */}
          <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "2rem" }}>
            <h1
              style={{
                fontSize: "clamp(3.5rem, 8vw, 5rem)",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 800,
                letterSpacing: "-0.05em",
                lineHeight: 0.9,
                color: C.onSurface,
                margin: 0,
              }}
            >
              fund{" "}
              <em
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontStyle: "italic",
                  fontWeight: 700,
                  color: C.primary,
                }}
              >
                stories
              </em>
              <br />
              that{" "}
              <em
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontStyle: "italic",
                  fontWeight: 700,
                  color: C.primary,
                }}
              >
                matter
              </em>
            </h1>

            <p
              style={{
                fontSize: "1.25rem",
                color: C.onSurfaceVariant,
                maxWidth: "32rem",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Fuel verified local initiatives and start your journey of compassion today. Every contribution is a heartbeat for change.
            </p>

            <div style={{ display: "flex", gap: "1rem", paddingTop: "1rem" }}>
              <button
                style={{
                  padding: "1rem 2rem",
                  background: C.primaryContainer,
                  color: C.onPrimaryContainer,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  borderRadius: "1rem",
                  border: "none",
                  cursor: "pointer",
                  transition: "transform 0.15s",
                  fontSize: "1rem",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Start Impact
              </button>
              <button
                style={{
                  padding: "1rem 2rem",
                  background: `${C.secondary}1a`,
                  color: C.secondary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  borderRadius: "1rem",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  fontSize: "1rem",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${C.secondary}33`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = `${C.secondary}1a`)}
              >
                Our Vision
              </button>
            </div>
          </div>

          {/* Right image */}
          <div style={{ flex: 1, minWidth: "280px", position: "relative" }}>
            <div
              style={{
                width: "100%",
                aspectRatio: "4/5",
                borderRadius: "1rem",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI1BfmwHQwGAVxcZjih0sg322rLeYPde2axayCKDOuwipve2lvQQrTD_abyc3Y8bJPT7zqcHSPQCE9fHChfA7a4WCwPY58BLMy325QtSWCxtvT3UGuChj9SfT_px6u2gc5GhNRwToq-EZWJS5Y0e41ZEvWCIxzfwFuEZPMWPLT1B89SRltTyjH4CVa-sfDNtE8BBPFq3v_giNna9An1awL46hfnArFl0sTekViKoV-JyBbCP0Z-T3morcZSi65OtjhvzkP-Vf1DKFF"
                alt="Heartwarming close-up of hands joining together in a community setting"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(to top, ${C.surface} 0%, transparent 40%)`,
                  opacity: 0.4,
                }}
              />
            </div>

            {/* Floating stat card */}
            <div
              style={{
                position: "absolute",
                bottom: "-2rem",
                left: "-3rem",
                background: C.surfaceContainerLowest,
                padding: "2rem",
                borderRadius: "1rem",
                boxShadow: "0 25px 50px rgba(27,28,27,0.05)",
              }}
            >
              <p
                style={{
                  color: C.tertiary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.875rem",
                  margin: "0 0 0.25rem",
                }}
              >
                12k+
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#78716c",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  margin: 0,
                }}
              >
                Lives Touched Globally
              </p>
            </div>
          </div>
        </section>

        {/* Discovery Filter Chips */}
        <section style={{ padding: "0 3rem 3rem", overflowX: "auto" }}>
          <div
            style={{
              maxWidth: "80rem",
              margin: "0 auto",
              display: "flex",
              gap: "0.75rem",
              paddingBottom: "1rem",
            }}
          >
            {FILTER_PILLS.map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                style={{
                  padding: "0.625rem 1.5rem",
                  borderRadius: "999px",
                  background: activeFilter === pill ? "#7f1d1d" : C.surfaceContainerHigh,
                  color: activeFilter === pill ? "#ffffff" : C.onSurfaceVariant,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {pill}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Campaign */}
        {featured && (
        <section style={{ padding: "0 3rem 5rem" }}>
          <div
            style={{
              maxWidth: "80rem",
              margin: "0 auto",
              background: C.surfaceContainerLow,
              borderRadius: "1rem",
              overflow: "hidden",
              display: "flex",
              flexWrap: "wrap",
              border: `1px solid ${C.outlineVariant}1a`,
            }}
          >
            {/* Image */}
            <div style={{ flex: 1, minWidth: "300px", minHeight: "400px" }}>
              <img
                src={featured?.cover_image_url ?? 'https://placehold.co/800x400?text=Campaign'}
                alt={featured?.title ?? ''}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                minWidth: "300px",
                padding: "4rem",
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "0.375rem 1rem",
                  background: "#fff1f2",
                  color: "#7f1d1d",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "Manrope, sans-serif",
                  width: "fit-content",
                }}
              >
                Featured Initiative
              </span>

              <h2
                style={{
                  fontSize: "clamp(1.75rem, 3vw, 3rem)",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  color: C.onSurface,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                {featured?.title ?? ''}
              </h2>

              <p style={{ color: C.onSurfaceVariant, lineHeight: 1.6, margin: 0 }}>
                {featured?.description ?? ''}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  <span style={{ fontSize: "1.5rem", fontWeight: 700, color: C.primary }}>
                    {featured ? `₱${featured.collected_amount.toLocaleString()}` : '₱0'}
                    {featured && (
                      <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#78716c" }}>
                        {" "}of ₱{featured.target_amount.toLocaleString()}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: C.tertiary }}>
                    {featured?.progress_pct ?? 0}% Reached
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "0.75rem",
                    background: C.surfaceContainerHighest,
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${featured?.progress_pct ?? 0}%`,
                      background: `linear-gradient(to right, ${C.primary}, ${C.secondaryContainer})`,
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => featured && handleCampaignClick({
                  id: featured.id,
                  imageSrc: featured.cover_image_url ?? 'https://placehold.co/800x400?text=Campaign',
                  imageAlt: featured.title,
                  category: featured.category,
                  title: featured.title,
                  description: featured.description,
                  raised: `₱${featured.collected_amount.toLocaleString()}`,
                  targetAmount: `₱${featured.target_amount.toLocaleString()}`,
                  progressPct: featured.progress_pct,
                })}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: C.primary,
                  color: "#ffffff",
                  borderRadius: "1rem",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: `0 20px 40px ${C.primary}1a`,
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Donate Now
              </button>
            </div>
          </div>
        </section>
        )}

        {/* Campaign Card Grid */}
        <section style={{ padding: "0 3rem" }}>
          <div
            style={{
              maxWidth: "80rem",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "3rem",
            }}
          >
            {loading && <p style={{ color: C.onSurfaceVariant, gridColumn: "1/-1" }}>Loading campaigns...</p>}
            {error && <p style={{ color: C.secondary, gridColumn: "1/-1" }}>Could not load campaigns.</p>}
            {!loading && campaigns.map((c) => (
              <div key={c.id} onClick={() => handleCampaignClick({
                id: c.id,
                imageSrc: c.cover_image_url ?? 'https://placehold.co/400x300?text=Campaign',
                imageAlt: c.title,
                category: c.category,
                title: c.title,
                description: c.description,
                raised: `₱${c.collected_amount.toLocaleString()}`,
                targetAmount: `₱${c.target_amount.toLocaleString()}`,
                progressPct: c.progress_pct,
              })}>
                <CampaignCard
                  imageSrc={c.cover_image_url ?? 'https://placehold.co/400x300?text=Campaign'}
                  imageAlt={c.title}
                  category={c.category}
                  title={c.title}
                  description={c.description}
                  raised={`₱${c.collected_amount.toLocaleString()}`}
                  targetAmount={`₱${c.target_amount.toLocaleString()}`}
                  progressPct={c.progress_pct}
                  onShare={() => {
                    setSelectedShareCampaign({ id: c.id, title: c.title, category: c.category, cover_image_url: c.cover_image_url ?? '' });
                    setShareModalOpen(true);
                  }}
                />
              </div>
            ))}
            {!loading && campaigns.length === 0 && !error && (
              <p style={{ color: C.onSurfaceVariant, gridColumn: "1/-1" }}>No campaigns found.</p>
            )}
          </div>
        </section>
      </main>

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
