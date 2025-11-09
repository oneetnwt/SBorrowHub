import React, { useState } from "react";
import InformationCard from "../components/InformationCard";
import { Link } from "react-router-dom";

function UserDashboard() {
  // Mock data for demonstration
  const [pendingRequests] = useState([
    {
      id: 1,
      name: "Extension Wire",
      image: "https://hbw.ph/wp-content/uploads/2017/10/9948-BLACK-2-1.jpg",
      requestDate: "October 24, 2025",
      status: "Pending for Approval",
    },
    {
      id: 2,
      name: "Scientific Calculator",
      image: "https://hbw.ph/wp-content/uploads/2017/10/9948-BLACK-2-1.jpg",
      requestDate: "October 26, 2025",
      status: "Pending for Approval",
    },
  ]);

  const [activeBorrows] = useState([
    {
      id: 1,
      name: "Extension Wire",
      image: "https://hbw.ph/wp-content/uploads/2017/10/9948-BLACK-2-1.jpg",
      dueDate: "November 8, 2025",
      status: "Due in 3 days",
      statusColor: "warning",
    },
    {
      id: 2,
      name: "Arduino Kit",
      image: "https://hbw.ph/wp-content/uploads/2017/10/9948-BLACK-2-1.jpg",
      dueDate: "November 3, 2025",
      status: "Overdue",
      statusColor: "error",
    },
  ]);

  const [recentActivity] = useState([
    { id: 1, action: "Returned", item: "USB-C Hub", date: "2 hours ago" },
    { id: 2, action: "Borrowed", item: "HDMI Cable", date: "1 day ago" },
    {
      id: 3,
      action: "Requested",
      item: "Whiteboard Marker",
      date: "2 days ago",
    },
  ]);

  const getStatusColor = (color) => {
    const colors = {
      warning: "bg-(--warning) text-white",
      error: "bg-(--error) text-white",
      success: "bg-(--success) text-white",
      info: "bg-(--info) text-white",
    };
    return colors[color] || "bg-(--accent) text-white";
  };

  return (
    <section className="h-full w-full flex flex-col overflow-y-auto p-4 pb-20">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <InformationCard name="Active Borrows" icon="inventory" data="5" />
        <InformationCard name="Pending Request" icon="borrow" data="2" />
        <InformationCard name="Overdue Items" icon="dashboard" data="1" />
        <InformationCard name="Returned this Month" icon="history" data="10" />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {/* Pending Requests */}
          <div className="bg-white rounded-lg shadow-sm border border-black/10 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Pending Requests</h2>
              <Link
                to="/requests"
                className="text-(--accent) hover:text-(--accent-dark) font-semibold text-sm"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex gap-3 border border-black/10 p-3 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <img
                      src={request.image}
                      alt={request.name}
                      className="w-20 h-20 object-cover border border-black/10 rounded-md shrink-0"
                    />
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {request.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {request.requestDate}
                        </p>
                      </div>
                      <div className="self-end">
                        <span className="px-3 py-1 bg-(--info) text-white text-xs rounded-full font-medium">
                          {request.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No pending requests</p>
                </div>
              )}
            </div>
          </div>

          {/* Currently Borrowed */}
          <div className="bg-white rounded-lg shadow-sm border border-black/10 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Currently Borrowed</h2>
              <Link
                to="/borrowed"
                className="text-(--accent) hover:text-(--accent-dark) font-semibold text-sm"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {activeBorrows.length > 0 ? (
                activeBorrows.map((borrow) => (
                  <div
                    key={borrow.id}
                    className="flex gap-3 border border-black/10 p-3 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <img
                      src={borrow.image}
                      alt={borrow.name}
                      className="w-20 h-20 object-cover border border-black/10 rounded-md shrink-0"
                    />
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {borrow.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Due: {borrow.dueDate}
                        </p>
                      </div>
                      <div className="self-end">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                            borrow.statusColor
                          )}`}
                        >
                          {borrow.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No active borrows</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid md:grid-cols-3 gap-5 mb-5">
          {/* Recent Activity */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-black/10 p-4">
            <h2 className="font-bold text-lg mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-(--accent)/10 flex items-center justify-center shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-(--accent)"
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
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{activity.action}</span>{" "}
                      {activity.item}
                    </p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-black/10 p-4">
            <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/catalog"
                className="flex items-center gap-3 p-3 bg-(--accent)/10 hover:bg-(--accent)/20 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-(--accent) flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-900 group-hover:text-(--accent)">
                  Browse Catalog
                </span>
              </Link>

              <Link
                to="/profile/transactions"
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-700"
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
                <span className="text-sm font-semibold text-gray-900 group-hover:text-(--accent)">
                  View History
                </span>
              </Link>

              <Link
                to="/profile"
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-700"
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
                </div>
                <span className="text-sm font-semibold text-gray-900 group-hover:text-(--accent)">
                  Edit Profile
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div
        className="fixed bottom-0 left-0 right-0 py-3 px-4 md:px-25 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg z-30"
        style={{
          background: `linear-gradient(to left, var(--accent), var(--secondary))`,
        }}
      >
        <div className="text-center md:text-left">
          <h3 className="font-bold text-sm text-white">
            Need to borrow something?
          </h3>
          <p className="text-sm text-white/90">
            Browse our inventory and submit a request.
          </p>
        </div>
        <Link
          to="/catalog"
          className="py-2 px-6 rounded-lg text-white hover:bg-white/20 bg-white/10 transition-all text-sm font-semibold border-2 border-white/30 whitespace-nowrap"
        >
          Browse Inventory
        </Link>
      </div>
    </section>
  );
}

export default UserDashboard;
