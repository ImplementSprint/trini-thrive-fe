import type { Metadata } from "next";
import { CartProvider } from "@/donor-contexts/CartContext";

export const metadata: Metadata = {
  title: "Hopecard",
  description: "Support meaningful causes and make an impact in different communities.",
  icons: {
    icon: '/donor/logo_h.png',
  },
};

export default function DonorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
