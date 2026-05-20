import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HopeCard Beneficiary",
  description: "HopeCard Beneficiary Portal",
};

// Note: The Material Symbols Outlined stylesheet previously rendered here as a
// <link> tag inside the React fragment (document body). If Material Symbols
// icons are needed by the beneficiary UI, add the following link to the root
// layout's <head> (hope-card/src/app/layout.tsx):
//   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

export default function BeneficiaryGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
