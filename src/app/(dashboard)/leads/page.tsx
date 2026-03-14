"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { Target, Edit2, Trash2, Plus, X } from "lucide-react";
import toast from "react-hot-toast";

interface Lead {
  id: string;
  name: string;
  contact: string;
  status: string;
  source?: string;
  created_at: string;
}

interface CreateLeadForm {
  name: string;
  contact: string;
  source: string;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-purple-100 text-purple-800",
  contacted: "bg-blue-100 text-blue-700",
  qualified: "bg-green-100 text-green-700",
  converted: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
};

export default function LeadsPage() {
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<CreateLeadForm>({
    name: "",
    contact: "",
    source: "website",
    status: "new",
  });

  const canManageLeads = hasPermission("manage:leads");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/leads?page=${page}&limit=10`);
      setLeads(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    setSubmitting(true);
    try {
      await apiClient.post("/leads", {
        ...form,
        contact: form.contact || undefined,
        source: form.source || undefined,
      });
      toast.success("Lead created successfully");
      setShowCreateModal(false);
      setForm({ name: "", contact: "", source: "website", status: "new" });
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create lead");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!canManageLeads) return;
    if (!confirm("Delete lead?")) return;

    try {
      await apiClient.delete(`/leads/${leadId}`);
      toast.success("Lead deleted successfully");
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete lead");
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    if (!canManageLeads) return;
    try {
      await apiClient.patch(`/leads/${leadId}`, { status: newStatus });
      toast.success("Status updated");
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead);
    setForm({
      name: lead.name,
      contact: lead.contact || "",
      source: lead.source || "website",
      status: lead.status,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead || !form.name.trim()) return toast.error("Name is required");
    setSubmitting(true);
    try {
      await apiClient.patch(`/leads/${editingLead.id}`, {
        ...form,
        contact: form.contact || undefined,
        source: form.source || undefined,
      });
      toast.success("Lead updated successfully");
      setShowEditModal(false);
      setEditingLead(null);
      setForm({ name: "", contact: "", source: "website", status: "new" });
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update lead");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Leads</h1>
          <p className="text-text-secondary text-sm">Manage potential customers</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {canManageLeads && (
            <Button
              variant="primary"
              className="bg-primary hover:bg-primary-dark flex items-center gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" /> Create Lead
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border">
        <div className="overflow-visible w-full min-w-[800px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-secondary">
                <th className="py-4 px-6 font-semibold">Name</th>
                <th className="py-4 px-6 font-semibold">Contact</th>
                <th className="py-4 px-6 font-semibold">Source</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-secondary">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-text-secondary">No leads found.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-text-primary">
                      {lead.name}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary">
                      {lead.contact || "-"}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary capitalize">
                      {lead.source || "-"}
                    </td>
                    <td className="py-4 px-6">
                      {canManageLeads ? (
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-1 focus:ring-primary cursor-pointer ${STATUS_COLORS[lead.status?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[lead.status?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
                          {lead.status || "New"}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {canManageLeads && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(lead)}
                            className="p-2 text-text-secondary hover:text-primary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-2 text-text-secondary hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">Create Lead</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Lead name"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Contact</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm(f => ({ ...f, contact: e.target.value }))}
                  placeholder="Email or phone (optional)"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Source</label>
                  <select
                    value={form.source}
                    onChange={(e) => setForm(f => ({ ...f, source: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social">Social Media</option>
                    <option value="email">Email</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-dark" loading={submitting} disabled={submitting}>
                  Create Lead
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">Edit Lead</h2>
              <button onClick={() => setShowEditModal(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Lead name"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Contact</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm(f => ({ ...f, contact: e.target.value }))}
                  placeholder="Email or phone (optional)"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Source</label>
                  <select
                    value={form.source}
                    onChange={(e) => setForm(f => ({ ...f, source: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social">Social Media</option>
                    <option value="email">Email</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-dark" loading={submitting} disabled={submitting}>
                  Update Lead
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
