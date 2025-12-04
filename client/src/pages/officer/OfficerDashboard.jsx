import React, { useState, useEffect } from "react";
import InformationCard from "../../components/InformationCard";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import Toast from "../../components/Toast";
import Modal from "../../components/modals/Modal";
import useWebSocket from "../../hooks/useWebSocket";
import { useUserStore } from "../../store/user";

function OfficerDashboard() {
  const user = useUserStore((state) => state.user);
  const { isConnected, lastMessage } = useWebSocket(user?._id);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    pendingRequests: 0,
    activeLoans: 0,
    overdueItems: 0,
    monthlyBorrows: 0,
  });
  const [dataLoaded, setDataLoaded] = useState({
    stats: false,
    pending: false,
    activity: false,
    lowStock: false,
    returnPending: false,
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [returnPendingRequests, setReturnPendingRequests] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(new Set());
  const [sendingNotification, setSendingNotification] = useState(null);
  const [toast, setToast] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch dashboard stats independently
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await axiosInstance.get("/officer/dashboard-stats");
        setStats(statsRes.data);
        setDataLoaded((prev) => ({ ...prev, stats: true }));
      } catch (error) {
        console.error("Error fetching stats:", error);
        setDataLoaded((prev) => ({ ...prev, stats: true }));
      }
    };
    fetchStats();
  }, []);

  // Fetch pending requests independently
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const pendingRes = await axiosInstance.get("/officer/pending-requests");
        setPendingApprovals(pendingRes.data);
        setDataLoaded((prev) => ({ ...prev, pending: true }));
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        setDataLoaded((prev) => ({ ...prev, pending: true }));
      }
    };
    fetchPending();
  }, []);

  // Fetch overdue and return pending independently
  useEffect(() => {
    const fetchOverdueAndReturns = async () => {
      try {
        const [overdueRes, returnPendingRes] = await Promise.all([
          axiosInstance.get("/officer/overdue"),
          axiosInstance.get("/officer/return-pending"),
        ]);
        setOverdueLoans(overdueRes.data);
        setReturnPendingRequests(returnPendingRes.data);
        setDataLoaded((prev) => ({ ...prev, returnPending: true }));
      } catch (error) {
        console.error("Error fetching overdue/returns:", error);
        setDataLoaded((prev) => ({ ...prev, returnPending: true }));
      }
    };
    fetchOverdueAndReturns();
  }, []);

  // Fetch activity independently
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const activityRes = await axiosInstance.get("/officer/recent-activity");
        console.log("Recent activity response:", activityRes.data);
        setRecentActivity(activityRes.data);
        setDataLoaded((prev) => ({ ...prev, activity: true }));
      } catch (error) {
        console.error("Error fetching activity:", error);
        setDataLoaded((prev) => ({ ...prev, activity: true }));
      }
    };
    fetchActivity();
  }, []);

  // Fetch low stock independently
  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const lowStockRes = await axiosInstance.get("/catalog/get-low-stock");
        setLowStockItems(lowStockRes.data);
        setDataLoaded((prev) => ({ ...prev, lowStock: true }));
      } catch (error) {
        console.error("Error fetching low stock:", error);
        setDataLoaded((prev) => ({ ...prev, lowStock: true }));
      }
    };
    fetchLowStock();
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

      // Manually update the UI
      setPendingApprovals((prev) =>
        prev.filter((req) => req._id !== requestId)
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        pendingRequests: Math.max(0, prev.pendingRequests - 1),
      }));

      setToast({
        message: "Request approved successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error approving request:", error);
      setToast({
        message:
          error.response?.data?.message ||
          "Failed to approve request. Please try again.",
        type: "error",
      });
    } finally {
      setLoadingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Handle reject request
  const openRejectModal = (requestId) => {
    setSelectedRequestId(requestId);
    setRejectModalOpen(true);
    setRejectionReason("");
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedRequestId(null);
    setRejectionReason("");
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setToast({
        message: "Please provide a reason for rejection",
        type: "error",
      });
      return;
    }

    setLoadingRequests((prev) => new Set(prev).add(selectedRequestId));
    try {
      await axiosInstance.put(
        `/officer/update-request-status/${selectedRequestId}`,
        {
          status: "rejected",
          rejectionReason: rejectionReason.trim(),
        }
      );

      // Manually update the UI
      setPendingApprovals((prev) =>
        prev.filter((req) => req._id !== selectedRequestId)
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        pendingRequests: Math.max(0, prev.pendingRequests - 1),
      }));

      setToast({
        message: "Request rejected successfully!",
        type: "success",
      });

      closeRejectModal();
    } catch (error) {
      console.error("Error rejecting request:", error);
      setToast({
        message:
          error.response?.data?.message ||
          "Failed to reject request. Please try again.",
        type: "error",
      });
    } finally {
      setLoadingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedRequestId);
        return newSet;
      });
    }
  };

  // Handle approve return
  const handleApproveReturn = async (requestId) => {
    try {
      setLoadingRequests((prev) => new Set(prev).add(requestId));
      await axiosInstance.put(`/officer/approve-return/${requestId}`);

      // Remove from return pending list
      setReturnPendingRequests((prev) =>
        prev.filter((req) => req._id !== requestId)
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        activeLoans: Math.max(0, prev.activeLoans - 1),
      }));

      setToast({
        message: "Return approved successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error approving return:", error);
      setToast({
        message:
          error.response?.data?.message ||
          "Failed to approve return. Please try again.",
        type: "error",
      });
    } finally {
      setLoadingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Handle sending overdue notification
  const handleSendOverdueNotification = async (requestId) => {
    try {
      setSendingNotification(requestId);
      await axiosInstance.post(
        `/officer/send-overdue-notification/${requestId}`
      );

      setToast({
        message: "Overdue notification sent successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error sending overdue notification:", error);
      setToast({
        message:
          error.response?.data?.message ||
          "Failed to send notification. Please try again.",
        type: "error",
      });
    } finally {
      setSendingNotification(null);
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

  // Skeleton component for stats
  const StatsSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-12"></div>
        </div>
      ))}
    </div>
  );

  // Skeleton component for pending approvals
  const PendingApprovalsSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 p-4 rounded-lg animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-48 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Skeleton component for overdue loans
  const OverdueLoansSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 p-3 rounded-lg animate-pulse"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-2 bg-gray-100 rounded w-32"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Skeleton component for recent activity
  const RecentActivitySkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3 border-l-4 border-gray-200 animate-pulse"
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-40 mb-2"></div>
            <div className="h-2 bg-gray-100 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Skeleton component for low stock items
  const LowStockSkeleton = () => (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 p-3 rounded-lg animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-2 bg-gray-100 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Skeleton component for return pending
  const ReturnPendingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 p-4 rounded-lg animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-48 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="h-full w-full flex flex-col overflow-y-auto p-4 pb-20 bg-gray-50 fadeIn">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Officer Dashboard
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
      {!dataLoaded.stats ? (
        <StatsSkeleton />
      ) : (
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
      )}

      {/* Main Content Grid - Pending Approvals and Returns */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow-sm border border-black/10 p-5">
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

          {!dataLoaded.pending ? (
            <PendingApprovalsSkeleton />
          ) : (
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
                            onClick={() => openRejectModal(request._id)}
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
          )}
        </div>

        {/* Return Pending Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <h2 className="font-bold text-xl text-gray-900">
                Pending Returns
              </h2>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">
              {returnPendingRequests.length}
            </span>
          </div>

          {!dataLoaded.returnPending ? (
            <ReturnPendingSkeleton />
          ) : (
            <div className="space-y-3">
              {returnPendingRequests.length > 0 ? (
                returnPendingRequests.slice(0, 3).map((request) => (
                  <div
                    key={request._id}
                    className="border border-blue-200 bg-blue-50/50 p-3 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          request.borrowerId?.profilePicture ||
                          "/default-avatar.png"
                        }
                        alt={`${request.borrowerId?.firstname} ${request.borrowerId?.lastname}`}
                        className="w-12 h-12 rounded-full border-2 border-blue-300"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900">
                          {request.borrowerId?.firstname}{" "}
                          {request.borrowerId?.lastname}
                        </h3>
                        <p className="text-xs text-gray-600 mb-1">
                          {request.itemId?.name}
                        </p>
                        <p className="text-xs text-blue-600 font-medium">
                          Wants to return • Qty: {request.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => handleApproveReturn(request._id)}
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
                        Verify Return
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No pending returns</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overdue Borrows - Full Width */}
      <div className="mb-5">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="font-bold text-xl text-gray-900">
                Overdue Borrows
              </h2>
            </div>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">
              {overdueLoans.length}
            </span>
          </div>

          {!dataLoaded.stats ? (
            <OverdueLoansSkeleton />
          ) : (
            <div className="space-y-3">
              {overdueLoans.length > 0 ? (
                overdueLoans.map((loan) => (
                  <div
                    key={loan._id}
                    className="border border-red-200 bg-red-50/50 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={
                          loan.borrowerId?.profilePicture ||
                          "https://via.placeholder.com/40"
                        }
                        alt={`${loan.borrowerId?.firstname} ${loan.borrowerId?.lastname}`}
                        className="w-10 h-10 rounded-full border-2 border-red-300 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          {loan.borrowerId?.firstname}{" "}
                          {loan.borrowerId?.lastname}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">
                          {loan.itemId?.name}
                        </p>
                      </div>
                    </div>
                    <div className="pl-13">
                      <p className="text-xs text-red-600 font-medium mb-1">
                        {loan.daysOverdue}{" "}
                        {loan.daysOverdue === 1 ? "day" : "days"} overdue
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        Due:{" "}
                        {new Date(loan.returnDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <button
                        onClick={() => handleSendOverdueNotification(loan._id)}
                        disabled={sendingNotification === loan._id}
                        className="w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs rounded-md font-medium transition-colors"
                      >
                        {sendingNotification === loan._id
                          ? "Sending..."
                          : "Send Reminder"}
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
          )}
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
          {!dataLoaded.activity ? (
            <RecentActivitySkeleton />
          ) : (
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
                        <span className="font-semibold">
                          {activity.userName}
                        </span>{" "}
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
          )}
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

          {!dataLoaded.lowStock ? (
            <LowStockSkeleton />
          ) : (
            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                lowStockItems.slice(0, 3).map((item) => (
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
          )}

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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
        </div>
      </div>

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={closeRejectModal}
        title="Reject Borrow Request"
        size="sm"
      >
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Please provide a reason for rejecting this request. This will be
            visible to the user.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Item is currently unavailable, insufficient information provided, etc."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              disabled={loadingRequests.has(selectedRequestId)}
            />
            <p className="text-xs text-gray-500 mt-1">
              {rejectionReason.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={closeRejectModal}
              disabled={loadingRequests.has(selectedRequestId)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={
                loadingRequests.has(selectedRequestId) ||
                !rejectionReason.trim()
              }
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loadingRequests.has(selectedRequestId) && (
                <svg
                  className="animate-spin h-4 w-4"
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
              Reject Request
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}

export default OfficerDashboard;
