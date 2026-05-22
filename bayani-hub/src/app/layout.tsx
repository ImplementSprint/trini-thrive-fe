import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BayaniHub',
  description: 'BayaniHub — unified platform for Admin, End Users, and Site Managers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
