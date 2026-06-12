"use client";

import { X, Bell, UserPlus, CheckCircle, XCircle, DollarSign, Target } from "lucide-react";
import { notifications } from "@/admin-lib/mockData";
import styles from "./NotificationModal.module.css";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "application":
      return <UserPlus size={18} />;
    case "approval":
      return <CheckCircle size={18} />;
    case "rejection":
      return <XCircle size={18} />;
    case "donation":
      return <DollarSign size={18} />;
    case "campaign":
      return <Target size={18} />;
    default:
      return <Bell size={18} />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "application":
      return styles.application;
    case "approval":
      return styles.approval;
    case "rejection":
      return styles.rejection;
    case "donation":
      return styles.donation;
    case "campaign":
      return styles.campaign;
    default:
      return "";
  }
};

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Notifications</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {unreadCount > 0 && (
          <div className={styles.unreadBadge}>
            {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
          </div>
        )}

        <div className={styles.notificationList}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`${styles.notificationItem} ${!notification.read ? styles.unread : ""}`}
            >
              <div className={`${styles.iconWrapper} ${getNotificationColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className={styles.content}>
                <div className={styles.topRow}>
                  <span className={styles.title}>{notification.title}</span>
                  <span className={styles.time}>{notification.time}</span>
                </div>
                <p className={styles.message}>{notification.message}</p>
              </div>
              {!notification.read && <span className={styles.dot}></span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}