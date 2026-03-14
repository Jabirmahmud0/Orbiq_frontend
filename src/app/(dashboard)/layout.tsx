"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loadUser, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      loadUser();
    }
  }, [isAuthenticated, user]);

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text-secondary">Loading your workspace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar isMobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="lg:pl-sidebar flex flex-col min-h-screen transition-all">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
