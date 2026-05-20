"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, ChevronDown, Settings, LogOut, UserPlus, CheckCircle, XCircle, DollarSign, Target } from "lucide-react";
import SettingsMenuModal from "./modals/SettingsMenuModal";
import ChangePasswordModal from "./modals/ChangePasswordModal";
import { notifications } from "@/admin-lib/mockData";
import styles from "./Header.module.css";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "application":
      return <UserPlus size={16} />;
    case "approval":
      return <CheckCircle size={16} />;
    case "rejection":
      return <XCircle size={16} />;
    case "donation":
      return <DollarSign size={16} />;
    case "campaign":
      return <Target size={16} />;
    default:
      return <Bell size={16} />;
  }
};

export default function Header() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin User");
  const [adminEmail, setAdminEmail] = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Load admin info from localStorage on mount
  useEffect(() => {
    const adminInfo = localStorage.getItem('admin_info');
    if (adminInfo) {
      try {
        const parsed = JSON.parse(adminInfo);
        setAdminName(parsed.name || "Admin User");
        setAdminEmail(parsed.email || "");
      } catch (error) {
        console.error('Failed to parse admin info:', error);
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    // 1. Call logout endpoint first
    try {
      await fetch('/admin/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // 2. Clear local token storage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');

    // 3. Expire persona cookie
    document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';

    // 4. Redirect last
    router.push('/admin/login');
  };

  // Step 1: Open the Settings Menu
  const handleOpenSettings = () => {
    setIsMenuOpen(true);
    setIsDropdownOpen(false);
  };

  // Step 2: Transition from Menu to Password Form
  const handleOpenChangePassword = () => {
    setIsMenuOpen(false);         // Close the list menu
    setIsPasswordModalOpen(true); // Open the actual password inputs
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.pageTitle}>
          <h2>Admin Portal</h2>
          <p>Welcome back, {adminName}</p>
        </div>

        <div className={styles.userSection}>
          <div ref={notificationRef} style={{ position: "relative" }}>
            <button className={styles.notificationBtn} onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
              <Bell size={20} />
              {unreadCount > 0 && <span className={styles.notificationDot}></span>}
            </button>

            {isNotificationOpen && (
              <div className={styles.notificationDropdown}>
                <div className={styles.notificationDropdownHeader}>
                  <h3>Notifications</h3>
                  {unreadCount > 0 && <span className={styles.notificationTime}>{unreadCount} new</span>}
                </div>
                <div className={styles.notificationList}>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`${styles.notificationDropdownItem} ${!notification.read ? styles.unread : ""}`}
                    >
                      <div className={`${styles.notificationIconWrapper} ${styles[notification.type]}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className={styles.notificationContent}>
                        <div className={styles.topRow}>
                          <span className={styles.notificationTitle}>{notification.title}</span>
                          <span className={styles.notificationTime}>{notification.time}</span>
                        </div>
                        <p className={styles.notificationMessage}>{notification.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.divider}></div>

          <div className={styles.profileContainer} ref={dropdownRef}>
            <div 
              className={`${styles.profile} ${isDropdownOpen ? styles.profileActive : ""}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{adminName}</span>
                <span className={styles.profileRole}>{adminEmail || "Administrator"}</span>
              </div>
              <div className={styles.avatar}>
                <User size={18} color="white" />
              </div>
              <ChevronDown size={16} className={styles.chevron} />
            </div>

            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button className={styles.dropdownItem} onClick={handleOpenSettings}>
                  <Settings size={16} className={styles.dropdownIcon} />
                  <span>Settings</span>
                </button>
                
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  <LogOut size={16} className={styles.dropdownIcon} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MODAL 1: The Settings List Menu */}
      <SettingsMenuModal 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onChangePasswordClick={handleOpenChangePassword} 
      />

      {/* MODAL 2: The actual Change Password Inputs */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </>
  );
}
