import React, { useState, useEffect } from "react";
import Modal from "../../components/modals/Modal";
import axiosInstance from "../../api/axiosInstance";

function OfficerTransactions() {
  // TODO: Replace with API call to fetch transactions from backend
  // GET /api/admin/transactions
  const [transactions, setTransactions] = useState([]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axiosInstance.get(
          "/officer/get-all-transactions"
        );
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        alert("Failed to fetch transactions. Using mock data.");
      }
    };
    fetchTransactions();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      completed: "bg-green-100 text-green-700",
      active: "bg-blue-100 text-blue-700",
      overdue: "bg-red-100 text-red-700",
    };
    return styles[status];
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchesStatus = filterStatus === "all" || txn.status === filterStatus;
    const matchesSearch =
      (txn.borrowerId?.fullname || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (txn.item || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.id || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <section className="h-full w-full flex flex-col overflow-y-auto p-4 pb-16 bg-gray-50">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Transaction History
        </h1>
        <p className="text-sm text-gray-600 mt-0.5">
          View and manage all borrow transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs mb-0.5">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900">
            {transactions.length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 shadow-sm">
          <p className="text-blue-600 text-xs mb-0.5">Active</p>
          <p className="text-2xl font-bold text-blue-700">
            {transactions.filter((t) => t.status === "active").length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 shadow-sm">
          <p className="text-green-600 text-xs mb-0.5">Completed</p>
          <p className="text-2xl font-bold text-green-700">
            {transactions.filter((t) => t.status === "completed").length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200 shadow-sm">
          <p className="text-red-600 text-xs mb-0.5">Overdue</p>
          <p className="text-2xl font-bold text-red-700">
            {transactions.filter((t) => t.status === "overdue").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
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
              placeholder="Search by user, item, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent)"
            />
          </div>

          <div className="flex gap-2">
            {["all", "active", "completed", "overdue"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all capitalize ${
                  filterStatus === status
                    ? "bg-(--accent) text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Borrow Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Return Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((txn) => (
                <tr
                  key={txn._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {txn.requestCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={txn.borrowerId.profilePicture}
                        alt={txn.borrowerId.fullname}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {txn.borrowerId.fullname}
                        </p>
                        <p className="text-sm text-gray-500">
                          {txn.borrowerId?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {txn.itemId.name}
                    </p>
                    <p className="text-sm text-gray-500">Qty: {txn.quantity}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(txn.borrowDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">
                      {formatDate(txn.returnDate)}
                    </p>
                    {txn.actualReturnDate && (
                      <p className="text-xs text-gray-500">
                        Returned: {formatDate(txn.actualReturnDate)}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        txn.status
                      )}`}
                    >
                      {txn.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedTransaction(txn);
                        setIsDetailsModalOpen(true);
                      }}
                      className="text-(--accent) hover:text-(--accent-dark) font-medium text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedTransaction(null);
        }}
        title="Transaction Details"
        size="lg"
      >
        {selectedTransaction && (
          <div className="p-6">
            <div className="space-y-6">
              {/* Transaction ID */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                <p className="font-mono text-xl font-bold text-gray-900">
                  {selectedTransaction.id}
                </p>
              </div>

              {/* User Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  User Information
                </h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={
                      selectedTransaction.borrowerId?.profilePicture ||
                      "/default-avatar.png"
                    }
                    alt={selectedTransaction.borrowerId?.firstname || "User"}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-lg text-gray-900">
                      {selectedTransaction.borrowerId?.firstname +
                        " " +
                        selectedTransaction.borrowerId?.lastname || "N/A"}
                    </p>
                    <p className="text-gray-600">
                      {selectedTransaction.borrowerId?.email || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Item Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Item Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Item Name</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTransaction.itemId.name}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Quantity</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTransaction.quantity}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Condition</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTransaction.condition}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        selectedTransaction.status
                      )}`}
                    >
                      {selectedTransaction.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium">
                        Borrow Date
                      </p>
                      <p className="font-semibold text-blue-900">
                        {formatDate(selectedTransaction.borrowDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-purple-600 font-medium">
                        Expected Return Date
                      </p>
                      <p className="font-semibold text-purple-900">
                        {formatDate(selectedTransaction.returnDate)}
                      </p>
                    </div>
                  </div>

                  {selectedTransaction.actualReturnDate && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-medium">
                          Actual Return Date
                        </p>
                        <p className="font-semibold text-green-900">
                          {formatDate(selectedTransaction.actualReturnDate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default OfficerTransactions;
