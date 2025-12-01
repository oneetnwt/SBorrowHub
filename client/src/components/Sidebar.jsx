import { Link, Navigate, useNavigate } from "react-router-dom";
import SidebarLink from "./SidebarLink";
import Logo from "./icons/Logo";
import { useUserStore } from "../store/user";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

function Sidebar({ role = "user" }) {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/");
  };

  const adminLinks = [
    { name: "Dashboard", to: "/admin", icon: "dashboard" },
    { name: "Logs", to: "/admin/logs", icon: "log" },
    {
      name: "Role Management",
      to: "/admin/permission-control",
      icon: "key",
    },
    { name: "Users", to: "/admin/users", icon: "users" },
  ];

  const officerLinks = [
    { name: "Dashboard", to: "/officer", icon: "dashboard" },
    { name: "Inventory", to: "/officer/inventory", icon: "inventory" },
    { name: "Archive", to: "/officer/archive", icon: "box" },
    { name: "Requests", to: "/officer/requests", icon: "borrow" },
    { name: "Transactions", to: "/officer/transactions", icon: "history" },
    { name: "Users", to: "/officer/users", icon: "users" },
    { name: "Analytics", to: "/officer/analytics", icon: "analytics" },
    { name: "Help & Support", to: "/officer/help", icon: "help" },
  ];

  const links =
    role === "officer"
      ? officerLinks
      : role === "admin"
      ? adminLinks
      : userLinks;

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axiosInstance.post("/auth/logout");
      setUser(null);
      navigate("/auth/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if the request fails, clear local state and redirect
      setUser(null);
      navigate("/auth/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="h-screen fixed left-0 top-0 w-64 flex flex-col bg-linear-to-b from-white to-gray-50 shadow-xl z-40 border-r border-gray-200">
      {/* Header with Logo */}
      <div className="p-6">
        <Link
          to={
            role === "officer" ? "/officer" : role === "admin" ? "/admin" : "/"
          }
          className="flex flex-col gap-3 group"
        >
          <div className="cursor-default">
            <Logo />
          </div>
          <p className="text-sm text-(--accent) font-semibold uppercase tracking-wide">
            {role === "officer"
              ? "Officer Panel"
              : role === "admin"
              ? "Admin Panel"
              : "Borrow System"}
          </p>
        </Link>
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="px-4 pb-4">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={handleNavigate}
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-linear-to-br from-(--accent) to-(--primary) flex items-center justify-center shrink-0">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.fullname}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
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
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-gray-900">
                  {user.fullname}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email || "user@example.com"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-2 px-3">
        <div className="space-y-1">
          {links.map((link) => (
            <SidebarLink
              key={link.to}
              name={link.name}
              to={link.to}
              icon={link.icon}
            />
          ))}
        </div>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="space-y-1.5">
          {/* Help/Support Link */}

          {/* Logout Link */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium group"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5"
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
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            )}
            <span>{loading ? "Logging out..." : "Logout"}</span>
          </button>
        </div>

        {/* Version Info */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center font-medium">
            Version 1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
