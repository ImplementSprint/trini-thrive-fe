﻿// app/login/page.tsx
import { LoginForm } from "@/app/(beneficiary)/beneficiary/login/login-form";
import { BeneficiaryStyle, BeneficiaryFooter, AmbientCard, CardLogo } from "@/app/(beneficiary)/beneficiary/shared/beneficiary-shared";

interface LoginPageProps {
  searchParams: Promise<{ confirmed?: string; error?: string; reset?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div
      style={{
        background: "#fff8f7",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "Plus Jakarta Sans, sans-serif",
        color: "#241918",
      }}
    >
      <BeneficiaryStyle />

      <main style={{ width: "100%", maxWidth: "32rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <AmbientCard>
          {/* Branding */}
          <div style={{ width: "100%", textAlign: "center", marginBottom: "2.5rem" }}>
            <CardLogo />
            <h1 style={{ fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#241918", margin: "0 0 0.5rem" }}>
              Welcome back
            </h1>
            <p style={{ fontSize: "1rem", fontWeight: 500, color: "#554240", opacity: 0.8, margin: 0 }}>
              Enter your beneficiary credentials to continue.
            </p>
          </div>

          <LoginForm confirmed={params.confirmed === 'true'} linkExpired={params.error === 'expired'} passwordReset={params.reset === 'true'} />

          {/* Bottom link */}
          <div style={{ marginTop: "2.5rem", paddingTop: "2rem", width: "100%", textAlign: "center", borderTop: "1px solid #dac1be1a" }}>
            <p style={{ color: "#554240", fontSize: "0.875rem", fontWeight: 500, margin: 0 }}>
              Don't have an account?{" "}
              <a
                href="/beneficiary/signup"
                style={{ color: "#97453e", fontWeight: 700, marginLeft: "0.25rem", textDecoration: "none" }}
              >
                Sign up
              </a>
            </p>
          </div>
        </AmbientCard>

        <BeneficiaryFooter />
      </main>
    </div>
  );
}
