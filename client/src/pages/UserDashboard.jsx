import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InformationCard from "../components/InformationCard";
import axiosInstance from "../api/axiosInstance";

function UserDashboard() {
  const [data, setData] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [returnedThisMonth, setReturnedThisMonth] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/catalog/get-request-item");
        console.log("Fetching Data");

        if (response.status === 200) {
          console.log("Data Fetched");

          const fetched = response.data;
          setData(fetched);

          // Separate pending and borrowed items
          const pending = fetched.filter((r) => r.status === "pending");
          const borrowed = fetched.filter(
            (r) => r.status === "borrowed" || r.status === "approved"
          );
          const overdue = fetched.filter((r) => {
            if (r.status === "borrowed" && r.returnDate) {
              return new Date(r.returnDate) < new Date();
            }
            return false;
          });
          const returned = fetched.filter((r) => {
            if (r.status === "returned" && r.returnDate) {
              const returnMonth = new Date(r.returnDate).getMonth();
              const currentMonth = new Date().getMonth();
              return returnMonth === currentMonth;
            }
            return false;
          });

          setPendingRequests(pending);
          setBorrowedItems(borrowed);
          setOverdueItems(overdue);
          setReturnedThisMonth(returned);

          // Transform borrow requests into recent activities (most recent 5)
          const activities = fetched.slice(0, 5).map((request) => ({
            id: request._id,
            action: getActivityAction(request.status),
            item: request.itemId?.name || "Unknown Item",
            date: request.createdAt || request.borrowDate,
            status: request.status,
          }));

          setRecentActivities(activities);
        } else {
          console.log("No data");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getActivityAction = (status) => {
    const actions = {
      pending: "Requested",
      approved: "Approved for",
      rejected: "Rejected for",
      borrowed: "Borrowed",
      returned: "Returned",
    };
    return actions[status] || "Activity on";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

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
        <InformationCard
          name="Active Borrows"
          icon="inventory"
          data={borrowedItems.length}
        />
        <InformationCard
          name="Pending Request"
          icon="borrow"
          data={pendingRequests.length}
        />
        <InformationCard
          name="Overdue Items"
          icon="dashboard"
          data={overdueItems.length}
        />
        <InformationCard
          name="Returned this Month"
          icon="history"
          data={returnedThisMonth.length}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {/* Pending Requests */}
          <div className="bg-white rounded-lg shadow-sm border border-black/10 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Pending Requests</h2>
              <Link
                to="/profile/transactions"
                className="text-(--accent) hover:text-(--accent-dark) font-semibold text-sm"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {pendingRequests.length > 0 ? (
                pendingRequests.slice(0, 3).map((request) => (
                  <div
                    key={request._id}
                    className="flex gap-3 border border-black/10 p-3 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <img
                      src={request.itemId?.image}
                      alt={request.itemId?.name}
                      className="w-20 h-20 object-cover border border-black/10 rounded-md shrink-0"
                    />
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {request.itemId?.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(request.borrowDate)}
                        </p>
                      </div>
                      <div className="self-end">
                        <span className="px-3 py-1 bg-(--info) text-white text-xs rounded-full font-medium">
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
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
              {borrowedItems.length > 0 ? (
                borrowedItems.slice(0, 3).map((borrow) => (
                  <div
                    key={borrow._id}
                    className="flex gap-3 border border-black/10 p-3 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <img
                      src={borrow.itemId?.image}
                      alt={borrow.itemId?.name}
                      className="w-20 h-20 object-cover border border-black/10 rounded-md shrink-0"
                    />
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {borrow.itemId?.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Due: {formatDate(borrow.returnDate)}
                        </p>
                      </div>
                      <div className="self-end">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                            borrow.statusColor
                          )}`}
                        >
                          {borrow.status.charAt(0).toUpperCase() +
                            borrow.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center text-center py-8 text-gray-500 w-full">
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
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity._id || activity.id}
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
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.date)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No recent activities</p>
                </div>
              )}
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
