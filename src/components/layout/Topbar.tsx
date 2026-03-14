"use client";

import React from "react";
import { authStore } from "@/store/authStore";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { Menu } from "lucide-react";

interface TopbarProps {
  onMenuClick?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user } = authStore();
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Hamburger & Page title */}
      <div className="flex items-center space-x-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary focus:outline-none"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl md:text-heading font-bold text-text-primary hidden sm:block">
          Welcome back, {user?.firstName}!
        </h1>
        <h1 className="text-xl font-bold text-text-primary sm:hidden">
          Obliq
        </h1>
      </div>

      {/* Right: User menu */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button
          className="relative p-2 text-text-secondary hover:text-text-primary"
          aria-label="Notifications"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 focus:outline-none"
            aria-label="User menu"
            aria-expanded={showDropdown}
          >
            <Avatar size="md" fallback={user?.firstName?.charAt(0) || "?"} />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-surface rounded-card shadow-lg border border-border z-20 py-1">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text-primary">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-text-secondary">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
