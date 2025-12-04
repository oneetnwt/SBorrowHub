import React, { useState, useEffect } from "react";
import Modal from "../../components/modals/Modal";
import ConfirmModal from "../../components/modals/ConfirmModal";
import axiosInstance from "../../api/axiosInstance";

function OfficerRequests() {
  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  // TODO: Replace with API call to fetch borrow requests from backend
  // GET /api/admin/requests
  const [requests, setRequests] = useState([]);

  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch requests from backend
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axiosInstance.get(
          "/officer/get-all-transactions"
        );
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    fetchRequests();
  }, []);

  const getUrgencyStyle = (urgency) => {
    const styles = {
      high: "bg-red-100 text-red-700 border-red-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      low: "bg-green-100 text-green-700 border-green-200",
    };
    return styles[urgency];
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-blue-100 text-blue-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return styles[status];
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  const handleApprove = async () => {
    try {
      await axiosInstance.put(
        `/officer/update-request-status/${selectedRequest._id}`,
        { status: "approved" }
      );

      // Refresh requests
      const response = await axiosInstance.get("/officer/get-all-transactions");
      setRequests(response.data);

      setIsApproveModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error approving request:", error);
      alert(error.response?.data?.message || "Failed to approve request");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await axiosInstance.put(
        `/officer/update-request-status/${selectedRequest._id}`,
        { status: "rejected", rejectionReason: rejectReason }
      );

      // Refresh requests
      const response = await axiosInstance.get("/officer/get-all-transactions");
      setRequests(response.data);

      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert(error.response?.data?.message || "Failed to reject request");
    }
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  return (
    <section className="h-full w-full flex flex-col overflow-y-auto p-4 pb-16 bg-gray-50">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Borrow Requests</h1>
        <p className="text-sm text-gray-600 mt-0.5">
          Review and manage borrow requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs mb-0.5">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 shadow-sm">
          <p className="text-blue-600 text-xs mb-0.5">Pending</p>
          <p className="text-2xl font-bold text-blue-700">
            {requests.filter((r) => r.status === "pending").length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 shadow-sm">
          <p className="text-green-600 text-xs mb-0.5">Approved</p>
          <p className="text-2xl font-bold text-green-700">
            {requests.filter((r) => r.status === "approved").length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200 shadow-sm">
          <p className="text-red-600 text-xs mb-0.5">Rejected</p>
          <p className="text-2xl font-bold text-red-700">
            {requests.filter((r) => r.status === "rejected").length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-4 inline-flex">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === status
                ? "bg-(--accent) text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div
            key={request._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              {/* borrowerId Avatar */}
              <img
                src={request.borrowerId.profilePicture}
                alt={request.borrowerId.firstname}
                className="w-14 h-14 rounded-full border-2 border-gray-200"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      {request.borrowerId.fullname || request.borrowerId.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {request.borrowerId.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        request.status
                      )}`}
                    >
                      {request.status?.toUpperCase() || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Item Info */}
                <div className="grid md:grid-cols-2 gap-4 mb-3 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Item</p>
                    <p className="font-semibold text-gray-900">
                      {request.itemId.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Quantity</p>
                    <p className="font-semibold text-gray-900">
                      {request.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Borrow Date</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(request.borrowDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Return Date</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(request.returnDate)}
                    </p>
                  </div>
                </div>

                {/* Purpose */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Purpose</p>
                  <p className="text-sm text-gray-700">{request.purpose}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openDetailsModal(request)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Details
                  </button>

                  {request.status === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsApproveModalOpen(true);
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
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
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsRejectModalOpen(true);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Reject
                      </button>
                    </>
                  )}
                </div>

                {/* Request Date */}
                <p className="text-xs text-gray-400 mt-3">
                  Requested on {formatDate(request.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-300 mb-4"
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No requests found
          </h3>
          <p className="text-gray-500">
            There are no {filter} requests at the moment
          </p>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedRequest(null);
        }}
        title="Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <img
                src={selectedRequest.borrowerId.profilePicture}
                alt={
                  selectedRequest.borrowerId.fullname ||
                  selectedRequest.borrowerId.name
                }
                className="w-16 h-16 rounded-full border-2 border-gray-200"
              />
              <div>
                <h3 className="font-bold text-xl text-gray-900">
                  {selectedRequest.borrowerId.fullname ||
                    selectedRequest.borrowerId.name}
                </h3>
                <p className="text-gray-600">
                  {selectedRequest.borrowerId.email}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Item</p>
                  <p className="font-semibold text-lg text-gray-900">
                    {selectedRequest.itemId.name}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Quantity</p>
                  <p className="font-semibold text-lg text-gray-900">
                    {selectedRequest.quantity}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Borrow Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(selectedRequest.borrowDate)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Return Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(selectedRequest.returnDate)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Purpose</p>
                <p className="text-gray-900">{selectedRequest.purpose}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                    selectedRequest.status
                  )}`}
                >
                  {selectedRequest.status?.toUpperCase() || "N/A"}
                </span>
              </div>

              {selectedRequest.status === "rejected" &&
                selectedRequest.rejectionReason && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600 mb-1">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-900">
                      {selectedRequest.rejectionReason}
                    </p>
                  </div>
                )}

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 mb-1">Request Submitted</p>
                <p className="font-medium text-blue-900">
                  {formatDate(selectedRequest.createdAt)}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Confirmation */}
      <ConfirmModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApprove}
        title="Approve Request"
        message={`Approve borrow request for "${
          selectedRequest?.itemId.name
        }" by ${
          selectedRequest?.borrowerId?.fullname ||
          selectedRequest?.borrowerId?.name
        }?`}
        confirmText="Approve"
        type="success"
      />

      {/* Reject Modal with Reason */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setRejectReason("");
        }}
        title="Reject Request"
        size="sm"
      >
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-4">
              Please provide a reason for rejecting this request:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows="4"
              placeholder="Enter rejection reason..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectReason("");
              }}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Reject Request
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

export default OfficerRequests;
