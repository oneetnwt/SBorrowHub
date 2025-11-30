import React, { useState, useEffect } from "react";
import InformationCard from "../../components/InformationCard";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import useWebSocket from "../../hooks/useWebSocket";
import { useUserStore } from "../../store/user";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function AdminDashboard() {
  const { user } = useUserStore();
  const { isConnected, lastMessage } = useWebSocket(user?._id);
  const [officer, setOfficer] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const [uptime, setUptime] = useState("Loading...");
  const [usersByRole, setUsersByRole] = useState([]);
  const [activityStatus, setActivityStatus] = useState({
    online: 0,
    offline: 0,
  });

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        // Fetch uptime separately to avoid blocking
        try {
          const uptimeRes = await axiosInstance.get("/admin/uptime");
          console.log("Uptime response:", uptimeRes.data);
          setUptime(uptimeRes.data.formatted);
        } catch (uptimeError) {
          console.error("Failed to fetch uptime:", uptimeError);
          setUptime("N/A");
        }

        const [officerRes, userRes, statsRes] = await Promise.all([
          axiosInstance.get("/admin/officer"),
          axiosInstance.get("/admin/get-all-users"),
          axiosInstance.get("/admin/dashboard-stats"),
        ]);

        setOfficer(officerRes.data);
        setUsers(userRes.data);
        setUsersByRole(statsRes.data.usersByRole);
        setActivityStatus(statsRes.data.activityStatus);

        // Fetch initial active users count
        setActiveUsersCount(statsRes.data.activeUsers);

        // Fetch initial uptime
        try {
          const uptimeRes = await axiosInstance.get("/admin/uptime");
          setUptimeSeconds(Math.floor(uptimeRes.data.uptime / 1000));
        } catch (uptimeError) {
          console.error("Failed to fetch uptime:", uptimeError);
        }
      } catch (error) {
        console.log("Unable to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, []);

  // Real-time uptime counter
  useEffect(() => {
    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      parts.push(`${secs}s`);

      return parts.join(" ");
    };

    if (uptimeSeconds > 0) {
      setUptime(formatUptime(uptimeSeconds));

      const interval = setInterval(() => {
        setUptimeSeconds((prev) => {
          const newUptime = prev + 1;
          setUptime(formatUptime(newUptime));
          return newUptime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [uptimeSeconds]);

  // Listen for real-time activity updates via WebSocket
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === "active_users_update") {
        // Update active users count in real-time
        setActiveUsersCount(lastMessage.count);
      }
    }
  }, [lastMessage]);

  if (loading) {
    return (
      <div className="w-full h-full flex">
        <div className="m-auto text-center">
          <Loader variant="spinner" size="lg" />
          <h1>Fetching Data</h1>
        </div>
      </div>
    );
  }

  return (
    <section className="h-full w-full flex flex-col overflow-y-auto p-4 pb-20 bg-gray-50 fadeIn">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              System overview and management console
            </p>
          </div>
          {/* WebSocket Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></div>
            <span className="text-xs font-medium text-gray-700">
              {isConnected ? "Live Updates" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <InformationCard name="Total Users" icon="users" data={users.length} />
        <InformationCard
          name="Active Users"
          icon="users"
          data={activeUsersCount}
        />
        <InformationCard name="Officers" icon="users" data={officer.length} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* User Role Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-black/10 p-5">
          <h2 className="font-bold text-xl text-gray-900 mb-4">
            User Role Distribution
          </h2>
          {usersByRole.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usersByRole.map((role) => {
                    const roleColors = {
                      user: "#3b82f6",
                      officer: "#8b5cf6",
                      admin: "#10b981",
                    };
                    return {
                      name:
                        role._id.charAt(0).toUpperCase() +
                        role._id.slice(1) +
                        "s",
                      value: role.count,
                      color: roleColors[role._id] || "#6b7280",
                    };
                  })}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ outline: "none" }}
                >
                  {usersByRole.map((role, index) => {
                    const roleColors = {
                      user: "#3b82f6",
                      officer: "#8b5cf6",
                      admin: "#10b981",
                    };
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={roleColors[role._id] || "#6b7280"}
                      />
                    );
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>No user data available</p>
            </div>
          )}
        </div>

        {/* User Activity Status */}
        <div className="bg-white rounded-lg shadow-sm border border-black/10 p-5">
          <h2 className="font-bold text-xl text-gray-900 mb-4">
            User Activity Status
          </h2>
          {activityStatus.online + activityStatus.offline > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: "Online",
                    count: activityStatus.online,
                  },
                  {
                    name: "Offline",
                    count: activityStatus.offline,
                  },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  style={{ outline: "none" }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>No user data available</p>
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-lg shadow-sm border border-black/10 p-5 mb-5">
        <h2 className="font-bold text-xl text-gray-900 mb-4">System Info</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">Version</span>
            <span className="text-sm font-semibold text-gray-900">v1.0.0</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">Server Uptime</span>
            <span className="text-sm font-semibold text-gray-900">
              {uptime}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">Database</span>
            <span className="text-sm font-semibold text-green-600">
              Connected
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Last Backup</span>
            <span className="text-sm font-semibold text-gray-900">
              2 hours ago
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-black/10 p-5">
        <h2 className="font-bold text-xl text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Link
            to="/admin/permission-control"
            className="flex flex-col items-center gap-2 p-4 border border-black/10 rounded-lg hover:shadow-md hover:border-(--accent) transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-(--accent)/10 group-hover:bg-(--accent)/20 flex items-center justify-center transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-(--accent)"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 text-center">
              Permissions
            </span>
          </Link>

          <Link
            to="/admin/users"
            className="flex flex-col items-center gap-2 p-4 border border-black/10 rounded-lg hover:shadow-md hover:border-(--accent) transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-(--accent)/10 group-hover:bg-(--accent)/20 flex items-center justify-center transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-(--accent)"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 text-center">
              Manage Users
            </span>
          </Link>

          <Link
            to="/admin/feedback"
            className="flex flex-col items-center gap-2 p-4 border border-black/10 rounded-lg hover:shadow-md hover:border-(--accent) transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-(--accent)/10 group-hover:bg-(--accent)/20 flex items-center justify-center transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-(--accent)"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 text-center">
              View Feedback
            </span>
          </Link>

          <Link
            to="/admin/transactions"
            className="flex flex-col items-center gap-2 p-4 border border-black/10 rounded-lg hover:shadow-md hover:border-(--accent) transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-(--accent)/10 group-hover:bg-(--accent)/20 flex items-center justify-center transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-(--accent)"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 text-center">
              Transactions
            </span>
          </Link>

          <button className="flex flex-col items-center gap-2 p-4 border border-black/10 rounded-lg hover:shadow-md hover:border-(--accent) transition-all group">
            <div className="w-12 h-12 rounded-full bg-(--accent)/10 group-hover:bg-(--accent)/20 flex items-center justify-center transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-(--accent)"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 text-center">
              Backup System
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
