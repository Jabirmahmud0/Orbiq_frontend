"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Settings, User, Lock, Bell, Save, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

type Tab = "profile" | "security" | "notifications";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile form
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Security form
  const [securityForm, setSecurityForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [savingSecurity, setSavingSecurity] = useState(false);

  // Notifications (local only — persisted in localStorage)
  const [notifications, setNotifications] = useState({
    loginAlerts: true,
    permissionChanges: true,
    systemUpdates: false,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
    const stored = localStorage.getItem("obliq_notifications");
    if (stored) {
      try { setNotifications(JSON.parse(stored)); } catch {}
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await apiClient.patch(`/users/${user?.id}`, {
        first_name: profileForm.firstName,
        last_name: profileForm.lastName,
      });
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (securityForm.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    setSavingSecurity(true);
    try {
      await apiClient.patch(`/users/${user?.id}`, {
        password: securityForm.newPassword,
        current_password: securityForm.currentPassword,
      });
      toast.success("Password changed successfully");
      setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    const next = { ...notifications, [key]: value };
    setNotifications(next);
    localStorage.setItem("obliq_notifications", JSON.stringify(next));
    toast.success("Preference saved");
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary text-sm">Manage your account preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Tab Nav */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSave} className="space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  {user?.firstName?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-text-secondary capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">First Name</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-text-secondary cursor-not-allowed"
                />
                <p className="text-xs text-text-secondary mt-1">Email cannot be changed. Contact an admin.</p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-dark flex items-center gap-2" loading={savingProfile} disabled={savingProfile}>
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-text-primary mb-4">Change Password</h3>
                {[
                  { key: "current" as const, label: "Current Password", field: "currentPassword" as const },
                  { key: "new" as const, label: "New Password", field: "newPassword" as const },
                  { key: "confirm" as const, label: "Confirm New Password", field: "confirmPassword" as const },
                ].map(({ key, label, field }) => (
                  <div key={key} className="mb-4">
                    <label className="block text-sm font-medium text-text-primary mb-1">{label}</label>
                    <div className="relative">
                      <input
                        type={showPasswords[key] ? "text" : "password"}
                        value={securityForm[field]}
                        onChange={(e) => setSecurityForm(f => ({ ...f, [field]: e.target.value }))}
                        className="w-full border border-border rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(p => ({ ...p, [key]: !p[key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                      >
                        {showPasswords[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                  <p className="font-medium mb-1">Password requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    <li>Minimum 8 characters</li>
                    <li>Use a mix of letters, numbers, and symbols for best security</li>
                  </ul>
                </div>

                <div className="flex justify-end mt-4">
                  <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-dark flex items-center gap-2" loading={savingSecurity} disabled={savingSecurity}>
                    <Lock className="w-4 h-4" /> Update Password
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-5">
              <p className="text-sm text-text-secondary">Choose what notifications you want to receive.</p>

              {[
                { key: "loginAlerts" as const, label: "Login Alerts", desc: "Get notified when your account is logged in from a new location" },
                { key: "permissionChanges" as const, label: "Permission Changes", desc: "Notify me when my permissions are updated by an admin" },
                { key: "systemUpdates" as const, label: "System Updates", desc: "Receive announcements about system maintenance and updates" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{label}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationChange(key, !notifications[key])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      notifications[key] ? "bg-primary" : "bg-gray-200"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      notifications[key] ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
