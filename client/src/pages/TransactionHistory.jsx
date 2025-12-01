import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import Toast from "../components/Toast";

function TransactionHistory() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [toast, setToast] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setToast({
          message: "Loading transactions...",
          type: "success",
        });
        setTransactions([]); // Clear existing transactions
        const response = await axiosInstance.get("/catalog/get-request-item");
        console.log("Fetched transactions:", response.data);

        // Handle different response structures
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.transactions || response.data.data || [];

        setTransactions(data || []);
        setError(null);
        setToast(null); // Clear loading toast on success
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTransactions([]); // Clear transactions on error
        const errorMessage =
          err.response?.data?.message || "Failed to load transactions";
        setError(errorMessage);
        setToast({
          message: errorMessage,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const statusOptions = [
    { value: "all", label: "All Transactions" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "borrowed", label: "Borrowed" },
    { value: "returned", label: "Returned" },
  ];

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-blue-100 text-blue-800 border-blue-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      borrowed: "bg-purple-100 text-purple-800 border-purple-200",
      return_pending: "bg-orange-100 text-orange-800 border-orange-200",
      returned: "bg-green-100 text-green-800 border-green-200",
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatStatus = (status) => {
    const labels = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      borrowed: "Borrowed",
      return_pending: "Return Pending",
      returned: "Returned",
    };
    return labels[status] || status;
  };

  // Transform backend data to match display format
  const filteredTransactions = transactions
    .filter((txn) => {
      const matchesStatus =
        selectedStatus === "all" || txn.status === selectedStatus;
      const matchesSearch =
        txn.itemId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.requestCode?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by latest first

  const getDaysRemaining = (dueDate, status) => {
    if (status === "returned" || status === "rejected") return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `${Math.abs(diffDays)} days overdue`,
        color: "text-red-600",
      };
    } else if (diffDays === 0) {
      return { text: "Due today", color: "text-orange-600" };
    } else if (diffDays <= 3) {
      return { text: `${diffDays} days left`, color: "text-yellow-600" };
    }
    return { text: `${diffDays} days left`, color: "text-gray-600" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(
      selectedTransaction?._id === transaction._id ? null : transaction
    );
  };

  const handleMarkAsPickedUp = async (transactionId) => {
    try {
      setUpdatingStatus(transactionId);
      console.log("Marking transaction as picked up:", transactionId);

      const response = await axiosInstance.put(
        `/catalog/mark-picked-up/${transactionId}`
      );

      console.log("Response from server:", response.data);

      // Update local state with the returned borrowRequest
      setTransactions((prevTransactions) =>
        prevTransactions.map((txn) =>
          txn._id === transactionId
            ? {
                ...txn,
                status: "borrowed",
                actualBorrowDate:
                  response.data.borrowRequest?.actualBorrowDate || new Date(),
              }
            : txn
        )
      );

      // Show success toast
      setToast({
        message: "Item marked as picked up successfully!",
        type: "success",
      });
      console.log("✅ SUCCESS: Toast displayed - Item marked as picked up");
    } catch (error) {
      console.error("Error marking as picked up:", error);
      console.error("Error response status:", error.response?.status);
      console.error("Error response data:", error.response?.data);
      console.error("Error message:", error.message);

      let errorMessage = "Failed to mark as picked up";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "Transaction not found";
      } else if (error.response?.status === 403) {
        errorMessage = "Unauthorized action";
      } else if (error.response?.status === 400) {
        errorMessage = "Only approved requests can be marked as picked up";
      } else if (!error.response) {
        errorMessage = "Network error - please check your connection";
      }

      // Show error toast
      setToast({
        message: errorMessage,
        type: "error",
      });
      console.log("❌ ERROR: Toast displayed -", errorMessage);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleRequestReturn = async (transactionId) => {
    try {
      setUpdatingStatus(transactionId);
      console.log("Requesting return approval:", transactionId);

      const response = await axiosInstance.put(
        `/catalog/request-return/${transactionId}`
      );

      console.log("Response from server:", response.data);

      // Update local state
      setTransactions((prevTransactions) =>
        prevTransactions.map((txn) =>
          txn._id === transactionId
            ? {
                ...txn,
                status: "return_pending",
              }
            : txn
        )
      );

      setToast({
        message:
          "Return request submitted successfully! Waiting for officer approval.",
        type: "success",
      });
      console.log("✅ SUCCESS: Return request submitted");
    } catch (error) {
      console.error("Error requesting return:", error);

      let errorMessage = "Failed to submit return request";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "Transaction not found";
      } else if (error.response?.status === 403) {
        errorMessage = "Unauthorized action";
      } else if (error.response?.status === 400) {
        errorMessage = "Only borrowed items can request return";
      } else if (!error.response) {
        errorMessage = "Network error - please check your connection";
      }

      setToast({
        message: errorMessage,
        type: "error",
      });
      console.log("❌ ERROR:", errorMessage);
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <>
      <section className="h-full w-full flex flex-col p-6 bg-gray-50">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Transaction History
          </h1>
          <p className="text-gray-600 mt-1">Track your borrowing activities</p>
        </div>

        {!isLoading && !error && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 font-medium">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {transactions.length}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 font-medium">
                  Pending Requests
                </p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {transactions.filter((t) => t.status === "pending").length}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 font-medium">
                  Currently Borrowed
                </p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {transactions.filter((t) => t.status === "borrowed").length}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 font-medium">
                  Completed Returns
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {transactions.filter((t) => t.status === "returned").length}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <svg
                      className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                    <input
                      type="text"
                      placeholder="Search by item name or transaction ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Status Filter Pills */}
                <div className="flex gap-2 flex-wrap">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedStatus(option.value)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        selectedStatus === option.value
                          ? "bg-(--accent) text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto">
              {filteredTransactions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-gray-400"
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
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No transactions found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or search query
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((txn) => {
                    const isSelected = selectedTransaction?._id === txn._id;
                    const daysInfo = getDaysRemaining(
                      txn.returnDate,
                      txn.status
                    );

                    return (
                      <div
                        key={txn._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Main Card Content */}
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            {/* Left: Item Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {txn.itemId?.name || "Unknown Item"}
                                </h3>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                                    txn.status
                                  )}`}
                                >
                                  {formatStatus(txn.status)}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                    />
                                  </svg>
                                  <span className="font-mono text-xs">
                                    {txn.requestCode}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <svg
                                    className="w-4 h-4"
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
                                  <span>Qty: {txn.quantity}</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <svg
                                    className="w-4 h-4"
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
                                  <span>{formatDate(txn.borrowDate)}</span>
                                </div>

                                {daysInfo && (
                                  <div
                                    className={`flex items-center gap-1.5 font-medium ${daysInfo.color}`}
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span>{daysInfo.text}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2">
                              {txn.status === "approved" && (
                                <button
                                  onClick={() => handleMarkAsPickedUp(txn._id)}
                                  disabled={updatingStatus === txn._id}
                                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                  {updatingStatus === txn._id
                                    ? "Processing..."
                                    : "Mark Picked Up"}
                                </button>
                              )}

                              {txn.status === "borrowed" && (
                                <button
                                  onClick={() => handleRequestReturn(txn._id)}
                                  disabled={updatingStatus === txn._id}
                                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                  {updatingStatus === txn._id
                                    ? "Processing..."
                                    : "Request Return"}
                                </button>
                              )}

                              <button
                                onClick={() => handleViewDetails(txn)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <svg
                                  className={`w-5 h-5 text-gray-600 transition-transform ${
                                    isSelected ? "rotate-180" : ""
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
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isSelected && (
                          <div className="border-t border-gray-200 bg-gray-50 p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Item Details */}
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
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
                                  Item Details
                                </h4>
                                <dl className="space-y-2">
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-600">
                                      Name
                                    </dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                      {txn.itemId?.name}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-600">
                                      Category
                                    </dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                      {txn.itemId?.category || "N/A"}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-600">
                                      Quantity
                                    </dt>
                                    <dd className="text-sm font-medium text-(--accent)">
                                      {txn.quantity}
                                    </dd>
                                  </div>
                                </dl>
                              </div>

                              {/* Timeline */}
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
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
                                </h4>
                                <dl className="space-y-2">
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-600">
                                      Borrow Date
                                    </dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                      {formatDate(txn.borrowDate)}
                                    </dd>
                                  </div>
                                  {txn.actualBorrowDate && (
                                    <div className="flex justify-between">
                                      <dt className="text-sm text-gray-600">
                                        Picked Up
                                      </dt>
                                      <dd className="text-sm font-medium text-blue-600">
                                        {formatDate(txn.actualBorrowDate)}
                                      </dd>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-600">
                                      Due Date
                                    </dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                      {formatDate(txn.returnDate)}
                                    </dd>
                                  </div>
                                  {txn.actualReturnDate && (
                                    <div className="flex justify-between">
                                      <dt className="text-sm text-gray-600">
                                        Returned
                                      </dt>
                                      <dd className="text-sm font-medium text-green-600">
                                        {formatDate(txn.actualReturnDate)}
                                      </dd>
                                    </div>
                                  )}
                                </dl>
                              </div>

                              {/* Purpose & Notes */}
                              {(txn.purpose || txn.notes) && (
                                <div className="md:col-span-2 bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
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
                                  </h4>
                                  {txn.purpose && (
                                    <div className="mb-3">
                                      <p className="text-sm text-gray-600 mb-1">
                                        Purpose
                                      </p>
                                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        {txn.purpose}
                                      </p>
                                    </div>
                                  )}
                                  {txn.notes && (
                                    <div>
                                      <p className="text-sm text-gray-600 mb-1">
                                        Notes
                                      </p>
                                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        {txn.notes}
                                      </p>
                                    </div>
                                  )}
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

      {/* Toast Notification - Outside section for proper z-index */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default TransactionHistory;
