import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HOPECARD - Campaign Manager",
  description: "Manage and track your active initiatives",
};

export default function CampaignManagerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
