'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { createClient } from '@/campaign-manager-utils/supabase/client';
import {
  Bell,
  FileText,
  LayoutGrid,
  LogOut,
  Menu,
  Megaphone,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react';

function CollapseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16" />
      <path d="M4 12h10" />
      <path d="M4 18h16" />
      <path d="M19 9l-3 3 3 3" />
    </svg>
  );
}

const navItems = [
  { href: '/campaign-manager/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/campaign-manager/my-campaigns', label: 'My Campaigns', icon: Megaphone },
  { href: '/campaign-manager/create-campaign', label: 'Create Campaign', icon: Plus },
  { href: '/campaign-manager/donors', label: 'Donors', icon: Users },
  { href: '/campaign-manager/reports', label: 'Reports', icon: FileText },
  { href: '/campaign-manager/settings', label: 'Settings', icon: Settings },
];

interface AppShellProps {
  children: ReactNode;
  searchPlaceholder?: string;
  userName?: string;
  userRole?: string;
}

export default function AppShell({
  children,
  searchPlaceholder = 'Search campaigns...',
  userName = 'Campaign Manager',
  userRole = 'Manager',
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <main className="h-screen overflow-hidden bg-[#fcfaf8] text-[#463431]">
      <div className="flex h-screen w-full bg-[#fffdfa]">
        <aside className={`hidden h-screen shrink-0 flex-col border-r border-[#f0e7e3] bg-[#fffdfa] transition-all duration-300 xl:flex ${isCollapsed ? 'w-[80px]' : 'w-[250px]'}`}>
          <div className={`flex h-[72px] items-center overflow-hidden border-b border-[#f0e7e3] ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-5'}`}>
            <button type="button" onClick={() => setIsCollapsed(!isCollapsed)} className="shrink-0 text-[#7d6a64] transition-colors hover:text-[#b25649]">
              {isCollapsed ? <Menu size={18} /> : <CollapseIcon />}
            </button>
            {!isCollapsed && (
              <div className="flex min-w-[150px] shrink-0 items-center gap-3">
                <Image src="/campaign-manager/images/logo_h.png" alt="HOPECARD" width={24} height={24} className="h-6 w-6 object-contain" />
                <span className="text-[20px] font-extrabold tracking-[-0.03em] text-[#b25649]">HOPECARD</span>
              </div>
            )}
          </div>

          <div className={`border-b border-[#f0e7e3] overflow-hidden py-4 ${isCollapsed ? 'flex justify-center px-0' : 'px-5'}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#20313f] text-white">
                <Users size={18} />
              </div>
              {!isCollapsed && (
                <div className="min-w-[150px] shrink-0">
                  <p className="text-[14px] font-bold text-[#473531]">{userName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#d27766]">{userRole}</p>
                </div>
              )}
            </div>
          </div>

          <nav className={`flex-1 overflow-x-hidden py-5 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            <ul className="space-y-2">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center overflow-hidden rounded-xl py-3 text-left text-[14px] font-medium transition ${
                        isCollapsed ? 'justify-center w-12 h-12 px-0 mx-auto' : 'w-full gap-3 px-4'
                      } ${
                        active ? 'bg-[#fff1ed] text-[#cc6d58]' : 'text-[#746560] hover:bg-[#faf3f0]'
                      }`}
                      title={isCollapsed ? label : undefined}
                    >
                      <Icon size={16} className={`shrink-0 ${active ? 'text-[#cc6d58]' : 'text-[#8a7a76]'}`} />
                      {!isCollapsed && <span className="min-w-[120px] shrink-0">{label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={`pb-5 overflow-hidden ${isCollapsed ? 'px-2' : 'px-4'}`}>
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className={`flex items-center overflow-hidden rounded-xl py-3 text-[14px] font-medium text-[#746560] hover:bg-[#faf3f0] ${
                isCollapsed ? 'justify-center w-12 h-12 px-0 mx-auto' : 'w-full gap-3 px-4'
              }`}
              title={isCollapsed ? 'Logout' : undefined}
            >
              <LogOut size={16} className="shrink-0 text-[#8a7a76]" />
              {!isCollapsed && <span className="min-w-[120px] shrink-0 text-left">Logout</span>}
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#f0e7e3] bg-[#fffdfa] px-5 sm:px-8">
            <div className="flex items-center gap-3 xl:hidden">
              <button type="button" className="text-[#7d6a64]">
                <Menu size={18} />
              </button>
              <Image src="/campaign-manager/images/logo_h.png" alt="HOPECARD" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
              <span className="text-[18px] font-extrabold tracking-[-0.03em] text-[#b25649]">HOPECARD</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden h-10 w-[250px] items-center gap-2 rounded-full bg-[#faf7f5] px-4 md:flex">
                <Search size={15} className="text-[#b5a8a4]" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-[13px] text-[#7b6c68] outline-none placeholder:text-[#b8aca8]"
                />
              </div>
              <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full text-[#7f6b66]">
                <Bell size={16} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-6 sm:px-8 lg:px-10">{children}</div>
          </div>
        </section>
      </div>

      {showLogoutModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d201d]/35 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_24px_70px_rgba(61,34,29,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-extrabold text-[#352826]">You are about to logout</h2>
                <p className="mt-2 text-[14px] leading-6 text-[#87736e]">
                  Your current frontend session will end and you will be returned to the login page.
                </p>
              </div>
              <button type="button" onClick={() => setShowLogoutModal(false)} className="text-[#a18e89]">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="rounded-full border border-[#eedfdb] px-5 py-2.5 text-[13px] font-bold text-[#7b6763]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
                  router.push('/campaign-manager/login');
                }}
                className="rounded-full bg-[#b55247] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
