"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image component
import { usePathname } from "next/navigation";
import { LayoutGrid, User, Users, UserCheck, Heart, PanelLeftClose, PanelLeftOpen, FileText, Landmark } from "lucide-react";
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.logoContainer}>
        <div className={styles.logoMark}>
          <Image 
            src="/admin/HopeCard%20Logo.png" 
            alt="HopeCard Logo" 
            width={45}  // Match the CSS width
            height={45} // Match the CSS height
            priority
            style={{ objectFit: "contain" }} // Ensures the logo isn't cropped if it's rectangular
          />
        </div>
        {!isCollapsed && <h1 className={styles.logoText}>HopeCard</h1>}
      </div>

      <nav className={styles.navMenu}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""} ${isCollapsed ? styles.navItemCollapsed : ""}`}
              title={isCollapsed ? item.name : ""}
            >
              <Icon size={20} className={styles.icon} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={styles.bottomAction}>
        <button 
          className={`${styles.collapseBtn} ${isCollapsed ? styles.collapseBtnCenter : ""}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <PanelLeftOpen size={24} /> : <PanelLeftClose size={24} />}
        </button>
      </div>
    </aside>
  );
}