"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { UserCircle, Ticket, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface TicketData {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  assignee?: { first_name: string; last_name: string };
}

const STATUS_STYLES: Record<string, { color: string; icon: React.ReactNode }> = {
  open: { color: "bg-blue-100 text-blue-700", icon: <AlertCircle className="w-3 h-3" /> },
  in_progress: { color: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3 h-3" /> },
  resolved: { color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> },
  closed: { color: "bg-gray-100 text-gray-600", icon: <CheckCircle2 className="w-3 h-3" /> },
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-orange-100 text-orange-600",
  high: "bg-red-100 text-red-700",
};

export default function CustomerPortalPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (statusFilter) params.append("status", statusFilter);
      const res = await apiClient.get(`/customer-portal/tickets?${params}`);
      setTickets(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      // If no tickets yet, show empty state gracefully
      if (err.response?.status !== 404) {
        toast.error(err.response?.data?.message || "Failed to fetch tickets");
      }
      setTickets([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [page, statusFilter]);

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <UserCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Customer Portal</h1>
            <p className="text-white/80 mt-1">Welcome, {user?.firstName}. Manage your support tickets here.</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{openCount}</p>
            <p className="text-sm text-text-secondary">Open Tickets</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{inProgressCount}</p>
            <p className="text-sm text-text-secondary">In Progress</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{resolvedCount}</p>
            <p className="text-sm text-text-secondary">Resolved</p>
          </div>
        </div>
      </div>

      {/* Tickets */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-border gap-3">
          <h2 className="text-base font-semibold text-text-primary">Your Support Tickets</h2>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-xs uppercase tracking-wider text-text-secondary">
                <th className="py-4 px-6 font-semibold">Subject</th>
                <th className="py-4 px-6 font-semibold">Priority</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold">Assigned To</th>
                <th className="py-4 px-6 font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-text-secondary">Loading tickets...</td></tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Ticket className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-text-secondary font-medium">No tickets found</p>
                    <p className="text-text-secondary text-sm mt-1">Contact support to open a new ticket</p>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => {
                  const st = STATUS_STYLES[ticket.status] || { color: "bg-gray-100 text-gray-600", icon: null };
                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-medium text-text-primary">{ticket.subject}</p>
                        <p className="text-xs text-text-secondary font-mono mt-0.5">{ticket.id.slice(0, 8)}…</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${PRIORITY_STYLES[ticket.priority] || "bg-gray-100 text-gray-600"}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${st.color}`}>
                          {st.icon}{ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-text-secondary">
                        {ticket.assignee ? `${ticket.assignee.first_name} ${ticket.assignee.last_name}` : "—"}
                      </td>
                      <td className="py-4 px-6 text-sm text-text-secondary">
                        {new Date(ticket.updated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 10 && (
          <div className="p-4 border-t border-border flex justify-between items-center bg-surface">
            <span className="text-sm text-text-secondary">
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
