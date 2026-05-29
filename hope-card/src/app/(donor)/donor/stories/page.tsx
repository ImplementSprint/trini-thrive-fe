"use client";

import React from "react";
import Link from "next/link";
import SharedLayout from "@/donor-components/SharedLayout";

const colors = {
  primary: "#97453e",
  primaryContainer: "#f28d83",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6e2621",
  surface: "#fcf9f8",
  surfaceContainerLow: "#f6f3f2",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#1b1c1b",
  onSurfaceVariant: "#554240",
  outlineVariant: "#dac1be",
} as const;

const STORIES = [
  {
    id: "maria-rebuild",
    title: "How Maria Rebuilt Her Life After the Floods",
    category: "Disaster Relief",
    description:
      "Maria lost everything when typhoon rains swept through her barangay. Thanks to your donations, she received emergency housing and livelihood support within 72 hours.",
    image: "https://placehold.co/600x400/f28d83/ffffff?text=Maria%27s+Story",
    readTime: "4 min read",
  },
  {
    id: "school-roof",
    title: "A New Roof for San Isidro Elementary",
    category: "Education",
    description:
      "Over 200 students now study under a safe, weather-proof roof after the community campaign raised the funds needed for a full structural repair.",
    image: "https://placehold.co/600x400/cda336/ffffff?text=School+Story",
    readTime: "3 min read",
  },
  {
    id: "clean-water-palawan",
    title: "Clean Water Reaches 5 Barangays in Palawan",
    category: "Health & Sanitation",
    description:
      "A solar-powered water pump now serves five remote barangays that previously relied on contaminated streams. The impact on child health has been immediate.",
    image: "https://placehold.co/600x400/4a7c9e/ffffff?text=Water+Story",
    readTime: "5 min read",
  },
  {
    id: "livelihood-fishing",
    title: "Fisherfolk Back on the Water With New Equipment",
    category: "Livelihood",
    description:
      "Twelve fishing families lost their boats to a storm surge. Your contributions funded replacement nets and a shared motorised banca, restoring their primary income.",
    image: "https://placehold.co/600x400/97453e/ffffff?text=Fishing+Story",
    readTime: "4 min read",
  },
  {
    id: "scholar-grad",
    title: "First in Her Family to Graduate College",
    category: "Education",
    description:
      "Lena received a scholarship funded entirely through HopeCard donors. She graduated with honours and is now giving back as a teacher in her hometown.",
    image: "https://placehold.co/600x400/775a00/ffffff?text=Scholar+Story",
    readTime: "6 min read",
  },
  {
    id: "senior-care",
    title: "Senior Citizens Get Monthly Medicine Support",
    category: "Health & Welfare",
    description:
      "A recurring campaign now provides 80 seniors in Quezon City with subsidised medicines every month — a dignity they never expected would be restored.",
    image: "https://placehold.co/600x400/554240/ffffff?text=Senior+Story",
    readTime: "3 min read",
  },
];

export default function StoriesPage() {
  return (
    <SharedLayout currentPage="stories">
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "4rem 3rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: 800,
              color: colors.primary,
              fontFamily: "Plus Jakarta Sans, sans-serif",
              letterSpacing: "-0.04em",
              margin: "0 0 0.75rem",
            }}
          >
            Stories
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: colors.onSurfaceVariant,
              fontFamily: "Manrope, sans-serif",
              fontWeight: 500,
              margin: 0,
              maxWidth: "540px",
            }}
          >
            Real accounts of the lives your donations have touched — told by the
            communities themselves.
          </p>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "2rem",
          }}
        >
          {STORIES.map((story) => (
            <Link
              key={story.id}
              href={`/donor/stories/${story.id}`}
              style={{ textDecoration: "none" }}
            >
              <article
                style={{
                  background: colors.surfaceContainerLowest,
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: `1px solid ${colors.outlineVariant}33`,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 12px 32px rgba(151,69,62,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.06)";
                }}
              >
                {/* Cover */}
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "3/2",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={story.image}
                    alt={story.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "1rem",
                      left: "1rem",
                      background: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(8px)",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "999px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: colors.primary,
                      fontFamily: "Manrope, sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {story.category}
                  </span>
                </div>

                {/* Body */}
                <div
                  style={{
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    flex: 1,
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontWeight: 700,
                      fontSize: "1.125rem",
                      color: colors.onSurface,
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {story.title}
                  </h2>
                  <p
                    style={{
                      fontFamily: "Manrope, sans-serif",
                      fontSize: "0.875rem",
                      color: colors.onSurfaceVariant,
                      lineHeight: 1.6,
                      margin: 0,
                      flex: 1,
                    }}
                  >
                    {story.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: "0.75rem",
                      borderTop: `1px solid ${colors.outlineVariant}33`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: colors.onSurfaceVariant,
                        fontFamily: "Manrope, sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {story.readTime}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color: colors.primary,
                        fontFamily: "Manrope, sans-serif",
                      }}
                    >
                      Read story →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </SharedLayout>
  );
}
