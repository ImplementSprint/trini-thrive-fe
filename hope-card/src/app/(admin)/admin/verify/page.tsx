"use client";

import { Suspense } from "react";
import VerifyClient from "./VerifyClient";

export default function Verify() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading verification page...</p>
      </div>
    }>
      <VerifyClient />
    </Suspense>
  );
}
