import { useState, useEffect, useRef } from "react";
import Logo from "./icons/Logo";
import TopbarLink from "./TopbarLink";
import Dropdown from "./Dropdown";
import Notification from "./icons/Notification";
import NotificationModal from "./modals/Notification";
import Box from "./icons/Box";
import { Link } from "react-router-dom";
import { useUserStore } from "../store/user";
import axiosInstance from "../api/axiosInstance";
import useWebSocket from "../hooks/useWebSocket";

function Topbar() {
  const { user } = useUserStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const { lastMessage } = useWebSocket(user?._id);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await axiosInstance.get("/notification");
        const unread = response.data.filter((notif) => !notif.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    if (user?._id) {
      fetchUnreadCount();
    }
  }, [user?._id]);

  // Update count when new notification arrives via WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.type === "notification") {
      setUnreadCount((prev) => prev + 1);
    }
  }, [lastMessage]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className="flex items-center justify-between">
      <div>
        <Logo />
      </div>
      <div className="flex items-center gap-5">
        <nav className="space-x-5 py-1 px-5 rounded-full flex items-center">
          <TopbarLink name="Dashboard" to="" />
          <TopbarLink name="Item Catalog" to="/catalog" />
        </nav>
        <div className="relative">
          <Link to="/cart" className="cursor-pointer hover:text-(--text)/80">
            <Box />
          </Link>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="p-3 rounded-full bg-white hover:shadow hover:bg-black/10 transition-all cursor-pointer relative"
          >
            <Notification />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          {showNotification && (
            <NotificationModal
              onClose={() => setShowNotification(false)}
              onNotificationRead={() =>
                setUnreadCount((prev) => Math.max(0, prev - 1))
              }
            />
          )}
        </div>
        <div
          ref={dropdownRef}
          className="relative"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="rounded-full cursor-pointer max-h-12 w-12 h-12 object-cover"
            />
          ) : (
            <div className="rounded-full cursor-pointer w-12 h-12 bg-linear-to-br from-(--primary) to-(--accent) flex items-center justify-center text-white font-semibold">
              {user?.firstname?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          {showDropdown && (
            <Dropdown
              menu={[
                ...(user?.role === "officer"
                  ? [{ name: "Officer Panel", to: "/officer" }]
                  : []),
                ...(user?.role === "admin"
                  ? [{ name: "Admin Panel", to: "/admin" }]
                  : []),
                { name: "View Profile", to: "/profile" },
                { name: "View Transaction", to: "/profile/transactions" },
                { name: "Help & Support", to: "/help" },
              ]}
            />
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
