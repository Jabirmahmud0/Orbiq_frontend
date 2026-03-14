"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/api";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Shield, Ban, Play, Trash2, Plus, X, ChevronDown, Search } from "lucide-react";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  status: string;
  lastLoginAt?: string;
  role: string;
}

interface CreateUserForm {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: string;
}

interface Role {
  id: string;
  name: string;
}

export default function UsersPage() {
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateUserForm>({
    email: "", password: "", first_name: "", last_name: "", role_id: "",
  });

  const canManage = hasPermission("manage:users");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);
      if (statusFilter) params.append("status", statusFilter);
      const res = await apiClient.get<{ data: any[]; total: number }>(`/users?${params}`);
      const mapped = res.data.data.map((u: any) => ({
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        avatarUrl: u.avatar_url,
        status: u.status,
        lastLoginAt: u.last_login_at,
        role: u.role?.name || u.role,
      }));
      setUsers(mapped);
      setTotal(res.data.total);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await apiClient.get("/roles");
      setRoles(res.data || []);
    } catch {}
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter, statusFilter]);
  useEffect(() => { fetchRoles(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleStatusChange = async (user: User, newStatus: string) => {
    if (!canManage) return;
    try {
      await apiClient.patch(`/users/${user.id}/status`, { status: newStatus });
      const labels: Record<string, string> = { active: "reinstated", suspended: "suspended", banned: "banned" };
      toast.success(`User ${labels[newStatus] || newStatus} successfully`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change user status");
    } finally {
      setOpenMenu(null);
    }
  };

  const handleDelete = async (user: User) => {
    if (!canManage) return;
    if (!confirm(`Delete ${user.firstName} ${user.lastName}? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/users/${user.id}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setOpenMenu(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.first_name || !form.last_name || !form.role_id) {
      return toast.error("All fields are required");
    }
    if (form.password.length < 8) {
      return toast.error("Password must be at least 8 characters long");
    }
    if (!/(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      return toast.error("Password must contain at least one uppercase letter and one number");
    }
    setSubmitting(true);
    try {
      await apiClient.post("/users", { ...form, password: form.password });
      toast.success("User created successfully");
      setShowCreateModal(false);
      setForm({ email: "", password: "", first_name: "", last_name: "", role_id: "" });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      suspended: "bg-yellow-100 text-yellow-700",
      banned: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <p className="text-text-secondary text-sm">Manage users, roles, and permissions</p>
        </div>
        {canManage && (
          <Button
            variant="primary"
            className="bg-primary hover:bg-primary-dark flex items-center gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" /> Add User
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">All Roles</option>
            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
          <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-dark shrink-0">Search</Button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border">
        <div className="overflow-visible w-full min-w-[800px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-secondary">
                <th className="py-4 px-6 font-semibold">User</th>
                <th className="py-4 px-6 font-semibold">Role</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold">Last Login</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-text-secondary">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-text-secondary">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar fallback={user.firstName?.charAt(0) || "?"} src={user.avatarUrl} size="md" />
                        <div>
                          <p className="font-medium text-text-primary">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-text-secondary">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {canManage && (
                        <div className="flex items-center justify-end gap-1 relative">
                          {/* Permissions */}
                          <Link href={`/users/${user.id}`}>
                            <button className="p-2 text-text-secondary hover:text-primary transition-colors rounded-lg hover:bg-primary/10" title="Manage Permissions">
                              <Shield className="w-4 h-4" />
                            </button>
                          </Link>

                          {/* Status Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                              className="p-2 text-text-secondary hover:text-primary transition-colors rounded-lg hover:bg-primary/10 flex items-center gap-1"
                              title="Change Status"
                            >
                              {user.status === "active" ? <Ban className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            {openMenu === user.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl border border-border shadow-lg z-20 overflow-hidden">
                                  {user.status !== "active" && (
                                    <button
                                      onClick={() => handleStatusChange(user, "active")}
                                      className="w-full text-left px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                                    >
                                      <Play className="w-4 h-4" /> Reinstate
                                    </button>
                                  )}
                                  {user.status !== "suspended" && (
                                    <button
                                      onClick={() => handleStatusChange(user, "suspended")}
                                      className="w-full text-left px-4 py-2.5 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2"
                                    >
                                      <Ban className="w-4 h-4" /> Suspend
                                    </button>
                                  )}
                                  {user.status !== "banned" && (
                                    <button
                                      onClick={() => handleStatusChange(user, "banned")}
                                      className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Ban className="w-4 h-4" /> Ban
                                    </button>
                                  )}
                                  <hr className="border-border" />
                                  <button
                                    onClick={() => handleDelete(user)}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" /> Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 10 && (
          <div className="p-4 border-t border-border flex justify-between items-center bg-surface">
            <span className="text-sm text-text-secondary">
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total} users
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">Create New User</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">First Name *</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm(f => ({ ...f, first_name: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm(f => ({ ...f, last_name: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Role *</label>
                <select
                  value={form.role_id}
                  onChange={(e) => setForm(f => ({ ...f, role_id: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">Select a role...</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-dark" loading={submitting} disabled={submitting}>
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
