'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/enduser-lib/auth-context';
import NotificationButton from '@/enduser-components/NotificationButton';
import styles from './EnduserNavBar.module.css';

type NavKey = 'home' | 'about' | 'applications' | 'mission';

const NAV_ITEMS: { key: NavKey; label: string; href: string }[] = [
  { key: 'home', label: 'Home', href: '/enduser/dashboard' },
  { key: 'about', label: 'About Us', href: '/enduser/about' },
  { key: 'applications', label: 'Applications', href: '/enduser/applications' },
  { key: 'mission', label: 'Mission', href: '/enduser/mission' },
];

function resolveActiveKey(pathname: string | null): NavKey | null {
  if (!pathname) return null;
  if (pathname.startsWith('/enduser/dashboard')) return 'home';
  if (pathname.startsWith('/enduser/about')) return 'about';
  if (pathname.startsWith('/enduser/applications')) return 'applications';
  if (pathname.startsWith('/enduser/mission')) return 'mission';
  return null;
}

interface EnduserNavBarProps {
  activeKey?: NavKey;
}

export default function EnduserNavBar({ activeKey }: EnduserNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const active = activeKey ?? resolveActiveKey(pathname);
  const displayName = user?.profile?.first_name
    ? `${user.profile.first_name} ${user.profile.last_name ?? ''}`.trim()
    : null;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft}>
        <Link href="/enduser/dashboard" className={styles.logoContainer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/enduser/logo_b.png" alt="BayaniHub logo" className={styles.logo} />
          <span className={styles.brand}>BayaniHub</span>
        </Link>

        <div className={styles.navLinks}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`${styles.navLink} ${active === item.key ? styles.activeLink : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.navRight}>
        <NotificationButton />
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className={styles.userProfile}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/enduser/icon-user.png" alt="" className={styles.userIcon} />
            {displayName && <span className={styles.userName}>{displayName}</span>}
          </button>
          {menuOpen && (
            <div className={styles.userMenu} role="menu">
              <button
                type="button"
                className={styles.logoutButton}
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  router.replace('/enduser/login');
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
