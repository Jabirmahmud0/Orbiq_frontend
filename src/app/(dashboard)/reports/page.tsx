"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { BarChart2, Download, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface ReportSummary {
  usersByRole: Record<string, number>;
  leadsByStatus: Record<string, number>;
  tasksOverTime: { date: string; count: number }[];
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-text-primary capitalize">{label.replace(/_/g, " ")}</span>
        <span className="font-semibold text-text-primary">{value}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const LEAD_COLORS: Record<string, string> = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  qualified: "bg-orange-500",
  proposal: "bg-purple-500",
  won: "bg-green-500",
  lost: "bg-red-500",
};

const ROLE_COLORS = ["bg-primary", "bg-blue-400", "bg-green-500", "bg-orange-400"];

export default function ReportsPage() {
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportSummary | null>(null);
  const [exporting, setExporting] = useState(false);

  const canExport = hasPermission("export:reports");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/reports/summary");
      setData(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleExport = async (type: string) => {
    if (!canExport) return;
    setExporting(true);
    try {
      const res = await apiClient.get(`/reports/export?type=${type}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type} data exported`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-text-secondary">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading reports...
        </div>
      </div>
    );
  }

  const totalLeads = Object.values(data?.leadsByStatus || {}).reduce((a, b) => a + b, 0);
  const totalUsers = Object.values(data?.usersByRole || {}).reduce((a, b) => a + b, 0);
  const totalDone = data?.tasksOverTime?.reduce((a, b) => a + b.count, 0) || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
          <p className="text-text-secondary text-sm">Analytics and business insights</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={fetchData} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          {canExport && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleExport("leads")} disabled={exporting} className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Export Leads
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("users")} disabled={exporting} className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Export Users
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("tasks")} disabled={exporting} className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Export Tasks
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Total Users</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{totalUsers}</p>
          <p className="text-xs text-blue-500 mt-1">Across all roles</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-600 font-medium">Total Leads</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{totalLeads}</p>
          <p className="text-xs text-green-500 mt-1">In pipeline</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-purple-600 font-medium">Tasks Completed</p>
          <p className="text-3xl font-bold text-purple-700 mt-1">{totalDone}</p>
          <p className="text-xs text-purple-500 mt-1">Marked as done</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-base font-semibold text-text-primary mb-5">Users by Role</h2>
          {totalUsers === 0 ? (
            <p className="text-text-secondary text-sm text-center py-6">No user data available</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(data?.usersByRole || {}).map(([role, count], i) => (
                <StatBar key={role} label={role} value={count} max={totalUsers} color={ROLE_COLORS[i % ROLE_COLORS.length]} />
              ))}
            </div>
          )}
        </div>

        {/* Leads by Status */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-base font-semibold text-text-primary mb-5">Leads by Status</h2>
          {totalLeads === 0 ? (
            <p className="text-text-secondary text-sm text-center py-6">No lead data available</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(data?.leadsByStatus || {}).map(([status, count]) => (
                <StatBar key={status} label={status} value={count} max={totalLeads} color={LEAD_COLORS[status] || "bg-gray-400"} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tasks Over Time Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">Tasks Completed Over Time</h2>
          <p className="text-sm text-text-secondary mt-1">Daily task completion history</p>
        </div>
        {!data?.tasksOverTime || data.tasksOverTime.length === 0 ? (
          <div className="py-12 text-center">
            <BarChart2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-text-secondary text-sm">No completion data yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface text-xs uppercase tracking-wider text-text-secondary">
                  <th className="py-3 px-6 font-semibold">Date</th>
                  <th className="py-3 px-6 font-semibold">Tasks Completed</th>
                  <th className="py-3 px-6 font-semibold">Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.tasksOverTime.slice(-14).map((row) => {
                  const maxCount = Math.max(...data.tasksOverTime.map(r => r.count), 1);
                  const pct = Math.round((row.count / maxCount) * 100);
                  return (
                    <tr key={row.date} className="hover:bg-gray-50">
                      <td className="py-3 px-6 text-sm text-text-primary">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="py-3 px-6 text-sm font-semibold text-text-primary">{row.count}</td>
                      <td className="py-3 px-6">
                        <div className="w-full max-w-xs bg-gray-100 rounded-full h-2">
                          <div className="h-2 bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
