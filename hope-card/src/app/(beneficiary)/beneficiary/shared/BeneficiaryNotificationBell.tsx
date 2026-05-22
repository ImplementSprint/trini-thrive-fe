"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { S } from "./beneficiary-shared";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export const BeneficiaryNotificationBell: React.FC = () => {
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchNotifs() {
      try {
        const res = await fetch("/beneficiary/api/notifications");
        if (res.ok) {
          const d = await res.json();
          setNotifications(d.notifications ?? []);
        }
      } catch { /* ignore */ }
    }
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  return (
    <div ref={bellRef} style={{ position: "relative" }}>
      <button
        onClick={() => setBellOpen((v) => !v)}
        style={{
          padding: "0.5rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#78716c",
          borderRadius: "999px",
          display: "flex",
          position: "relative",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = S.surfaceContainerHigh)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <Bell size={22} />
        {notifications.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: "0.25rem",
              right: "0.25rem",
              minWidth: "1rem",
              height: "1rem",
              padding: "0 0.2rem",
              background: S.error,
              color: "#fff",
              fontSize: "0.55rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "999px",
              border: "2px solid #fff",
            }}
          >
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </button>

      {bellOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 0.75rem)",
            right: 0,
            width: "340px",
            background: "#fff",
            borderRadius: "1.25rem",
            boxShadow: "0 20px 50px rgba(27,28,27,0.12)",
            border: `1px solid ${S.outlineVariant}33`,
            zIndex: 200,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.25rem",
              borderBottom: `1px solid ${S.outlineVariant}22`,
            }}
          >
            <span
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: S.onSurface,
              }}
            >
              Notifications
            </span>
            <button
              onClick={() => setBellOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#78716c",
                fontSize: "1rem",
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ maxHeight: "380px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <p
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "#78716c",
                  fontSize: "0.875rem",
                  margin: 0,
                }}
              >
                No notifications
              </p>
            ) : (
              notifications.map((n) => (
                <a
                  key={n.id}
                  href={
                    n.type === "invitation"
                      ? "/beneficiary/campaigns/invitations"
                      : "/beneficiary/fund-management"
                  }
                  onClick={() => setBellOpen(false)}
                  style={{
                    display: "flex",
                    gap: "0.875rem",
                    padding: "0.875rem 1.25rem",
                    background: "transparent",
                    borderBottom: `1px solid ${S.outlineVariant}22`,
                    textDecoration: "none",
                    transition: "background 0.12s",
                    alignItems: "flex-start",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = S.surfaceContainerLow)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: "2.25rem",
                      height: "2.25rem",
                      borderRadius: "999px",
                      background:
                        n.type === "disbursement"
                          ? "#d1fae5"
                          : `${S.primaryContainer}22`,
                      color:
                        n.type === "disbursement" ? "#065f46" : S.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                    }}
                  >
                    {n.type === "disbursement" ? "₱" : "✉"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                        color: S.onSurface,
                      }}
                    >
                      {n.title}
                    </p>
                    <p
                      style={{
                        margin: "0.2rem 0 0",
                        fontFamily: "Manrope, sans-serif",
                        fontSize: "0.75rem",
                        color: "#78716c",
                        lineHeight: 1.4,
                      }}
                    >
                      {n.message}
                    </p>
                    <p
                      style={{
                        margin: "0.25rem 0 0",
                        fontFamily: "Manrope, sans-serif",
                        fontSize: "0.65rem",
                        color: "#78716c",
                        opacity: 0.6,
                      }}
                    >
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
