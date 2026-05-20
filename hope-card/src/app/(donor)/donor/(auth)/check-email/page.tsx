"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import { C, AuthShell, MobileLogo } from "@/donor-components/auth-shared";

function CheckEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'your email';

  return (
    <AuthShell>
      {/* Form Panel */}
      <div
        style={{
          padding: "clamp(2rem, 5vw, 5rem)",
          background: C.surfaceContainerLowest,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Mobile logo */}
        <MobileLogo />

        {/* Header */}
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          {/* Mail icon */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "4rem",
              height: "4rem",
              background: C.surfaceContainerLow,
              borderRadius: "1rem",
              marginBottom: "1.5rem",
              color: C.primary,
            }}
          >
            <Mail size={32} />
          </div>

          <h2 style={{ 
            fontFamily: "Plus Jakarta Sans, sans-serif", 
            fontSize: "1.875rem", 
            fontWeight: 700, 
            color: C.onPrimaryFixed, 
            margin: "0 0 0.5rem",
            textAlign: "center"
          }}>
            Check Your Email
          </h2>
          
          <p style={{ 
            color: C.onSurfaceVariant, 
            margin: "0 0 1.5rem", 
            lineHeight: 1.6, 
            fontFamily: "Manrope, sans-serif",
            fontSize: "1rem"
          }}>
            We've sent a confirmation link to{" "}
            <span style={{ color: C.onPrimaryFixed, fontWeight: 600 }}>
              {maskedEmail}
            </span>
          </p>

          <div style={{
            padding: "1.5rem",
            background: C.surfaceContainerLow,
            borderRadius: "1rem",
            marginBottom: "2rem",
            textAlign: "left"
          }}>
            <h3 style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: "1rem",
              fontWeight: 600,
              color: C.onSurfaceVariant,
              margin: "0 0 0.75rem"
            }}>
              What's next?
            </h3>
            <ol style={{
              margin: 0,
              paddingLeft: "1.5rem",
              fontFamily: "Manrope, sans-serif",
              fontSize: "0.875rem",
              color: C.onSurfaceVariant,
              lineHeight: 1.8
            }}>
              <li style={{ marginBottom: "0.5rem" }}>
                Check your email inbox for a confirmation link from Hopecard
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                Click the confirmation link to verify your email address
              </li>
              <li>
                Your application will be subject for review
              </li>
            </ol>
          </div>

          <p style={{
            color: C.onSurfaceVariant,
            margin: "0 0 1.5rem",
            fontFamily: "Manrope, sans-serif",
            fontSize: "0.875rem"
          }}>
            Didn't receive the email? Check your spam folder or go back to signup to resend.
          </p>
        </div>

        {/* Back button */}
        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={() => router.push('/donor/signup')}
            style={{
              background: "none",
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: C.onSurfaceVariant,
              fontWeight: 500,
              fontSize: "0.875rem",
              textDecoration: "none",
              transition: "color 0.15s",
              fontFamily: "Manrope, sans-serif",
              cursor: "pointer",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.onPrimaryFixed;
              e.currentTarget.style.background = C.surfaceContainerLow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = C.onSurfaceVariant;
              e.currentTarget.style.background = "none";
            }}
          >
            <ArrowLeft size={16} />
            Back to Sign Up
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

export default function CheckEmailScreen() {
  return (
    <Suspense fallback={
      <AuthShell>
        <div style={{
          padding: "clamp(2rem, 5vw, 5rem)",
          background: "transparent",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh"
        }}>
          <p style={{ color: "#666", fontFamily: "Manrope, sans-serif" }}>Loading...</p>
        </div>
      </AuthShell>
    }>
      <CheckEmailForm />
    </Suspense>
  );
}
