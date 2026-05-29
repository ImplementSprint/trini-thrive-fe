"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import SharedLayout from "@/donor-components/SharedLayout";
import { ArrowLeft, Clock, Tag } from "lucide-react";

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

interface Story {
  id: string;
  title: string;
  category: string;
  image: string;
  readTime: string;
  date: string;
  body: React.ReactNode;
}

const STORIES: Record<string, Story> = {
  "maria-rebuild": {
    id: "maria-rebuild",
    title: "How Maria Rebuilt Her Life After the Floods",
    category: "Disaster Relief",
    image: "https://placehold.co/1200x500/f28d83/ffffff?text=Maria%27s+Story",
    readTime: "4 min read",
    date: "April 12, 2026",
    body: (
      <>
        <p>
          When the floodwaters rose three meters in less than six hours, Maria Reyes had only minutes
          to grab her two children and flee their home in Barangay San Lorenzo. The single-room
          house they had lived in for eleven years was gone by morning — dissolved into the current
          along with everything they owned.
        </p>
        <p>
          "I didn't know where to go," Maria recalled. "My children were crying, I had nothing.
          I sat on the highway for hours waiting for someone to tell me what to do next."
        </p>
        <p>
          Within 72 hours of the campaign going live on HopeCard, over 4,200 donors had contributed
          enough to fund emergency housing for 18 displaced families — Maria's among them. The funds
          paid for three months of rental assistance, a starter kit of household essentials, and
          livelihood training in food processing for the mothers in the group.
        </p>
        <p>
          Six months later, Maria runs a small kakanin stall near the public market. Her children are
          back in school. The house she rents is small, but it is hers.
        </p>
        <p>
          "I want whoever donated to know: you didn't just give me money. You gave me the chance to
          stand back up," she said.
        </p>
      </>
    ),
  },
  "school-roof": {
    id: "school-roof",
    title: "A New Roof for San Isidro Elementary",
    category: "Education",
    image: "https://placehold.co/1200x500/cda336/ffffff?text=School+Story",
    readTime: "3 min read",
    date: "March 5, 2026",
    body: (
      <>
        <p>
          For three consecutive school years, classes at San Isidro Elementary were suspended
          every time it rained. The aging galvanised iron roof had been patched so many times
          that teachers kept buckets at the front of each classroom as a matter of routine.
        </p>
        <p>
          Principal Celia Marasigan started the campaign not expecting much. "We had tried
          government channels for two years," she admitted. "The roof kept getting bumped
          to next year's budget."
        </p>
        <p>
          The HopeCard campaign reached its ₱280,000 goal in 19 days, funded by 1,100
          individual donors from across the Philippines and the diaspora. Construction took
          three weeks. When the students returned after the break, the classrooms were
          dry, bright, and — for the first time — equipped with proper ceiling insulation
          that kept the rooms cooler during summer.
        </p>
        <p>
          Attendance in the first month after the repair climbed by 14%. "The children
          actually want to come to school now," said Grade 3 teacher Reymart Flores.
          "That is everything."
        </p>
      </>
    ),
  },
  "clean-water-palawan": {
    id: "clean-water-palawan",
    title: "Clean Water Reaches 5 Barangays in Palawan",
    category: "Health & Sanitation",
    image: "https://placehold.co/1200x500/4a7c9e/ffffff?text=Water+Story",
    readTime: "5 min read",
    date: "February 18, 2026",
    body: (
      <>
        <p>
          The five barangays of Sitio Dagat have always been off the grid — no electricity,
          no road wider than a carabao path, and until recently, no clean water. Residents
          walked 40 minutes each way to a spring that was shared with livestock.
        </p>
        <p>
          The campaign for a solar-powered deep well and distribution line was proposed by
          a nurse who had served in the area for two years and watched children suffer
          repeated bouts of waterborne illness.
        </p>
        <p>
          The ₱650,000 raised covered the cost of the deep well drilling, a solar pump
          array, a 10,000-litre holding tank, and a gravity-fed distribution line to
          five communal faucets — one per barangay.
        </p>
        <p>
          Health workers report a 60% drop in diarrhoea cases among children under five
          in the six months since the system went live. The time women spent collecting
          water has been redirected to livelihood activities and childcare.
        </p>
        <p>
          "We used to get sick and just accept it," said Barangay Captain Rodel Magtibay.
          "Now we know it doesn't have to be that way."
        </p>
      </>
    ),
  },
  "livelihood-fishing": {
    id: "livelihood-fishing",
    title: "Fisherfolk Back on the Water With New Equipment",
    category: "Livelihood",
    image: "https://placehold.co/1200x500/97453e/ffffff?text=Fishing+Story",
    readTime: "4 min read",
    date: "January 30, 2026",
    body: (
      <>
        <p>
          Twelve fishing families in Brgy. Pag-asa lost their primary source of income in
          a single night when a sudden storm surge beached and wrecked their small wooden
          bancas. The nets — stored aboard — were destroyed too.
        </p>
        <p>
          Without boats or gear, families had no way to work and no way to buy food.
          Community leader Aling Nena organised the HopeCard campaign from her phone,
          using the barangay's single WiFi hotspot.
        </p>
        <p>
          The campaign raised ₱190,000, enough to fund: four fibreglass motorised bancas
          (more durable than wood), twenty sets of multi-filament nets, and a shared
          storage shed built by the families themselves.
        </p>
        <p>
          Within two weeks of the boats arriving, the fishers were back at sea.
          "The first catch, I cried," said Mang Carding, one of the twelve.
          "Not because of the fish. Because of what it meant."
        </p>
      </>
    ),
  },
  "scholar-grad": {
    id: "scholar-grad",
    title: "First in Her Family to Graduate College",
    category: "Education",
    image: "https://placehold.co/1200x500/775a00/ffffff?text=Scholar+Story",
    readTime: "6 min read",
    date: "December 10, 2025",
    body: (
      <>
        <p>
          Lena Buenaventura is the ninth of eleven children. Her father drives a tricycle;
          her mother sells rice in front of their home in Cavite. When Lena passed the
          UPCAT, the family celebrated — and then fell silent when the financial reality
          set in.
        </p>
        <p>
          The HopeCard Education Access campaign matched Lena with a scholarship pool
          funded by recurring monthly donors. Over four years, 340 donors collectively
          paid for tuition, allowances, and school materials.
        </p>
        <p>
          Lena graduated cum laude with a degree in Elementary Education. She was offered
          a position at a public school in her home municipality, which she accepted
          without hesitation.
        </p>
        <p>
          "I could have taken a private school job with higher pay," she acknowledged.
          "But the kids in public school are me. They need someone who believes in them."
        </p>
        <p>
          She is now in her second year of teaching. Three of her students have announced
          plans to take college entrance exams. She has started mentoring them after class.
        </p>
      </>
    ),
  },
  "senior-care": {
    id: "senior-care",
    title: "Senior Citizens Get Monthly Medicine Support",
    category: "Health & Welfare",
    image: "https://placehold.co/1200x500/554240/ffffff?text=Senior+Story",
    readTime: "3 min read",
    date: "November 22, 2025",
    body: (
      <>
        <p>
          For many of the 80 seniors enrolled in the campaign's programme, the choice
          before HopeCard was simple and brutal: medicine or food. Fixed pensions of
          ₱500 a month do not stretch to cover both.
        </p>
        <p>
          The recurring campaign — the first of its kind on HopeCard — delivers
          pre-packed monthly medicine kits to enrolled seniors through partner community
          health workers. The kits are tailored to each individual's prescription.
        </p>
        <p>
          Since the programme launched, participating seniors have seen a 45% reduction
          in emergency hospital visits linked to unmanaged chronic conditions.
        </p>
        <p>
          "My blood pressure is finally controlled," said 74-year-old Lola Paz.
          "My daughter used to worry every night. Now she sleeps."
        </p>
        <p>
          The campaign is accepting new enrollees. Every ₱250 per month funds one
          senior's medicine kit for a full month.
        </p>
      </>
    ),
  },
};

export default function StoryArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const story = STORIES[id];

  if (!story) {
    return (
      <SharedLayout currentPage="stories">
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            padding: "6rem 3rem",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: "2rem",
              fontWeight: 800,
              color: colors.primary,
              marginBottom: "1rem",
            }}
          >
            Story not found
          </h1>
          <p
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: "Manrope, sans-serif",
              marginBottom: "2rem",
            }}
          >
            This story doesn't exist or may have been removed.
          </p>
          <button
            onClick={() => router.push("/donor/stories")}
            style={{
              background: colors.primaryContainer,
              color: colors.onPrimaryContainer,
              border: "none",
              padding: "0.75rem 2rem",
              borderRadius: "999px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Manrope, sans-serif",
            }}
          >
            Back to Stories
          </button>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout currentPage="stories">
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 3rem 6rem" }}>
        {/* Back */}
        <button
          onClick={() => router.push("/donor/stories")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: colors.onSurfaceVariant,
            fontFamily: "Manrope, sans-serif",
            fontWeight: 600,
            fontSize: "0.875rem",
            padding: "0 0 2rem",
            marginBottom: "0.5rem",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = colors.onSurfaceVariant)}
        >
          <ArrowLeft size={16} /> All Stories
        </button>

        {/* Category + meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              background: `${colors.primaryContainer}22`,
              color: colors.primary,
              padding: "0.25rem 0.875rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 700,
              fontFamily: "Manrope, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <Tag size={12} /> {story.category}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.8125rem",
              color: colors.onSurfaceVariant,
              fontFamily: "Manrope, sans-serif",
            }}
          >
            <Clock size={14} /> {story.readTime}
          </span>
          <span
            style={{
              fontSize: "0.8125rem",
              color: colors.onSurfaceVariant,
              fontFamily: "Manrope, sans-serif",
            }}
          >
            {story.date}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 800,
            color: colors.onSurface,
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            margin: "0 0 2.5rem",
          }}
        >
          {story.title}
        </h1>

        {/* Cover image */}
        <div
          style={{
            borderRadius: "1.25rem",
            overflow: "hidden",
            marginBottom: "3rem",
            aspectRatio: "12/5",
          }}
        >
          <img
            src={story.image}
            alt={story.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Article body */}
        <div
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: "1.0625rem",
            lineHeight: 1.8,
            color: colors.onSurface,
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {story.body}
        </div>

        {/* Footer CTA */}
        <div
          style={{
            marginTop: "4rem",
            padding: "2rem",
            borderRadius: "1.25rem",
            background: `${colors.primaryContainer}18`,
            border: `1px solid ${colors.primaryContainer}44`,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: "1.125rem",
              color: colors.onSurface,
              margin: "0 0 1rem",
            }}
          >
            Want to be part of the next story?
          </p>
          <button
            onClick={() => router.push("/donor/explore")}
            style={{
              background: colors.primary,
              color: colors.onPrimary,
              border: "none",
              padding: "0.875rem 2.5rem",
              borderRadius: "999px",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: "0.9375rem",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(151,69,62,0.2)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Explore Campaigns
          </button>
        </div>
      </div>
    </SharedLayout>
  );
}
