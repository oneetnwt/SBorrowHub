import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useUserStore } from "../store/user";

function Dropdown({ menu = [] }) {
  const { user } = useUserStore();
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await axiosInstance.post("/auth/logout");

    if (res.status === 200) {
      setUser(null);
      navigate("/auth/login");
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-fadeIn">
      {/* User Info Header */}
      <div className="px-4 py-3 bg-linear-to-r from-(--primary) to-(--accent) text-white">
        <p className="font-semibold text-sm truncate">
          {user?.firstname} {user?.lastname}
        </p>
        <p className="text-xs opacity-90 truncate">{user?.email}</p>
      </div>

      {/* Menu Items */}
      <nav className="py-2">
        {Array.isArray(menu) &&
          menu.map((data, index) => (
            <Link
              key={data.to || index}
              to={data.to}
              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-(--accent) transition-colors group"
            >
              <span className="flex-1">{data.name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
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
          ))}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-gray-200">
        <button
          className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          onClick={handleLogout}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
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
          Log out
        </button>
      </div>
    </div>
  );
}

export default Dropdown;
