"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, User, Users, UserCheck, Heart, FileText, Landmark, LogOut } from "lucide-react";
import styles from "./Sidebar.module.css";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  { name: "Digital Donor Approval", href: "/admin/digital-donors", icon: User },
  { name: "Campaign Manager Approval", href: "/admin/campaign-managers", icon: Users },
  { name: "Beneficiaries Approval", href: "/admin/beneficiaries-approval", icon: UserCheck },
  { name: "Beneficiary Documents Approval", href: "/admin/beneficiary-documents-approval", icon: FileText },
  { name: "Beneficiary Bank Approval", href: "/admin/beneficiary-bank-approval", icon: Landmark },
  { name: "Campaign List", href: "/admin/beneficiaries-list", icon: Heart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    router.push('/admin/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoMark}>
          <Image
            src="/admin/HopeCard%20Logo.png"
            alt="HopeCard Logo"
            width={45}
            height={45}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>
        <h1 className={styles.logoText}>HopeCard</h1>
      </div>

      <nav className={styles.navMenu}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <Icon size={20} className={styles.icon} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.bottomAction}>
        <button className={styles.collapseBtn} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}