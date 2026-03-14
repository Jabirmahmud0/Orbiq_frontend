"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Clipboard, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";

interface AuditLogEntry {
  id: string;
  action: string;
  actor_id: string;
  actor?: { first_name: string; last_name: string; email: string };
  target_type?: string;
  target_id?: string;
  ip_address?: string;
  payload?: Record<string, any>;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  "auth.login": "bg-green-100 text-green-700",
  "auth.logout": "bg-gray-100 text-gray-600",
  "auth.login_failed": "bg-red-100 text-red-700",
  "auth.password_reset_request": "bg-yellow-100 text-yellow-700",
  "auth.password_reset_complete": "bg-blue-100 text-blue-700",
  "user.created": "bg-primary/10 text-primary",
  "user.updated": "bg-purple-100 text-purple-700",
  "user.deleted": "bg-red-100 text-red-700",
  "user.status_changed": "bg-orange-100 text-orange-700",
  "permission.granted": "bg-green-100 text-green-700",
  "permission.revoked": "bg-red-100 text-red-700",
};

export default function AuditLogPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (actionFilter) params.append("action", actionFilter);
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      const res = await apiClient.get(`/audit-log?${params}`);
      setLogs(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, actionFilter, from, to]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const formatAction = (action: string) => action.replace(/\./g, " › ").replace(/_/g, " ");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Audit Log</h1>
        <p className="text-text-secondary text-sm">Append-only record of all system actions</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleFilter} className="bg-white rounded-xl border border-border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-text-secondary mb-1">Action</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                placeholder="Filter by action..."
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-text-secondary mb-1">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-text-secondary mb-1">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-dark flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4" /> Apply
          </Button>
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={() => { setActionFilter(""); setFrom(""); setTo(""); setPage(1); }}
          >
            Clear
          </Button>
        </div>
      </form>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-secondary">
                <th className="py-4 px-6 font-semibold">Timestamp</th>
                <th className="py-4 px-6 font-semibold">Action</th>
                <th className="py-4 px-6 font-semibold">Actor</th>
                <th className="py-4 px-6 font-semibold">Target</th>
                <th className="py-4 px-6 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-text-secondary">Loading audit logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Clipboard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-text-secondary">No audit logs found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-xs text-text-secondary whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600"}`}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-text-primary">
                      {log.actor
                        ? `${log.actor.first_name} ${log.actor.last_name}`
                        : log.actor_id
                        ? <span className="font-mono text-xs text-text-secondary">{log.actor_id.slice(0, 8)}…</span>
                        : <span className="text-text-secondary">—</span>
                      }
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary">
                      {log.target_type ? (
                        <span className="capitalize">{log.target_type}</span>
                      ) : "—"}
                    </td>
                    <td className="py-4 px-6 text-xs font-mono text-text-secondary">
                      {log.ip_address || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 20 && (
          <div className="p-4 border-t border-border flex justify-between items-center bg-surface">
            <span className="text-sm text-text-secondary">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
