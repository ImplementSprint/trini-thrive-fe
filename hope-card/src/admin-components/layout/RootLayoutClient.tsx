"use client";

import { usePathname } from "next/navigation";
import styles from "@/app/layout.module.css";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't show sidebar and header on login/auth pages
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/verify";

  if (isAuthPage) {
    return children;
  }

  return <div className={styles.appWrapper}>{children}</div>;
}
