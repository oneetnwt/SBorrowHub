import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

function OfficerAnalytics() {
  // TODO: Replace with API calls to fetch analytics data from backend
  // GET /api/admin/analytics/overview
  // GET /api/admin/analytics/trends
  // GET /api/admin/analytics/popular-items
  // GET /api/admin/analytics/user-activity

  const [analyticsData, setAnalyticsData] = useState({
    totalTransactions: 1234,
    activeUsers: 156,
    totalItems: 243,
    utilizationRate: 68,
    returnRate: 89,
    avgBorrowDays: 2.5,
    pendingRequests: 12,
    overdueItems: 8,
  });

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axiosInstance.get("/api/admin/analytics");
        if (response.data) {
          setAnalyticsData(response.data);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        // Keep using mock data if fetch fails
      }
    };
    fetchAnalytics();
  }, []);

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
      {/* TODO: Replace hardcoded values with API data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md">
          <p className="text-blue-100 text-xs mb-1">Total Transactions</p>
          <p className="text-3xl font-bold mb-1">1,234</p>
          <p className="text-blue-100 text-xs">+12% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-md">
          <p className="text-green-100 text-xs mb-1">Active Users</p>
          <p className="text-3xl font-bold mb-1">156</p>
          <p className="text-green-100 text-xs">+8% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-md">
          <p className="text-purple-100 text-xs mb-1">Total Items</p>
          <p className="text-3xl font-bold mb-1">243</p>
          <p className="text-purple-100 text-xs">+15 new this month</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white shadow-md">
          <p className="text-orange-100 text-xs mb-1">Utilization Rate</p>
          <p className="text-3xl font-bold mb-1">68%</p>
          <p className="text-orange-100 text-xs">+5% from last month</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      {/* TODO: Integrate chart library (e.g., Chart.js, Recharts) and connect to API */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-base text-gray-900 mb-3">
            Monthly Borrows
          </h3>
          <div className="h-56 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">TODO: Chart - Monthly Borrow Trends</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-base text-gray-900 mb-3">
            Popular Items
          </h3>
          <div className="h-56 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">TODO: Chart - Most Borrowed Items</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-base text-gray-900 mb-3">
            User Activity
          </h3>
          <div className="h-56 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">TODO: Chart - User Engagement</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-base text-gray-900 mb-3">
            Category Distribution
          </h3>
          <div className="h-56 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">TODO: Chart - Items by Category</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {/* TODO: Replace hardcoded values with API data */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-bold text-base text-gray-900 mb-3">
          Quick Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xl font-bold text-gray-900">89%</p>
            <p className="text-xs text-gray-600 mt-1">Return Rate</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xl font-bold text-gray-900">2.5</p>
            <p className="text-xs text-gray-600 mt-1">Avg. Borrow Days</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-600 mt-1">Pending Requests</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xl font-bold text-gray-900">8</p>
            <p className="text-xs text-gray-600 mt-1">Overdue Items</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OfficerAnalytics;
