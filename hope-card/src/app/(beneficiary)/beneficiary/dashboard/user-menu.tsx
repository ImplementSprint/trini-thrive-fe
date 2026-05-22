"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type UserMenuProps = {
  displayName: string;
  logoutAction: () => Promise<void>;
};

export function UserMenu({ displayName, logoutAction }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Get initials from display name
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center space-x-2 text-sm font-medium transition hover:opacity-80"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="hidden sm:inline">{displayName}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-[#A64D4D]">
          {getInitials(displayName)}
        </div>
        <ChevronDown
          className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg bg-white py-2 text-sm text-gray-700 shadow-xl">
          <form action={logoutAction}>
            <button
              type="submit"
              className="block w-full px-4 py-2 text-left font-medium transition hover:text-red-600"
            >
              Logout
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
