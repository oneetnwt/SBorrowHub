import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import Toast from "../../components/Toast";
import ConfirmModal from "../../components/modals/ConfirmModal";

const BackupSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            File Name
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Size
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Created At
          </th>
          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {[1, 2, 3].map((i) => (
          <tr key={i} className="animate-pulse">
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AdminBackup = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    fileName: null,
  });

  useEffect(() => {
    fetchBackups();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/backup/list");
      setBackups(response.data);
    } catch (error) {
      console.error("Error fetching backups:", error);
      setToast({
        message: error.response?.data?.message || "Failed to load backups",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const response = await axiosInstance.post("/backup/create");
      setToast({
        message: "Backup created successfully!",
        type: "success",
      });
      fetchBackups();
    } catch (error) {
      console.error("Error creating backup:", error);
      setToast({
        message: error.response?.data?.message || "Failed to create backup",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = async (fileName) => {
    try {
      const response = await axiosInstance.get(`/backup/download/${fileName}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setToast({
        message: "Backup downloaded successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error downloading backup:", error);
      setToast({
        message: "Failed to download backup",
        type: "error",
      });
    }
  };

  const handleDeleteBackup = async () => {
    try {
      await axiosInstance.delete(`/backup/delete/${confirmModal.fileName}`);
      setToast({
        message: "Backup deleted successfully!",
        type: "success",
      });
      setConfirmModal({ isOpen: false, type: null, fileName: null });
      fetchBackups();
    } catch (error) {
      console.error("Error deleting backup:", error);
      setToast({
        message: error.response?.data?.message || "Failed to delete backup",
        type: "error",
      });
    }
  };

  const handleRestoreBackup = async () => {
    try {
      await axiosInstance.post(`/backup/restore/${confirmModal.fileName}`);
      setToast({
        message: "Database restored successfully!",
        type: "success",
      });
      setConfirmModal({ isOpen: false, type: null, fileName: null });
    } catch (error) {
      console.error("Error restoring backup:", error);
      setToast({
        message: error.response?.data?.message || "Failed to restore backup",
        type: "error",
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Database Backup</h1>
        <p className="text-gray-600 mt-1">
          Create, manage, and restore database backups
        </p>
      </div>

      {/* Create Backup Button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Create New Backup
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a complete backup of the database
            </p>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {creating ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Backup
              </>
            )}
          </button>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Backup History
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {backups.length} backup{backups.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {loading ? (
          <BackupSkeleton />
        ) : backups.length === 0 ? (
          <div className="p-12 text-center">
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
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            <p className="text-gray-500 text-lg">No backups found</p>
            <p className="text-gray-400 text-sm mt-2">
              Create your first backup to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {backups.map((backup, index) => (
                  <tr
                    key={backup.fileName}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400"
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
                        <span className="font-mono text-sm text-gray-900">
                          {backup.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {backup.size}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(backup.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadBackup(backup.fileName)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium rounded-lg transition-colors"
                          title="Download"
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
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              type: "restore",
                              fileName: backup.fileName,
                            })
                          }
                          className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 text-sm font-medium rounded-lg transition-colors"
                          title="Restore"
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
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              type: "delete",
                              fileName: backup.fileName,
                            })
                          }
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
                          title="Delete"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({ isOpen: false, type: null, fileName: null })
        }
        onConfirm={
          confirmModal.type === "delete"
            ? handleDeleteBackup
            : handleRestoreBackup
        }
        title={
          confirmModal.type === "delete" ? "Delete Backup" : "Restore Backup"
        }
        message={
          confirmModal.type === "delete"
            ? `Are you sure you want to delete "${confirmModal.fileName}"? This action cannot be undone.`
            : `Are you sure you want to restore from "${confirmModal.fileName}"? This will replace all current data with the backup data. This action cannot be undone.`
        }
        confirmText={confirmModal.type === "delete" ? "Delete" : "Restore"}
        cancelText="Cancel"
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AdminBackup;
