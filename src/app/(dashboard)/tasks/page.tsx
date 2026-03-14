"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { CheckSquare, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import toast from "react-hot-toast";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assignee?: { first_name: string; last_name: string };
  creator?: { first_name: string; last_name: string };
  created_at: string;
}

interface CreateTaskForm {
  title: string;
  description: string;
  priority: string;
  due_date: string;
}

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  in_review: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-orange-100 text-orange-600",
  high: "bg-red-100 text-red-700",
  urgent: "bg-purple-100 text-purple-700",
};

export default function TasksPage() {
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateTaskForm>({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  });

  const canManage = hasPermission("manage:tasks");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (statusFilter) params.append("status", statusFilter);
      const res = await apiClient.get(`/tasks?${params}`);
      setTasks(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    setSubmitting(true);
    try {
      await apiClient.post("/tasks", { ...form, due_date: form.due_date || undefined });
      toast.success("Task created successfully");
      setShowCreateModal(false);
      setForm({ title: "", description: "", priority: "medium", due_date: "" });
      fetchTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (!canManage) return;
    try {
      await apiClient.patch(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success("Status updated");
      fetchTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!canManage) return;
    if (!confirm("Delete this task?")) return;
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      toast.success("Task deleted");
      fetchTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete task");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tasks</h1>
          <p className="text-text-secondary text-sm">Track and manage team tasks</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {canManage && (
            <Button
              variant="primary"
              className="bg-primary hover:bg-primary-dark flex items-center gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" /> Create Task
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
                <th className="py-4 px-6 font-semibold">Task</th>
                <th className="py-4 px-6 font-semibold">Priority</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold">Assignee</th>
                <th className="py-4 px-6 font-semibold">Due Date</th>
                {canManage && <th className="py-4 px-6 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-text-secondary">Loading tasks...</td></tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <CheckSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-text-secondary">No tasks found.</p>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-text-primary">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-text-secondary mt-0.5 truncate max-w-xs">{task.description}</p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${PRIORITY_COLORS[task.priority] || "bg-gray-100 text-gray-600"}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {canManage ? (
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-1 focus:ring-primary cursor-pointer ${STATUS_COLORS[task.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="in_review">In Review</option>
                          <option value="done">Done</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[task.status] || "bg-gray-100 text-gray-600"}`}>
                          {task.status?.replace("_", " ")}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary">
                      {task.assignee ? `${task.assignee.first_name} ${task.assignee.last_name}` : "—"}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}
                    </td>
                    {canManage && (
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-2 text-text-secondary hover:text-red-600 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
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
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">Create Task</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Task title"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Task description (optional)"
                  rows={3}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-dark" loading={submitting} disabled={submitting}>
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
