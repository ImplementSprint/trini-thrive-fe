'use client';

﻿import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./Header.module.css";
import { useAuth } from "@/admin-lib/auth-context";
import { apiFetch } from "@/admin-lib/api";

interface Notification {
  id: string;
  user_id?: string;
  target_role: string;
  title: string;
  message: string;
  type: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export default function Header() {
  const { profile, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const displayName =
    profile
      ? `${profile.first_name} ${profile.last_name}`.trim() || "Admin"
      : "Admin";

  const initials = profile
    ? `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase() || "A"
    : "A";

  const fetchNotifications = async () => {
    try {
      // Only fetch if profile exists
      const data = await apiFetch<Notification[]>('/notifications');
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // 10-second polling
      return () => clearInterval(interval);
    }
  }, [profile]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;

    try {
      await Promise.all(
        unread.map((n) => apiFetch(`/notifications/${n.id}/read`, { method: 'PATCH' }))
      );
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await apiFetch('/notifications', { method: 'DELETE' });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('volunteer')) {
      return { emoji: '🤝', styleClass: styles.iconVolunteer };
    }
    if (type.includes('donation')) {
      return { emoji: '🎁', styleClass: styles.iconDonation };
    }
    if (type.includes('shift')) {
      return { emoji: '⏱️', styleClass: styles.iconShift };
    }
    return { emoji: '🔔', styleClass: styles.iconDefault };
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoIconBox}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F895651d642164b74988a81b4e99696fb%2Fb3d0b1c5feab4adcb58d0b0014788cce?format=webp&width=800&height=1200"
              alt="BayaniHub Logo"
              className={styles.logoImage}
            />
          </div>
          <span className={styles.logoText}>Admin Portal</span>
        </Link>

        <div className={styles.rightContent}>
          <div className={styles.notificationWrap}>
            <button
              className={styles.notificationButton}
              onClick={() => setShowNotifications((value) => !value)}
              aria-label="Open notifications"
              aria-expanded={showNotifications}
            >
              <svg className={styles.notificationIcon} viewBox="0 0 16 18" fill="none">
                <path d="M7.87519 0C7.25292 0 6.75019 0.502734 6.75019 1.125V1.7543C4.20136 2.15859 2.25019 4.36641 2.25019 7.03125V8.20547C2.25019 9.80156 1.70527 11.352 0.710347 12.5965L0.186519 13.2539C-0.0173877 13.507 -0.0560596 13.8551 0.0845654 14.1469C0.22519 14.4387 0.520503 14.625 0.84394 14.625H14.9064C15.2299 14.625 15.5252 14.4387 15.6658 14.1469C15.8064 13.8551 15.7678 13.507 15.5639 13.2539L15.04 12.6C14.0451 11.352 13.5002 9.80156 13.5002 8.20547V7.03125C13.5002 4.36641 11.549 2.15859 9.00019 1.7543V1.125C9.00019 0.502734 8.49746 0 7.87519 0Z" fill="currentColor" />
              </svg>
              {unreadCount > 0 && (
                <span className={styles.unreadBadge}>{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className={styles.notificationPanel}>
                <div className={styles.notificationPanelHeader}>
                  <span>Notifications</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {unreadCount > 0 && (
                      <button className={styles.markAllReadBtn} onClick={handleMarkAllAsRead}>
                        Mark all as read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button className={styles.markAllReadBtn} style={{ opacity: 0.8 }} onClick={handleClearAll}>
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles.notificationsList}>
                  {notifications.length === 0 ? (
                    <div className={styles.emptyState}>
                      <span className={styles.emptyIcon}>🔔</span>
                      <span>No notifications yet</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>We'll notify you when actions occur.</span>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const iconData = getNotificationIcon(notif.type);
                      return (
                        <div
                          key={notif.id}
                          className={`${styles.notificationItem} ${!notif.is_read ? styles.unread : ''}`}
                          onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                        >
                          <div className={`${styles.notificationIconIndicator} ${iconData.styleClass}`}>
                            {iconData.emoji}
                          </div>
                          <div className={styles.notificationContent}>
                            <strong>{notif.title}</strong>
                            <span>{notif.message}</span>
                            <span className={styles.notificationTime}>{formatTime(notif.created_at)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.divider} />

          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {initials}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{displayName}</p>
              <p className={styles.userRole}>Administrator</p>
            </div>
          </div>

          <div className={styles.divider} />

          <button
            onClick={logout}
            className={styles.logoutButton}
            title="Sign out"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
