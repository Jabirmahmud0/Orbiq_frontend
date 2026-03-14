"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/lib/api";

interface DashboardStats {
  totalUsers: number;
  activeAgents: number;
  openLeads: number;
  pendingTasks: number;
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    details?: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get("/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-text-secondary">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">Welcome back, {user?.firstName}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total Users"
          className="bg-gradient-to-br from-blue-50 to-blue-100"
        >
          <div className="text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</div>
          <p className="text-sm text-blue-500 mt-1">Registered users</p>
        </Card>

        <Card
          title="Active Agents"
          className="bg-gradient-to-br from-green-50 to-green-100"
        >
          <div className="text-3xl font-bold text-green-600">{stats?.activeAgents || 0}</div>
          <p className="text-sm text-green-500 mt-1">Available to assign</p>
        </Card>

        <Card
          title="Open Leads"
          className="bg-gradient-to-br from-orange-50 to-orange-100"
        >
          <div className="text-3xl font-bold text-orange-600">{stats?.openLeads || 0}</div>
          <p className="text-sm text-orange-500 mt-1">Need attention</p>
        </Card>

        <Card
          title="Pending Tasks"
          className="bg-gradient-to-br from-purple-50 to-purple-100"
        >
          <div className="text-3xl font-bold text-purple-600">{stats?.pendingTasks || 0}</div>
          <p className="text-sm text-purple-500 mt-1">To be completed</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        <div className="space-y-4">
          {stats?.recentActivity?.length ? (
            stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                    {activity.user.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary capitalize">
                      {activity.action.replace(/\./g, " ")}
                      {activity.details && (
                        <span className="ml-1 text-text-secondary normal-case font-normal italic">
                          : {activity.details}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-text-secondary">
                      By {activity.user}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-text-secondary px-3 py-1 bg-gray-100 rounded-full">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-text-secondary text-center py-4">
              No recent activity
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/users" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Create User</h3>
                <p className="text-sm text-text-secondary">Add new team member</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/leads" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">New Lead</h3>
                <p className="text-sm text-text-secondary">
                  Add potential customer
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/tasks" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Create Task</h3>
                <p className="text-sm text-text-secondary">Assign to team</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
