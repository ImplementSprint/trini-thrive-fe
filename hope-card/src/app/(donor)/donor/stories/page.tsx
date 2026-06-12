"use client";

import React from "react";
import SharedLayout from "@/donor-components/SharedLayout";

const colors = {
  primary: "#97453e",
  onSurface: "#1b1c1b",
  onSurfaceVariant: "#554240",
} as const;

export default function StoriesPage() {
  return (
    <SharedLayout currentPage="stories">
      <div style={{ 
        maxWidth: "1440px", 
        margin: "0 auto", 
        padding: "4rem 3rem",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
      }}>
        <h1 style={{ 
          fontSize: "3.5rem", 
          fontWeight: 800, 
          color: colors.primary, 
          marginBottom: "1rem", 
          fontFamily: "Plus Jakarta Sans, sans-serif" 
        }}>
          Stories
        </h1>
        <p style={{ 
          fontSize: "1.5rem", 
          color: colors.onSurfaceVariant, 
          fontFamily: "Manrope, sans-serif",
          fontWeight: 500
        }}>
          In Progress
        </p>
      </div>
    </SharedLayout>
  );
}
