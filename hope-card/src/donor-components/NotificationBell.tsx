"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Bell, HandHeart, Megaphone, X, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  type: "new_campaign" | "donation_success";
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

const C = {
  primary:             "#97453e",
  primaryContainer:    "#f28d83",
  onPrimaryContainer:  "#6e2621",
  surface:             "#fcf9f8",
  surfaceContainer:    "#f0edec",
  onSurface:           "#1b1c1b",
  onSurfaceVariant:    "#554240",
  outlineVariant:      "#dac1be",
} as const;

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('donor_token') ?? '';
      const res = await fetch("/donor/api/notifications", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    const token = localStorage.getItem('donor_token') ?? '';
    await fetch(`/donor/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    const token = localStorage.getItem('donor_token') ?? '';
    await fetch("/donor/api/notifications", {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: C.primaryContainer, display: "flex" }}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-0.25rem",
              right: "-0.25rem",
              minWidth: "1rem",
              height: "1rem",
              padding: "0 0.2rem",
              background: C.primary,
              color: "#fff",
              fontSize: "0.55rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "999px",
              border: `2px solid ${C.surface}`,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 0.75rem)",
            right: 0,
            width: "360px",
            background: C.surface,
            borderRadius: "1.25rem",
            boxShadow: "0 20px 50px rgba(27,28,27,0.12)",
            border: `1px solid ${C.outlineVariant}33`,
            zIndex: 200,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              borderBottom: `1px solid ${C.outlineVariant}33`,
            }}
          >
            <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: C.onSurface }}>
              Notifications
            </span>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  title="Mark all read"
                  style={{ background: "none", border: "none", cursor: "pointer", color: C.primaryContainer, display: "flex", padding: "0.25rem" }}
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.onSurfaceVariant, display: "flex", padding: "0.25rem" }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: C.onSurfaceVariant, fontSize: "0.875rem", fontFamily: "Manrope, sans-serif" }}>
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "2.5rem", textAlign: "center", color: C.onSurfaceVariant, fontSize: "0.875rem", fontFamily: "Manrope, sans-serif" }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.875rem",
                    padding: "0.875rem 1.25rem",
                    background: n.is_read ? "transparent" : `${C.primaryContainer}14`,
                    border: "none",
                    borderBottom: `1px solid ${C.outlineVariant}22`,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (n.is_read) e.currentTarget.style.background = C.surfaceContainer; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = n.is_read ? "transparent" : `${C.primaryContainer}14`; }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: "2.25rem",
                      height: "2.25rem",
                      borderRadius: "999px",
                      background: n.type === "donation_success" ? "#d1fae5" : `${C.primaryContainer}22`,
                      color: n.type === "donation_success" ? "#065f46" : C.primaryContainer,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {n.type === "donation_success"
                      ? <HandHeart size={14} />
                      : <Megaphone size={14} />}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: n.is_read ? 500 : 700, fontSize: "0.8125rem", color: C.onSurface }}>
                      {n.title}
                    </p>
                    <p style={{ margin: "0.2rem 0 0", fontFamily: "Manrope, sans-serif", fontSize: "0.75rem", color: C.onSurfaceVariant, lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    <p style={{ margin: "0.3rem 0 0", fontFamily: "Manrope, sans-serif", fontSize: "0.65rem", color: C.onSurfaceVariant, opacity: 0.6 }}>
                      {timeAgo(n.created_at)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.is_read && (
                    <div style={{ flexShrink: 0, width: "0.5rem", height: "0.5rem", borderRadius: "999px", background: C.primaryContainer, marginTop: "0.375rem" }} />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
