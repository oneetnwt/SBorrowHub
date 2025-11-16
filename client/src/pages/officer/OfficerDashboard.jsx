import React, { useState, useEffect } from "react";
import InformationCard from "../../components/InformationCard";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import useWebSocket from "../../hooks/useWebSocket";
import { useUserStore } from "../../store/user";

function OfficerDashboard() {
  const { user } = useUserStore((state) => state.user);
  const { isConnected, lastMessage } = useWebSocket(user?._id);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    pendingRequests: 0,
    activeLoans: 0,
    overdueItems: 0,
    monthlyBorrows: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState({
    stats: false,
    pending: false,
    activity: false,
    lowStock: false,
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(new Set());

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchAllDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, pendingRes, activityRes, lowStockRes] =
          await Promise.all([
            axiosInstance.get("/officer/dashboard-stats"),
            axiosInstance.get("/officer/pending-requests"),
            axiosInstance.get("/officer/recent-activity"),
            axiosInstance.get("/catalog/get-low-stock"),
          ]);

        setStats(statsRes.data);
        setDataLoaded((prev) => ({ ...prev, stats: true }));

        setPendingApprovals(pendingRes.data);
        setDataLoaded((prev) => ({ ...prev, pending: true }));

        setRecentActivity(activityRes.data);
        setDataLoaded((prev) => ({ ...prev, activity: true }));

        setLowStockItems(lowStockRes.data);
        setDataLoaded((prev) => ({ ...prev, lowStock: true }));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
        // Add new activity to the top of the list
        setRecentActivity((prev) => [lastMessage.data, ...prev].slice(0, 20));
      } else if (lastMessage.type === "pendingRequest") {
        // Add new pending request to the list
        setPendingApprovals((prev) => [lastMessage.data, ...prev]);
        // Update stats
        setStats((prev) => ({
          ...prev,
          pendingRequests: prev.pendingRequests + 1,
        }));
      } else if (lastMessage.type === "requestStatusUpdate") {
        // Remove the request from pending list if status changed
        setPendingApprovals((prev) =>
          prev.filter((req) => req._id !== lastMessage.data.requestId)
        );
        // Update stats
        setStats((prev) => ({
          ...prev,
          pendingRequests: Math.max(0, prev.pendingRequests - 1),
        }));
      }
    }
  }, [lastMessage]);

  // Handle approve request
  const handleApprove = async (requestId) => {
    setLoadingRequests((prev) => new Set(prev).add(requestId));
    try {
      await axiosInstance.put(`/officer/update-request-status/${requestId}`, {
        status: "approved",
      });
      // WebSocket will handle the UI update
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request. Please try again.");
    } finally {
      setLoadingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Handle reject request
  const handleReject = async (requestId) => {
    setLoadingRequests((prev) => new Set(prev).add(requestId));
    try {
      await axiosInstance.put(`/officer/update-request-status/${requestId}`, {
        status: "rejected",
      });
      // WebSocket will handle the UI update
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request. Please try again.");
    } finally {
      setLoadingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      high: "bg-red-100 text-red-700 border-red-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      low: "bg-green-100 text-green-700 border-green-200",
    };
    return badges[urgency] || badges.low;
  };

  const getActivityIcon = (type) => {
    const icons = {
      approval: (
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      return: (
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
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      ),
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
      inventory: (
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
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      rejection: (
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
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    };
    return icons[type] || icons.approval;
  };

  const getActivityColor = (type) => {
    const colors = {
      approval: "bg-green-100 text-green-600",
      return: "bg-blue-100 text-blue-600",
      user: "bg-purple-100 text-purple-600",
      inventory: "bg-orange-100 text-orange-600",
      rejection: "bg-red-100 text-red-600",
    };
    return colors[type] || colors.approval;
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
              Welcome back! Here's what's happening today.
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
        <InformationCard
          name="Total Users"
          icon="users"
          data={stats.totalUsers}
        />
        <InformationCard
          name="Total Items"
          icon="inventory"
          data={stats.totalItems}
        />
        <InformationCard
          name="Pending Requests"
          icon="borrow"
          data={stats.pendingRequests}
        />
        <InformationCard
          name="Active Loans"
          icon="list"
          data={stats.activeLoans}
        />
        <InformationCard
          name="Overdue Items"
          icon="dashboard"
          data={stats.overdueItems}
        />
        <InformationCard
          name="Monthly Borrows"
          icon="history"
          data={stats.monthlyBorrows}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Pending Approvals - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-black/10 p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-xl text-gray-900">
                Pending Approvals
              </h2>
              {isConnected && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  Live
                </span>
              )}
            </div>
            <Link
              to="/officer/requests"
              className="text-(--accent) hover:text-(--accent-dark) font-semibold text-sm flex items-center gap-1"
            >
              View all
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          <div className="space-y-3">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.slice(0, 3).map((request) => (
                <div
                  key={request._id}
                  className="flex gap-4 border border-black/10 p-4 rounded-lg hover:shadow-md transition-all"
                >
                  {/* User Avatar */}
                  <img
                    src={
                      request.borrowerId?.profilePicture ||
                      `https://ui-avatars.com/api/?name=${request.borrowerId?.firstname}+${request.borrowerId?.lastname}&background=be8443&color=fff`
                    }
                    alt={`${request.borrowerId?.firstname} ${request.borrowerId?.lastname}`}
                    className="w-12 h-12 rounded-full border-2 border-gray-200 shrink-0 object-cover"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {request.borrowerId?.firstname}{" "}
                          {request.borrowerId?.lastname}
                        </h3>
                        <p className="text-sm text-gray-600">
                          wants to borrow{" "}
                          <span className="font-medium text-gray-800">
                            {request.itemId?.name}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(request._id)}
                          disabled={loadingRequests.has(request._id)}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-xs rounded-md font-medium transition-colors flex items-center gap-1.5"
                        >
                          {loadingRequests.has(request._id) && (
                            <svg
                              className="animate-spin h-3 w-3"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          disabled={loadingRequests.has(request._id)}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-xs rounded-md font-medium transition-colors flex items-center gap-1.5"
                        >
                          {loadingRequests.has(request._id) && (
                            <svg
                              className="animate-spin h-3 w-3"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          )}
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
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
                <p className="text-sm font-medium">No pending approvals</p>
                <p className="text-xs mt-1">All caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Overdue Loans */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="font-bold text-xl text-gray-900">Overdue Loans</h2>
            </div>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">
              {overdueLoans.length}
            </span>
          </div>

          <div className="space-y-3">
            {overdueLoans.length > 0 ? (
              overdueLoans.map((loan) => (
                <div
                  key={loan._id || loan.id}
                  className="border border-red-200 bg-red-50/50 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={loan.userAvatar}
                      alt={loan.userName}
                      className="w-10 h-10 rounded-full border-2 border-red-300"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {loan.userName}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">
                        {loan.itemName}
                      </p>
                    </div>
                  </div>
                  <div className="pl-13">
                    <p className="text-xs text-red-600 font-medium mb-1">
                      {loan.daysOverdue} days overdue
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      Due: {loan.dueDate}
                    </p>
                    <button className="w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md font-medium transition-colors">
                      Send Reminder
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No overdue items</p>
              </div>
            )}
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
              recentActivity.slice(0, 4).map((activity) => (
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
                      {activity.item && ` - ${activity.item}`}
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

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-orange-500"
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
            <h2 className="font-bold text-xl text-gray-900">Low Stock Alert</h2>
          </div>

          <div className="space-y-3">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div
                  key={item._id || item.id}
                  className="border border-orange-200 bg-orange-50/50 p-3 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm text-gray-900">
                      {item.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        item.status === "critical"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">
                      Current:{" "}
                      <span className="font-bold">{item.available}</span>
                    </span>
                    <span className="text-gray-600">
                      Min: <span className="font-bold">{item.quantity}</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.status === "critical"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                      style={{
                        width: `${(item.current / item.minimum) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">All items well stocked</p>
              </div>
            )}
          </div>

          <Link
            to="/officer/inventory"
            className="mt-4 w-full block text-center px-4 py-2 bg-(--accent) hover:bg-(--accent-dark) text-white text-sm rounded-md font-medium transition-colors"
          >
            Manage Inventory
          </Link>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-black/10 p-5">
        <h2 className="font-bold text-xl text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/officer/inventory"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 text-center">
              Add Item
            </span>
          </Link>

          <Link
            to="/officer/users"
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
            to="/officer/analytics"
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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 text-center">
              View Reports
            </span>
          </Link>

          <Link
            to="/officer/settings"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 text-center">
              Settings
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OfficerDashboard;
