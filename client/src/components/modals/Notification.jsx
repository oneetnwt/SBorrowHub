import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import useWebSocket from "../../hooks/useWebSocket";
import { useUserStore } from "../../store/user";

function Notification({ onClose, onNotificationRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUserStore();

  // WebSocket connection for real-time notifications
  const { lastMessage } = useWebSocket(user?._id);

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/notification");
        setNotifications(response.data);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch notifications"
        );
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Listen for new notifications via WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.type === "notification") {
      // Extract notification data from WebSocket message
      const newNotification = lastMessage.data;
      setNotifications((prev) => [newNotification, ...prev]);
    }
  }, [lastMessage]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    // Find the notification to check if it's already read
    const notification = notifications.find((n) => n._id === notificationId);
    if (!notification || notification.isRead) return; // Skip if already read

    try {
      await axiosInstance.patch(`/notification/${notificationId}/read`);
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      // Notify parent component
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        (notif) => !notif.isRead
      );

      // Mark each unread notification as read
      await Promise.all(
        unreadNotifications.map((notif) =>
          axiosInstance.patch(`/notification/${notif._id}/read`)
        )
      );

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );

      // Notify parent to reset count
      if (onNotificationRead) {
        unreadNotifications.forEach(() => onNotificationRead());
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Format timestamp as relative time (e.g., "5 mins ago")
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    if (diffWeeks < 4)
      return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
    return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
  };

  const getStatusColor = (status) => {
    if (status === "In progress") return "bg-(--info)/20 text-(--info)";
    if (status === "Action needed") return "bg-(--warning)/20 text-(--warning)";
    if (status === "Completed") return "bg-(--success)/20 text-(--success)";
    return "bg-(--neutral-200) text-(--neutral-600)";
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown Menu */}
      <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-black/10 w-96 max-h-[500px] overflow-y-auto z-50 [&::-webkit-scrollbar]:w-px [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        {/* Header + Tabs (Fixed together) */}
        <div className="sticky top-0 z-10 bg-white">
          {/* Header */}
          <div className="border-b border-black/10 p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Notifications</h2>
            <button
              onClick={markAllAsRead}
              className="text-sm font-semibold text-(--accent) hover:text-(--accent-dark)"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-black/10">
          {loading && (
            <div className="p-8 text-center text-gray-500">
              Loading notifications...
            </div>
          )}
          {!loading && !error && notifications.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No notifications
            </div>
          )}
          {error && <div className="p-8 text-center text-red-500">{error}</div>}
          {!loading &&
            !error &&
            notifications.slice(0, 15).map((notif) => (
              <div
                key={notif._id}
                onClick={() => markAsRead(notif._id)}
                className={`p-4 cursor-pointer transition-colors ${
                  !notif.isRead
                    ? "bg-blue-50 hover:bg-blue-100"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex gap-3 items-start">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        !notif.isRead
                          ? "font-bold text-gray-900"
                          : "font-semibold text-gray-900"
                      }`}
                    >
                      {notif.title}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        !notif.isRead ? "text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {notif.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTime(notif.createdAt)}
                    </p>
                  </div>

                  {/* Red dot indicator on right - only for unread */}
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-(--error) mt-1.5 shrink-0" />
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default Notification;
