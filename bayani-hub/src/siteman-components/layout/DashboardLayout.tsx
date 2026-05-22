import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PageTransition } from '@/siteman-components/ui/PageTransition';
import {
  Bell, User, LayoutDashboard,
  Play, Activity, Clock, LogOut
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/siteman/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/siteman/activate-mission', label: 'Activate Mission', icon: Play },
  { href: '/siteman/volunteer-summary', label: 'Volunteer Summary', icon: Activity },
  { href: '/siteman/shifts', label: 'Review Shift Hours', icon: Clock },
];

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3003').replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/api/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
        setUnreadCount((data || []).filter((n: any) => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10-second polling
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3003').replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/api/notifications/${id}/read`, { method: 'PATCH' });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3003').replace(/\/$/, '');
      await Promise.all(
        unread.map((n) => fetch(`${baseUrl}/api/notifications/${n.id}/read`, { method: 'PATCH' }))
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
      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3003').replace(/\/$/, '');
      await fetch(`${baseUrl}/api/notifications`, { method: 'DELETE' });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
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

  const handleLogout = async () => {
    // Clear cookies/session (Assuming simple implementation)
    document.cookie = "supabase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/');
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-gray-50)'
    }}>
      {/* Header - Full Width with Logo and Navigation */}
      <header style={{ 
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-gray-200)',
        padding: '12px 40px',
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{
          maxWidth: '1800px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left - Logo that navigates to home */}
          <Link href="/siteman/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: '8px',
              borderRadius: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                position: 'relative',
                flexShrink: 0
              }}>
                <Image
                  src="/siteman/images/bayanihub_logo.png"
                  alt="Bayanihub Logo"
                  fill
                  style={{
                    objectFit: 'contain'
                  }}
                  priority
                />
              </div>
              <span style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#5C6ED5',
                letterSpacing: '-0.02em'
              }}>
                BayaniHub
              </span>
            </div>
          </Link>

          {/* Right - Notification and Profile Icons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            {/* Notification Dropdown */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6B7280',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: '#EF4444',
                    color: 'white',
                    fontSize: '9px',
                    fontWeight: 700,
                    height: '16px',
                    minWidth: '16px',
                    padding: '0 4px',
                    borderRadius: '9999px',
                    border: '2px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '360px',
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  overflow: 'hidden',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '400px'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #E5E7EB',
                    fontWeight: 700,
                    color: '#111827',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#F9FAFB'
                  }}>
                    <span style={{ fontSize: '14px' }}>Notifications</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          style={{
                            fontSize: '11px',
                            color: '#5C6ED5',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            padding: 0
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          Mark all as read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearAll}
                          style={{
                            fontSize: '11px',
                            color: '#5C6ED5',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            padding: 0,
                            opacity: 0.8
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9CA3AF' }}>
                        <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🔔</span>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>No notifications yet</div>
                        <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>We'll notify you of pending volunteer tasks.</div>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const iconData = getNotificationIcon(notif.type);
                        return (
                          <div
                            key={notif.id}
                            onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                            style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid #F3F4F6',
                              cursor: 'pointer',
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'flex-start',
                              backgroundColor: notif.is_read ? 'transparent' : '#EFF6FF',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = notif.is_read ? '#F9FAFB' : '#DBEAFE'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.is_read ? 'transparent' : '#EFF6FF'}
                          >
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: iconData.bg,
                              color: iconData.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              flexShrink: 0
                            }}>
                              {iconData.emoji}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', lineHeight: '1.3' }}>{notif.title}</div>
                              <div style={{ fontSize: '11px', color: '#6B7280', lineHeight: '1.4' }}>{notif.message}</div>
                              <div style={{ fontSize: '9px', color: '#9CA3AF', marginTop: '4px' }}>{formatTime(notif.created_at)}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6B7280',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <User size={20} />
              </button>

              {showProfileMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '200px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  zIndex: 100
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>Site Manager</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>admin@bayanihub.org</div>
                  </div>
                  <div style={{ padding: '8px' }}>
                    <button 
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        fontWeight: 500,
                        fontSize: '14px',
                        cursor: 'pointer',
                        borderRadius: '6px',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav style={{
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-gray-200)',
        padding: '0 40px',
        width: '100%',
        position: 'sticky',
        top: '61px',
        zIndex: 40,
      }}>
        <div style={{
          maxWidth: '1800px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          overflowX: 'auto',
        }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '12px 14px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-gray-500)',
                  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  borderRadius: '6px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
                    e.currentTarget.style.color = 'var(--color-primary-dark)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-gray-500)';
                  }
                }}>
                  <Icon size={14} />
                  {label}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Main Content */}
      <main style={{ 
        padding: '32px 40px',
        width: '100%'
      }}>
        <div style={{
          maxWidth: '1800px',
          margin: '0 auto',
          width: '100%'
        }}>
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
};