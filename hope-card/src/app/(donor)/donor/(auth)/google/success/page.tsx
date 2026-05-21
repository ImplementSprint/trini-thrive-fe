"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function GoogleSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.replace("/donor/login?error=missing_token");
      return;
    }
    localStorage.setItem("donor_token", token);
    document.cookie = "persona=digital-donor; path=/; SameSite=Strict";
    router.replace("/donor/home");
  }, [router, searchParams]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "Manrope, sans-serif" }}>
      Signing you in…
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>Loading…</div>}>
      <GoogleSuccessHandler />
    </Suspense>
  );
}
