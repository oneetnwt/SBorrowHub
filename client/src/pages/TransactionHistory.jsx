import { useState, useEffect, Fragment } from "react";
import axiosInstance from "../api/axiosInstance";

function TransactionHistory() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTransactionId, setExpandedTransactionId] = useState(null);

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setTransactions([]); // Clear existing transactions
        const response = await axiosInstance.get("/catalog/get-request-item");
        console.log("Fetched transactions:", response.data);

        // Handle different response structures
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.transactions || response.data.data || [];

        setTransactions(data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTransactions([]); // Clear transactions on error
        setError(err.response?.data?.message || "Failed to load transactions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const statusOptions = [
    { value: "all", label: "All Transactions", color: "neutral" },
    { value: "borrowed", label: "Currently Borrowed", color: "info" },
    { value: "returned", label: "Returned", color: "success" },
    { value: "overdue", label: "Overdue", color: "error" },
  ];

  const getStatusBadge = (status) => {
    const statusColors = {
      borrowed: "text-(--info)",
      returned: "text-(--success)",
      overdue: "text-(--error)",
      pending: "text-yellow-500",
    };

    return (
      <span
        className={`text-xs font-medium ${
          statusColors[status] || "text-gray-500"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Transform backend data to match display format
  const transformedTransactions = transactions.map((item) => {
    return {
      id: item.requestCode,
      itemName: item.itemId.name,
      borrowDate: item.borrowDate,
      returnDate: item.returnDate || item.actualReturnDate,
      dueDate: item.dueDate || item.returnDate,
      status: item.status || "pending",
      tags: item.tags || item.itemId?.tags || [],
    };
  });

  const filteredTransactions = transformedTransactions.filter((transaction) => {
    const matchesStatus =
      selectedStatus === "all" || transaction.status === selectedStatus;
    const matchesSearch =
      transaction.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getDaysRemaining = (dueDate, status) => {
    if (status === "returned") return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="text-(--error) font-semibold">
          {Math.abs(diffDays)} days overdue
        </span>
      );
    } else if (diffDays === 0) {
      return <span className="text-(--warning) font-semibold">Due today</span>;
    } else if (diffDays <= 3) {
      return <span className="text-(--warning)">Due in {diffDays} days</span>;
    }
    return <span className="text-gray-600">Due in {diffDays} days</span>;
  };

  const handleViewDetails = (transactionId) => {
    setExpandedTransactionId(
      expandedTransactionId === transactionId ? null : transactionId
    );
  };

  return (
    <section className="h-full w-full flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">Transaction History</h1>
        <p className="text-gray-600 text-sm">
          View and manage all borrowing transactions
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--primary)"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-(--error)/10 border border-(--error) text-(--error) rounded-lg p-4 mb-4">
          <p className="font-medium">Error loading transactions</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-black/10 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by item or transaction ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) text-sm"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 absolute left-3 top-2.5 text-gray-400"
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
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 flex-wrap">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedStatus === option.value
                        ? "bg-(--accent) text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "table"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-200"
                  }`}
                  title="Table View"
                >
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
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "card"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-200"
                  }`}
                  title="Card View"
                >
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
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-black/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-(--accent)">
                  {transactions.length}
                </p>
                <p className="text-xs text-gray-600">Total Transactions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-(--info)">
                  {transactions.filter((t) => t.status === "borrowed").length}
                </p>
                <p className="text-xs text-gray-600">Currently Borrowed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-(--success)">
                  {transactions.filter((t) => t.status === "returned").length}
                </p>
                <p className="text-xs text-gray-600">Returned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-(--error)">
                  {transactions.filter((t) => t.status === "overdue").length}
                </p>
                <p className="text-xs text-gray-600">Overdue</p>
              </div>
            </div>
          </div>
          {/* Transactions Display */}
          <div className="flex-1 overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 border border-black/10 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No transactions found
                </h3>
                <p className="text-gray-500 text-sm">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : viewMode === "table" ? (
              // Table View
              <div className="bg-white rounded-lg shadow-sm border border-black/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-black/10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Item Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Borrow Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {filteredTransactions.map((transaction) => {
                        const fullTransaction = transactions.find(
                          (t) => t.requestCode === transaction.id
                        );
                        const isExpanded =
                          expandedTransactionId === transaction.id;

                        return (
                          <Fragment key={transaction.id}>
                            <tr className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {transaction.id}
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {transaction.itemName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {transaction.tags &&
                                    transaction.tags.length > 0
                                      ? transaction.tags.join(", ")
                                      : "No tags"}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {new Date(
                                  transaction.borrowDate
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="text-sm text-gray-700">
                                    {new Date(
                                      transaction.dueDate
                                    ).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs">
                                    {getDaysRemaining(
                                      transaction.dueDate,
                                      transaction.status
                                    )}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-left">
                                {getStatusBadge(transaction.status)}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() =>
                                    handleViewDetails(transaction.id)
                                  }
                                  className="text-sm text-(--accent) hover:text-(--accent-dark) font-medium flex items-center gap-1"
                                >
                                  {isExpanded ? "Hide Details" : "View Details"}
                                  <svg
                                    className={`w-4 h-4 transition-transform ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>
                              </td>
                            </tr>

                            {/* Expanded Details Row */}
                            {isExpanded && fullTransaction && (
                              <tr>
                                <td
                                  colSpan="6"
                                  className="bg-gray-50 px-4 py-6"
                                >
                                  <div className="max-w-4xl mx-auto space-y-6">
                                    {/* Header with Request Code */}
                                    <div className="bg-white rounded-lg p-4 border-l-4 border-(--accent) shadow-sm">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm text-gray-600 mb-1">
                                            Request Code
                                          </p>
                                          <p className="text-2xl font-bold text-gray-900">
                                            {fullTransaction.requestCode}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm text-gray-600 mb-1">
                                            Status
                                          </p>
                                          <div className="text-lg">
                                            {getStatusBadge(
                                              fullTransaction.status
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Grid Layout for Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Item Information */}
                                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                        <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                          <svg
                                            className="w-5 h-5 text-(--accent)"
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
                                          Item Information
                                        </h3>
                                        <div className="space-y-3">
                                          <div className="flex justify-between items-start">
                                            <span className="text-sm text-gray-600">
                                              Item Name
                                            </span>
                                            <span className="font-semibold text-gray-900 text-right">
                                              {fullTransaction.itemId?.name}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                              Category
                                            </span>
                                            <span className="font-medium text-gray-900">
                                              {fullTransaction.itemId
                                                ?.category || "N/A"}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                              Quantity
                                            </span>
                                            <span className="font-semibold text-(--accent)">
                                              {fullTransaction.quantity}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Timeline */}
                                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                        <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                          <svg
                                            className="w-5 h-5 text-(--accent)"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                          </svg>
                                          Timeline
                                        </h3>
                                        <div className="space-y-3">
                                          <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                              Borrow Date
                                            </span>
                                            <span className="font-medium text-gray-900">
                                              {new Date(
                                                fullTransaction.borrowDate
                                              ).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                              })}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                              Due Date
                                            </span>
                                            <span className="font-medium text-gray-900">
                                              {new Date(
                                                fullTransaction.returnDate
                                              ).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                              })}
                                            </span>
                                          </div>
                                          {fullTransaction.actualReturnDate && (
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600">
                                                Returned On
                                              </span>
                                              <span className="font-medium text-(--success)">
                                                {new Date(
                                                  fullTransaction.actualReturnDate
                                                ).toLocaleDateString("en-US", {
                                                  year: "numeric",
                                                  month: "short",
                                                  day: "numeric",
                                                })}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Purpose & Notes */}
                                    {(fullTransaction.purpose ||
                                      fullTransaction.notes) && (
                                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                        <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                          <svg
                                            className="w-5 h-5 text-(--accent)"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                          </svg>
                                          Additional Information
                                        </h3>
                                        <div className="space-y-3">
                                          {fullTransaction.purpose && (
                                            <div>
                                              <p className="text-sm text-gray-600 mb-1">
                                                Purpose
                                              </p>
                                              <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                                                {fullTransaction.purpose}
                                              </p>
                                            </div>
                                          )}
                                          {fullTransaction.notes && (
                                            <div>
                                              <p className="text-sm text-gray-600 mb-1">
                                                Notes
                                              </p>
                                              <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                                                {fullTransaction.notes}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // Card View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTransactions.map((transaction) => {
                  const fullTransaction = transactions.find(
                    (t) => t.requestCode === transaction.id
                  );
                  const isExpanded = expandedTransactionId === transaction.id;

                  return (
                    <div
                      key={transaction.id}
                      className={`bg-white rounded-lg shadow-sm border border-black/10 transition-all ${
                        isExpanded ? "md:col-span-2 lg:col-span-3" : ""
                      }`}
                    >
                      {/* Card Header */}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {transaction.itemName}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {transaction.tags && transaction.tags.length > 0
                                ? transaction.tags.join(", ")
                                : "No tags"}
                            </p>
                          </div>
                          {getStatusBadge(transaction.status)}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Transaction ID:
                            </span>
                            <span className="font-medium text-gray-900">
                              {transaction.id}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Borrowed:</span>
                            <span className="text-gray-700">
                              {new Date(
                                transaction.borrowDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Due Date:</span>
                            <span className="text-gray-700">
                              {new Date(
                                transaction.dueDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          {transaction.status !== "returned" && (
                            <div className="pt-2 border-t border-black/10">
                              {getDaysRemaining(
                                transaction.dueDate,
                                transaction.status
                              )}
                            </div>
                          )}
                          {transaction.status === "returned" && (
                            <div className="flex justify-between text-sm pt-2 border-t border-black/10">
                              <span className="text-gray-600">Returned:</span>
                              <span className="text-gray-700">
                                {new Date(
                                  transaction.returnDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleViewDetails(transaction.id)}
                          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {isExpanded ? "Hide Details" : "View Details"}
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && fullTransaction && (
                        <div className="border-t border-gray-200 bg-gray-50 p-6">
                          <div className="space-y-4">
                            {/* Header with Request Code */}
                            <div className="bg-white rounded-lg p-4 border-l-4 border-(--accent) shadow-sm">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">
                                    Request Code
                                  </p>
                                  <p className="text-xl font-bold text-gray-900">
                                    {fullTransaction.requestCode}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600 mb-1">
                                    Status
                                  </p>
                                  <div className="text-lg">
                                    {getStatusBadge(fullTransaction.status)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Grid Layout for Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Item Information */}
                              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <svg
                                    className="w-5 h-5 text-(--accent)"
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
                                  Item Information
                                </h3>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start">
                                    <span className="text-sm text-gray-600">
                                      Item Name
                                    </span>
                                    <span className="font-semibold text-gray-900 text-right">
                                      {fullTransaction.itemId?.name}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                      Category
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {fullTransaction.itemId?.category ||
                                        "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                      Quantity
                                    </span>
                                    <span className="font-semibold text-(--accent)">
                                      {fullTransaction.quantity}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Timeline */}
                              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <svg
                                    className="w-5 h-5 text-(--accent)"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  Timeline
                                </h3>
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                      Borrow Date
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {new Date(
                                        fullTransaction.borrowDate
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                      Due Date
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {new Date(
                                        fullTransaction.returnDate
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  {fullTransaction.actualReturnDate && (
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">
                                        Returned On
                                      </span>
                                      <span className="font-medium text-(--success)">
                                        {new Date(
                                          fullTransaction.actualReturnDate
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Purpose & Notes */}
                            {(fullTransaction.purpose ||
                              fullTransaction.notes) && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <svg
                                    className="w-5 h-5 text-(--accent)"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  Additional Information
                                </h3>
                                <div className="space-y-3">
                                  {fullTransaction.purpose && (
                                    <div>
                                      <p className="text-sm text-gray-600 mb-1">
                                        Purpose
                                      </p>
                                      <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                                        {fullTransaction.purpose}
                                      </p>
                                    </div>
                                  )}
                                  {fullTransaction.notes && (
                                    <div>
                                      <p className="text-sm text-gray-600 mb-1">
                                        Notes
                                      </p>
                                      <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                                        {fullTransaction.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default TransactionHistory;
