'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { useAuth } from '@/enduser-lib/auth-context';

export default function NotificationButton() {
  const { token } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_BASE = process.env.NEXT_PUBLIC_ENDUSER_API_URL || 'http://localhost:3001/api/v1';

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
        setUnreadCount((data || []).filter((n: any) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to fetch user notifications:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // 10-second polling
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0 || !token) return;

    try {
      await Promise.all(
        unread.map((n) =>
          fetch(`${API_BASE}/notifications/${n.id}/read`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleClearAll = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('volunteer')) {
      return { emoji: '🤝', bg: '#EEF2FF', color: '#4F46E5' };
    }
    if (type.includes('donation')) {
      return { emoji: '🎁', bg: '#ECFDF5', color: '#059669' };
    }
    if (type.includes('shift')) {
      return { emoji: '⏱️', bg: '#FFFBEB', color: '#D97706' };
    }
    return { emoji: '🔔', bg: '#F1F5F9', color: '#64748B' };
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
    <View style={styles.container}>
      <Pressable
        onPress={() => setShowDropdown(!showDropdown)}
        style={({ hovered }: any) => [
          styles.iconButton,
          { transition: 'all 0.2s ease' },
          hovered && { opacity: 0.8, transform: [{ scale: 1.1 }] }
        ]}
      >
        <Image source={{ uri: '/enduser/icon-bell.png' }} style={styles.navIcon} resizeMode="contain" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </Pressable>

      {showDropdown && (
        <>
          {/* Backdrop overlay to close dropdown when clicking outside */}
          <Pressable style={styles.backdrop} onPress={() => setShowDropdown(false)} />
          
          <View style={styles.dropdown}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Notifications</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {unreadCount > 0 && (
                  <Pressable onPress={handleMarkAllAsRead}>
                    {({ hovered }: any) => (
                      <Text style={[styles.markAllRead, hovered && { textDecorationLine: 'underline' }]}>
                        Mark all as read
                      </Text>
                    )}
                  </Pressable>
                )}
                {notifications.length > 0 && (
                  <Pressable onPress={handleClearAll}>
                    {({ hovered }: any) => (
                      <Text style={[styles.markAllRead, { opacity: 0.8 }, hovered && { textDecorationLine: 'underline' }]}>
                        Clear
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
            </View>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={true}>
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🔔</Text>
                  <Text style={styles.emptyTitle}>No notifications yet</Text>
                  <Text style={styles.emptyText}>We'll notify you when your applications and pledges get reviewed.</Text>
                </View>
              ) : (
                notifications.map((notif) => {
                  const iconData = getNotificationIcon(notif.type);
                  return (
                    <Pressable
                      key={notif.id}
                      onPress={() => !notif.is_read && handleMarkAsRead(notif.id)}
                      style={({ hovered }: any) => [
                        styles.item,
                        !notif.is_read && styles.unreadItem,
                        hovered && (notif.is_read ? styles.itemHovered : styles.unreadItemHovered)
                      ]}
                    >
                      <View style={[styles.iconIndicator, { backgroundColor: iconData.bg }]}>
                        <Text style={[styles.iconEmoji, { color: iconData.color }]}>{iconData.emoji}</Text>
                      </View>
                      <View style={styles.contentWrap}>
                        <Text style={styles.title}>{notif.title}</Text>
                        <Text style={styles.message}>{notif.message}</Text>
                        <Text style={styles.time}>{formatTime(notif.created_at)}</Text>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  navIcon: {
    width: 28,
    height: 28,
    opacity: 0.7,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    height: 16,
    minWidth: 16,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  } as any,
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 90,
  } as any,
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 360,
    maxHeight: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 12,
    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.8)',
    overflow: 'hidden',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
  } as any,
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  markAllRead: {
    fontSize: 11,
    color: '#5C6ED5',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  emptyState: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  unreadItem: {
    backgroundColor: '#EFF6FF',
  },
  itemHovered: {
    backgroundColor: '#F9FAFB',
  },
  unreadItemHovered: {
    backgroundColor: '#DBEAFE',
  },
  iconIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: 14,
  },
  contentWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 16,
  },
  message: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  time: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 4,
  },
});