import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HOPECARD - Beneficiary Dashboard",
  description: "Disaster relief assistance dashboard",
};

export default function BeneficiaryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />
      {children}
    </>
  );
}
