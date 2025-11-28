import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Loader from "../../components/Loader";

function OfficerAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    pendingRequests: 0,
    activeLoans: 0,
    overdueItems: 0,
    monthlyBorrows: 0,
  });

  const [transactions, setTransactions] = useState([]);

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, transactionsRes] = await Promise.all([
          axiosInstance.get("/officer/dashboard-stats"),
          axiosInstance.get("/officer/get-all-transactions"),
        ]);

        if (statsRes.data) {
          setStats(statsRes.data);
        }
        if (transactionsRes.data) {
          setTransactions(transactionsRes.data);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process data for charts
  const statusData = [
    { name: "Pending", value: stats.pendingRequests, color: "#f59e0b" },
    { name: "Active", value: stats.activeLoans, color: "#3b82f6" },
    { name: "Overdue", value: stats.overdueItems, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  const hasStatusData =
    statusData.length > 0 && statusData.some((item) => item.value > 0);

  const totalRequests = transactions.length;
  const returnedCount = transactions.filter(
    (t) => t.status === "returned"
  ).length;
  const returnRate =
    totalRequests > 0 ? ((returnedCount / totalRequests) * 100).toFixed(1) : 0;

  // Get top borrowed items
  const itemCounts = {};
  transactions.forEach((t) => {
    const itemName = t.itemId?.name || "Unknown";
    itemCounts[itemName] = (itemCounts[itemName] || 0) + 1;
  });
  const topItems = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (loading) {
    return (
      <section className="h-full w-full flex items-center justify-center">
        <Loader />
      </section>
    );
  }

  return (
    <section className="h-full w-full flex flex-col overflow-y-auto p-4 pb-16 bg-gray-50">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics & Reports
        </h1>
        <p className="text-sm text-gray-600 mt-0.5">
          View system statistics and insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md">
          <p className="text-blue-100 text-xs mb-1">Total Users</p>
          <p className="text-3xl font-bold mb-1">{stats.totalUsers}</p>
          <p className="text-blue-100 text-xs">Active borrowers</p>
        </div>

        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-md">
          <p className="text-green-100 text-xs mb-1">Total Items</p>
          <p className="text-3xl font-bold mb-1">{stats.totalItems}</p>
          <p className="text-green-100 text-xs">In inventory</p>
        </div>

        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-md">
          <p className="text-purple-100 text-xs mb-1">Active Loans</p>
          <p className="text-3xl font-bold mb-1">{stats.activeLoans}</p>
          <p className="text-purple-100 text-xs">Currently borrowed</p>
        </div>

        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white shadow-md">
          <p className="text-orange-100 text-xs mb-1">Monthly Borrows</p>
          <p className="text-3xl font-bold mb-1">{stats.monthlyBorrows}</p>
          <p className="text-orange-100 text-xs">This month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-base text-gray-900 mb-3">
            Request Status Distribution
          </h3>
          {hasStatusData ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ outline: "none" }}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              No request data available
            </div>
          )}
        </div>

        {/* Top Borrowed Items Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-base text-gray-900 mb-3">
            Top 5 Borrowed Items
          </h3>
          {topItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#8b5cf6"
                  style={{ outline: "none" }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              No borrow data available
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-bold text-base text-gray-900 mb-3">
          Quick Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
            <p className="text-2xl font-bold text-green-600">{returnRate}%</p>
            <p className="text-xs text-gray-600 mt-1">Return Rate</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-2xl font-bold text-blue-600">{totalRequests}</p>
            <p className="text-xs text-gray-600 mt-1">Total Requests</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
            <p className="text-2xl font-bold text-orange-600">
              {stats.pendingRequests}
            </p>
            <p className="text-xs text-gray-600 mt-1">Pending Requests</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="text-2xl font-bold text-red-600">
              {stats.overdueItems}
            </p>
            <p className="text-xs text-gray-600 mt-1">Overdue Items</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OfficerAnalytics;
