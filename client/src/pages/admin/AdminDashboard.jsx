import React, { useState, useEffect } from "react";
import InformationCard from "../../components/InformationCard";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import useWebSocket from "../../hooks/useWebSocket";
import { useUserStore } from "../../store/user";

function AdminDashboard() {
  const { user } = useUserStore((state) => state.user);
  const { isConnected, lastMessage } = useWebSocket(user?._id);
  const [officer, setOfficer] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        const [officer, user] = [
          await axiosInstance.get("/admin/officer"),
          await axiosInstance.get("/admin/get-all-users"),
        ];

        setOfficer(officer.data);
        setUsers(user.data);

        // Fetch initial active users count
        const usersRes = await axiosInstance.get("/admin/get-all-users");
        const activeCount = usersRes.data.filter((u) => u.isOnline).length;
        setActiveUsersCount(activeCount);
      } catch (error) {
        console.log("Unable to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, []);

  // Listen for real-time activity updates via WebSocket
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === "activity") {
        setRecentActivity((prev) => [lastMessage.data, ...prev].slice(0, 20));
      } else if (lastMessage.type === "systemAlert") {
        setSystemAlerts((prev) => [lastMessage.data, ...prev]);
        setStats((prev) => ({
          ...prev,
          systemAlerts: prev.systemAlerts + 1,
        }));
      } else if (lastMessage.type === "active_users_update") {
        // Update active users count in real-time
        setActiveUsersCount(lastMessage.count);
      }
    }
  }, [lastMessage]);

  const getActivityIcon = (type) => {
    const icons = {
      user: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      permission: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
      ),
      system: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      feedback: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
      ),
    };
    return icons[type] || icons.system;
  };

  const getActivityColor = (type) => {
    const colors = {
      user: "bg-purple-100 text-purple-600",
      permission: "bg-blue-100 text-blue-600",
      system: "bg-orange-100 text-orange-600",
      feedback: "bg-green-100 text-green-600",
    };
    return colors[type] || colors.system;
  };

  const getAlertLevel = (level) => {
    const levels = {
      critical: "bg-red-100 text-red-700 border-red-200",
      warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
      info: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return levels[level] || levels.info;
  };

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <InformationCard name="Total Users" icon="users" data={users.length} />
        <InformationCard
          name="Active Users"
          icon="users"
          data={activeUsersCount}
        />
        <InformationCard name="Officers" icon="users" data={officer.length} />
        <InformationCard
          name="Total Items"
          icon="inventory"
          // data={stats?.totalItems}
        />
        <InformationCard
          name="Pending Requests"
          icon="borrow"
          // data={stats?.pendingRequests}
        />
        <InformationCard
          name="Active Loans"
          icon="list"
          // data={stats?.activeLoans}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* System Alerts - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-black/10 p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-xl text-gray-900">System Alerts</h2>
              {isConnected && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  Live
                </span>
              )}
            </div>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">
              {systemAlerts.length}
            </span>
          </div>

          <div className="space-y-3">
            {systemAlerts.length > 0 ? (
              systemAlerts.slice(0, 4).map((alert) => (
                <div
                  key={alert._id || alert.id}
                  className={`flex gap-4 border p-4 rounded-lg hover:shadow-md transition-all ${getAlertLevel(
                    alert.level
                  )}`}
                >
                  {/* Alert Icon */}
                  <div className="shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-600">
                      {alert.timestamp
                        ? new Date(alert.timestamp).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Just now"}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button className="shrink-0 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs rounded-md font-medium transition-colors">
                    Resolve
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto mb-3 text-gray-300"
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
                <p className="text-sm font-medium">No system alerts</p>
                <p className="text-xs mt-1">Everything is running smoothly!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-black/10 p-5">
          <h2 className="font-bold text-xl text-gray-900 mb-4">Quick Stats</h2>

          <div className="space-y-4">
            <div className="border border-gray-200 bg-linear-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  User Growth
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">+12%</p>
              <p className="text-xs text-gray-600 mt-1">vs last month</p>
            </div>

            <div className="border border-gray-200 bg-linear-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Active Sessions
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-2xl font-bold text-gray-900">48</p>
              <p className="text-xs text-gray-600 mt-1">users online</p>
            </div>

            <div className="border border-gray-200 bg-linear-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  System Health
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500"
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
              <p className="text-2xl font-bold text-gray-900">Optimal</p>
              <p className="text-xs text-gray-600 mt-1">
                all systems operational
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-black/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl text-gray-900">Recent Activity</h2>
            {isConnected && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Live
              </span>
            )}
          </div>
          <div className="space-y-2">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{activity.userName}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow-sm border border-black/10 p-5">
          <h2 className="font-bold text-xl text-gray-900 mb-4">System Info</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-semibold text-gray-900">
                v2.1.0
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-semibold text-gray-900">99.9%</span>
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

          <Link
            to="/admin/permission-control"
            className="mt-6 w-full block text-center px-4 py-2 bg-(--accent) hover:bg-(--accent-dark) text-white text-sm rounded-md font-medium transition-colors"
          >
            Manage Permissions
          </Link>
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
