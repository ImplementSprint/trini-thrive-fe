"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface CitizenHeaderProps {
  phase: "before" | "during" | "after";
  onProfileClick?: () => void;
}

const CitizenHeader: React.FC<CitizenHeaderProps> = ({ phase, onProfileClick }) => {
  const isEmergency = phase === "during";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full px-8 py-4 flex justify-between items-center bg-[#fafaf5]/80 dark:bg-[#1a1c19]/80 backdrop-blur-md border-b border-[#dadad5] dark:border-[#3b3b3b]">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search resources, shelters..." 
            className="bg-[#eeeeea] dark:bg-[#232622] dark:text-[#e2e3dd] border-none rounded-2xl px-6 py-3 text-sm w-72 focus:ring-2 transition-all outline-none"
            style={{ ringColor: isEmergency ? "#FFB300" : "#2E7D32" } as any}
          />
          <span className="material-symbols-outlined absolute right-4 top-3 text-[#707a6c] dark:text-[#c4c7c0] opacity-50">search</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            isEmergency 
              ? "bg-red-500/10 border-red-500/30 text-red-500" 
              : "bg-green-500/10 border-green-500/30 text-green-700"
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${isEmergency ? "bg-red-500" : "bg-green-600"}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isEmergency ? "Critical Advisory" : "System Secure"}
            </span>
          </div>
        </div>

        <button className="relative w-10 h-10 rounded-xl bg-white dark:bg-[#232622] border border-[#dadad5] dark:border-[#3b3b3b] flex items-center justify-center hover:border-[#2E7D32] transition-all group">
          <span className="material-symbols-outlined text-[#444743] dark:text-[#c4c7c0] group-hover:scale-110 transition-transform">notifications</span>
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#232622]" />
        </button>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-4 border-l border-[#dadad5] dark:border-[#3b3b3b] hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-black text-[#1a1c19] dark:text-[#e2e3dd]">Elena Villacruz</p>
              <p className="text-[10px] font-bold text-[#707a6c] dark:text-[#c4c7c0] uppercase tracking-widest">Brgy. 102, Dist 4</p>
            </div>
            <div className={`w-10 h-10 rounded-xl overflow-hidden border-2 shadow-md transition-all ${isProfileOpen ? "border-[#2E7D32]" : "border-white dark:border-[#232622]"}`}>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5o43MJlKk8bFumbe-kD--UwuoZpPYmQe13R3y_AruXj4fEkC5rsNLjsVpCnlJch4n3eAK6DOantbCAO4H0NxLI_QM2cwka9ht_-BobRE4JMDVEZNxPkeB7ETtlrSQKx9a4ZpsTuZCM3W4kfGoLIhLnvbd5PCT9NIjS-OcjyZELEQnYcn6codRevDEiY7M8cQFuMbDgnuEqj_XeYoZuLTlONTm_G7U6hmjKX3dgBjK4En5LrN2MPLVVtDJBbUIusSkbWnK6V5duC-W" 
                alt="Elena Villacruz" 
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-4 w-64 bg-white/95 dark:bg-[#232622]/95 backdrop-blur-xl rounded-[2.5rem] border border-[#dadad5] dark:border-[#3b3b3b] shadow-2xl py-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="px-8 pb-4 border-b border-[#dadad5]/50 dark:border-[#3b3b3b]/50">
                <p className="text-lg font-black text-[#1a1c19] dark:text-[#e2e3dd]">Elena Villacruz</p>
                <p className="text-[10px] font-bold text-[#707a6c] dark:text-[#c4c7c0] uppercase tracking-[0.2em] mt-1">Brgy. 102, Dist 4</p>
              </div>
              
              <div className="p-3 space-y-1">
                <button 
                  onClick={toggleDarkMode}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-[#f4f4ef] dark:hover:bg-white/5 transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 bg-[#E3F2FD] dark:bg-[#2196F3]/20">
                    <span className="material-symbols-outlined text-2xl text-[#2196F3]">
                      {isDarkMode ? "light_mode" : "dark_mode"}
                    </span>
                  </div>
                  <span className="text-base font-black text-[#1a1c19] dark:text-[#e2e3dd]">
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                </button>

                <button 
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onProfileClick) onProfileClick();
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-[#f4f4ef] dark:hover:bg-white/5 transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 bg-[#E8F5E9] dark:bg-[#2E7D32]/20">
                    <span className="material-symbols-outlined text-2xl text-[#2E7D32]">person</span>
                  </div>
                  <span className="text-base font-black text-[#1a1c19] dark:text-[#e2e3dd]">View Profile</span>
                </button>

                <button 
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Add logic to navigate to edit profile if needed
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-[#f4f4ef] dark:hover:bg-white/5 transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 bg-[#FFF8E1] dark:bg-[#FFB300]/20">
                    <span className="material-symbols-outlined text-2xl text-[#FFB300]">edit</span>
                  </div>
                  <span className="text-base font-black text-[#1a1c19] dark:text-[#e2e3dd]">Edit Profile</span>
                </button>
              </div>

              <div className="mt-2 pt-2 border-t border-[#dadad5]/50 dark:border-[#3b3b3b]/50 px-3">
                <Link href="/citizen/login" className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group text-left">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-[#FFEBEE] dark:bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl text-red-600">logout</span>
                  </div>
                  <span className="text-base font-black text-red-600">Sign Out</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CitizenHeader;
