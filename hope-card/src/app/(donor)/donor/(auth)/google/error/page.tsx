"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const MESSAGES: Record<string, string> = {
  pending_approval:
    "Your account is still under review. You will receive an email once your account is approved. Thank you for your patience!",
  rejected:
    "Unfortunately, your account application has been rejected. If you believe this is an error, please contact support for assistance.",
  code_exchange_failed:
    "The Google sign-in could not be completed. Please try again.",
  no_email:
    "We could not retrieve your email address from Google. Please ensure your Google account has a verified email and try again.",
  account_creation_failed:
    "We encountered an issue creating your account. Please try again or sign up with email.",
  profile_creation_failed:
    "Your Google account was verified but we could not save your profile. Please try again or contact support.",
};

function GoogleErrorHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "code_exchange_failed";
  const message = MESSAGES[reason] ?? MESSAGES.code_exchange_failed;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "Manrope, sans-serif",
        backgroundColor: "#F5F0EB",
        gap: "1.5rem",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#6A1B1B", margin: 0, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
        Sign-in issue
      </h2>
      <p style={{ color: "#4B3B3B", maxWidth: "480px", lineHeight: 1.6, margin: 0 }}>
        {message}
      </p>
      <button
        onClick={() => router.push("/donor/login")}
        style={{
          padding: "0.875rem 2rem",
          borderRadius: "1rem",
          background: "#C0504D",
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.9375rem",
          border: "none",
          cursor: "pointer",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        Back to login
      </button>
    </div>
  );
}

export default function GoogleErrorPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>Loading…</div>}>
      <GoogleErrorHandler />
    </Suspense>
  );
}
