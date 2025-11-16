import React, { useState, useEffect } from "react";
import Modal from "../../components/modals/Modal";
import axiosInstance from "../../api/axiosInstance";

function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/admin/get-all-feedback");
        setFeedbacks(response.data);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      resolved: "bg-green-100 text-green-700 border-green-200",
      inProgress: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return styles[status] || styles.pending;
  };

  const getTypeIcon = (type) => {
    const icons = {
      bug: (
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      feature: (
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
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      general: (
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
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      ),
      complaint: (
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
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    };
    return icons[type] || icons.general;
  };

  const getTypeBadge = (type) => {
    const badges = {
      bug: "bg-red-100 text-red-700 border-red-200",
      feature: "bg-purple-100 text-purple-700 border-purple-200",
      general: "bg-blue-100 text-blue-700 border-blue-200",
      complaint: "bg-orange-100 text-orange-700 border-orange-200",
    };
    return badges[type] || badges.general;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredFeedback = feedbacks.filter((feedback) => {
    const matchesStatus =
      filterStatus === "all" || feedback.status === filterStatus;
    const matchesType = filterType === "all" || feedback.type === filterType;
    const matchesSearch =
      feedback.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setIsDetailsModalOpen(true);
  };

  const handleRespond = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseText("");
    setIsRespondModalOpen(true);
  };

  const handleSubmitResponse = async () => {
    try {
      await axiosInstance.post(
        `/admin/respond-feedback/${selectedFeedback._id}`,
        {
          response: responseText,
        }
      );

      setFeedbacks(
        feedbacks.map((f) =>
          f._id === selectedFeedback._id
            ? { ...f, status: "resolved", response: responseText }
            : f
        )
      );
      setIsRespondModalOpen(false);
      setResponseText("");
    } catch (error) {
      console.error("Error submitting response:", error);
      alert("Failed to submit response. Please try again.");
    }
  };

  const handleUpdateStatus = async (feedbackId, newStatus) => {
    try {
      await axiosInstance.put(`/admin/update-feedback-status/${feedbackId}`, {
        status: newStatus,
      });

      setFeedbacks(
        feedbacks.map((f) =>
          f._id === feedbackId ? { ...f, status: newStatus } : f
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <section className="h-full w-full flex flex-col overflow-y-auto p-4 pb-16 bg-gray-50">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Feedback Management
        </h1>
        <p className="text-sm text-gray-600 mt-0.5">
          View and respond to user feedback and inquiries
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs mb-0.5">Total Feedback</p>
          <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 shadow-sm">
          <p className="text-yellow-600 text-xs mb-0.5">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">
            {feedbacks.filter((f) => f.status === "pending").length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 shadow-sm">
          <p className="text-blue-600 text-xs mb-0.5">In Progress</p>
          <p className="text-2xl font-bold text-blue-700">
            {feedbacks.filter((f) => f.status === "inProgress").length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 shadow-sm">
          <p className="text-green-600 text-xs mb-0.5">Resolved</p>
          <p className="text-2xl font-bold text-green-700">
            {feedbacks.filter((f) => f.status === "resolved").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
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
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent)"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent)"
          >
            <option value="all">All Types</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="general">General Inquiry</option>
            <option value="complaint">Complaint</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent)"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="inProgress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading feedback...
                  </td>
                </tr>
              ) : filteredFeedback.length > 0 ? (
                filteredFeedback.map((feedback) => (
                  <tr key={feedback._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border ${getTypeBadge(
                            feedback.type
                          )}`}
                        >
                          {getTypeIcon(feedback.type)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-900">
                        {feedback.subject || "No Subject"}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">
                        {feedback.message}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {feedback.userName || feedback.userEmail || "Anonymous"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(feedback.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={feedback.status}
                        onChange={(e) =>
                          handleUpdateStatus(feedback._id, e.target.value)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                          feedback.status
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="inProgress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(feedback)}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md font-medium transition-colors"
                        >
                          View
                        </button>
                        {feedback.status !== "resolved" && (
                          <button
                            onClick={() => handleRespond(feedback)}
                            className="px-3 py-1.5 bg-(--accent) hover:bg-(--accent-dark) text-white text-xs rounded-md font-medium transition-colors"
                          >
                            Respond
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No feedback found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedFeedback(null);
        }}
        title="Feedback Details"
        size="lg"
      >
        {selectedFeedback && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border ${getTypeBadge(
                  selectedFeedback.type
                )}`}
              >
                {getTypeIcon(selectedFeedback.type)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">
                  {selectedFeedback.subject || "No Subject"}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedFeedback.userName || selectedFeedback.userEmail} •{" "}
                  {formatDate(selectedFeedback.createdAt)}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                  selectedFeedback.status
                )}`}
              >
                {selectedFeedback.status}
              </span>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Message</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedFeedback.message}
                </p>
              </div>
            </div>

            {selectedFeedback.response && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Admin Response
                </h4>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedFeedback.response}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Respond Modal */}
      <Modal
        isOpen={isRespondModalOpen}
        onClose={() => {
          setIsRespondModalOpen(false);
          setSelectedFeedback(null);
          setResponseText("");
        }}
        title="Respond to Feedback"
        size="lg"
      >
        {selectedFeedback && (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Original Message</p>
              <p className="text-sm text-gray-700">
                {selectedFeedback.message}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={6}
                placeholder="Type your response here..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent) resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setIsRespondModalOpen(false);
                  setSelectedFeedback(null);
                  setResponseText("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResponse}
                disabled={!responseText.trim()}
                className="flex-1 px-4 py-2 bg-(--accent) hover:bg-(--accent-dark) disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Send Response
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default AdminFeedback;
