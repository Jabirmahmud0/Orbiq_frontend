"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowLeft, Shield, Check, X, Lock, Unlock } from "lucide-react";
import toast from "react-hot-toast";

interface Permission {
  id: string;
  atom: string;
  label: string;
  description?: string;
  module: string;
}

interface UserPermission {
  id: string;
  permission_id: string;
  is_revoked: boolean;
  permission: Permission;
}

interface EffectivePermsResponse {
  role: Permission[];
  user: UserPermission[];
  effective: { atom: string }[];
}

interface UserDetail {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  status: string;
  role: { id: string; name: string; level: number };
  manager?: { first_name: string; last_name: string };
}

export default function UserPermissionsPage() {
  const { id: userId } = useParams<{ id: string }>();
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [userPerms, setUserPerms] = useState<UserPermission[]>([]);
  const [effectiveAtoms, setEffectiveAtoms] = useState<Set<string>>(new Set());
  const [roleAtoms, setRoleAtoms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const canManage = hasPermission("manage:permissions");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [userRes, allPermsRes, userPermsRes] = await Promise.all([
        apiClient.get(`/users/${userId}`),
        apiClient.get("/permissions"),
        apiClient.get(`/users/${userId}/permissions`),
      ]);

      setUserDetail(userRes.data);
      setAllPermissions(allPermsRes.data || []);

      const permsData: EffectivePermsResponse = userPermsRes.data;
      setUserPerms(permsData.user || []);
      setEffectiveAtoms(new Set((permsData.effective || []).map((p: { atom: string }) => p.atom)));
      setRoleAtoms(new Set((permsData.role || []).map((p: Permission) => p.atom)));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userId) fetchAll(); }, [userId]);

  const handleToggle = async (permission: Permission) => {
    if (!canManage) return toast.error("You don't have permission to manage permissions");
    setToggling(permission.id);

    const existingUserPerm = userPerms.find(up => up.permission_id === permission.id || up.permission?.id === permission.id);
    const isCurrentlyEffective = effectiveAtoms.has(permission.atom);
    const isRolePerm = roleAtoms.has(permission.atom);

    try {
      if (isCurrentlyEffective) {
        // Revoke it
        if (existingUserPerm && !existingUserPerm.is_revoked) {
          await apiClient.delete(`/users/${userId}/permissions/${permission.id}`);
        } else if (isRolePerm) {
          // Need to explicitly revoke a role-based permission
          await apiClient.delete(`/users/${userId}/permissions/${permission.id}`);
        }
        toast.success(`Revoked: ${permission.label}`);
      } else {
        // Grant it
        await apiClient.post(`/users/${userId}/permissions`, { permissionId: permission.id });
        toast.success(`Granted: ${permission.label}`);
      }
      await fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update permission");
    } finally {
      setToggling(null);
    }
  };

  // Group permissions by module
  const permsByModule = allPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  if (loading) {
    return <div className="py-16 text-center text-text-secondary animate-pulse">Loading...</div>;
  }

  if (!userDetail) {
    return (
      <div className="py-16 text-center">
        <p className="text-text-secondary">User not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* User Card */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar size="lg" fallback={userDetail.first_name?.charAt(0) || "?"} src={userDetail.avatar_url} />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text-primary">
              {userDetail.first_name} {userDetail.last_name}
            </h1>
            <p className="text-text-secondary text-sm">{userDetail.email}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                {userDetail.role?.name || "—"}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                userDetail.status === "active" ? "bg-green-100 text-green-700" :
                userDetail.status === "suspended" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {userDetail.status}
              </span>
              {userDetail.manager && (
                <span className="text-xs text-text-secondary">
                  Manager: {userDetail.manager.first_name} {userDetail.manager.last_name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Shield className="w-4 h-4 text-primary" />
            <span>{effectiveAtoms.size} active permissions</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10 flex items-center justify-center">
            <Check className="w-3 h-3 text-primary" />
          </div>
          <span>Effective (active)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10 flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-primary" />
          </div>
          <span>From role (inherited)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-border bg-white" />
          <span>Not granted</span>
        </div>
        {!canManage && (
          <span className="text-yellow-600 font-medium">⚠️ You need manage:permissions to edit</span>
        )}
      </div>

      {/* Permission Grid by Module */}
      <div className="space-y-4">
        {Object.entries(permsByModule).sort().map(([module, perms]) => (
          <div key={module} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-surface border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-text-primary capitalize">{module}</h2>
              <span className="text-xs text-text-secondary">
                {perms.filter(p => effectiveAtoms.has(p.atom)).length}/{perms.length} granted
              </span>
            </div>
            <div className="divide-y divide-border">
              {perms.map((perm) => {
                const isEffective = effectiveAtoms.has(perm.atom);
                const isFromRole = roleAtoms.has(perm.atom);
                const isLoading = toggling === perm.id;

                return (
                  <div
                    key={perm.id}
                    className={`flex items-center justify-between px-6 py-4 transition-colors ${
                      isEffective ? "bg-primary/5" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
                        isEffective ? "bg-primary/10 border-primary" : "border-border bg-white"
                      }`}>
                        {isEffective && (
                          isFromRole
                            ? <Lock className="w-2.5 h-2.5 text-primary" />
                            : <Check className="w-3 h-3 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{perm.label}</p>
                        <p className="text-xs font-mono text-text-secondary mt-0.5">{perm.atom}</p>
                        {perm.description && (
                          <p className="text-xs text-text-secondary mt-0.5">{perm.description}</p>
                        )}
                        {isFromRole && isEffective && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-1 rounded text-xs bg-blue-50 text-blue-600">
                            <Lock className="w-2.5 h-2.5" /> Inherited from role
                          </span>
                        )}
                      </div>
                    </div>

                    {canManage && (
                      <button
                        onClick={() => handleToggle(perm)}
                        disabled={isLoading}
                        title={isEffective ? "Click to revoke" : "Click to grant"}
                        className={`relative ml-4 inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 flex-shrink-0 ${
                          isEffective ? "bg-primary" : "bg-gray-200"
                        }`}
                      >
                        {isLoading ? (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                          </span>
                        ) : (
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                            isEffective ? "translate-x-6" : "translate-x-1"
                          }`} />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(permsByModule).length === 0 && (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-text-secondary">No permissions configured in the system</p>
          </div>
        )}
      </div>
    </div>
  );
}
