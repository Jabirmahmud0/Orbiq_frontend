"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/constants/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { Avatar } from "@/components/ui/Avatar";
import { authStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, X } from "lucide-react";

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const { user } = authStore();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  }, [pathname]);

  // Filter nav items by permissions
  const visibleNavItems = NAV_ITEMS.filter((item) => hasPermission(item.atom));

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-full bg-sidebar text-sidebar-text transition-all duration-300 z-50
          ${collapsed ? "w-sidebarCollapsed hidden lg:block" : "w-sidebar"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden absolute top-4 right-4 text-white hover:text-white/80"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-primary font-bold text-lg">O</span>
            </div>
            {!collapsed && (
              <span className="font-logo text-xl font-bold">ObliQ</span>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="mt-6 px-3">
          {visibleNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                flex items-center px-3 py-3 rounded-lg mb-2 transition-colors
                ${isActive
                    ? "bg-sidebar-active text-white"
                    : "text-white/80 hover:bg-sidebar-active hover:text-white"
                  }
              `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/20 bg-sidebar">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center overflow-hidden">
              <Avatar size="md" fallback={user?.firstName?.charAt(0) || "?"} />
              {!collapsed && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium truncate text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-white/60 truncate capitalize">
                    {user?.role}
                  </p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={logout}
                className="text-white/60 hover:text-white transition-colors p-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>

          {collapsed && (
            <div className="px-4 pb-4 flex justify-center">
              <button
                onClick={logout}
                className="text-white/60 hover:text-white transition-colors p-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-white rounded-full p-1 shadow-md text-primary"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </aside>
    </>
  );
};
