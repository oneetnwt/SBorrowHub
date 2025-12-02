import { useEffect, useState } from "react";
import Modal from "../../components/modals/Modal";
import axiosInstance from "../../api/axiosInstance";
import useWebSocket from "../../hooks/useWebSocket";
import { useUserStore } from "../../store/user";

function AdminUsers() {
  const { user } = useUserStore();
  const { isConnected, lastMessage } = useWebSocket(user?._id);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // 'grid' or 'list'
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/admin/get-all-users");

        if (response.status === 200) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Listen for real-time user status updates
  useEffect(() => {
    if (lastMessage && lastMessage.type === "user_status_update") {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === lastMessage.userId
            ? { ...u, isOnline: lastMessage.isOnline }
            : u
        )
      );
    }
  }, [lastMessage]);

  const getStatusStyle = (status) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      suspended: "bg-red-100 text-red-700",
      inactive: "bg-gray-100 text-gray-700",
    };
    return styles[status];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadge = (role) => {
    const badges = {
      user: "bg-blue-100 text-blue-700",
      officer: "bg-green-100 text-green-700",
      admin: "bg-red-100 text-red-700",
    };
    return badges[role] || badges.user;
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "online" && user.isOnline) ||
      (filterStatus === "offline" && !user.isOnline);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const openViewModal = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  return (
    <section className="h-full w-full flex flex-col overflow-y-auto p-4 pb-16 bg-gray-50">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-600 mt-0.5">
          View and manage all system users
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs mb-0.5">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 shadow-sm">
          <p className="text-green-600 text-xs mb-0.5">Online Now</p>
          <p className="text-2xl font-bold text-green-700">
            {users.filter((u) => u.isOnline).length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 shadow-sm">
          <p className="text-blue-600 text-xs mb-0.5">Users</p>
          <p className="text-2xl font-bold text-blue-700">
            {users.filter((u) => u.role === "user").length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 shadow-sm">
          <p className="text-green-600 text-xs mb-0.5">Officers</p>
          <p className="text-2xl font-bold text-green-700">
            {users.filter((u) => u.role === "officer").length}
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent)"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent)"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="officer">Officer</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent)"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-(--accent) shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Grid View"
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
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-(--accent) shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="List View"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Loading users...
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={() => openViewModal(user)}
              >
                <div className="flex items-start justify-between mb-3">
                  <img
                    src={
                      user.profilePicture ||
                      `https://ui-avatars.com/api/?name=${user.firstname}+${user.lastname}&background=be8443&color=fff`
                    }
                    alt={user.fullname}
                    className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
                  />
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900 mb-1">
                  {user.firstname} {user.lastname}
                </h3>
                <p className="text-xs text-gray-500 mb-3 truncate">
                  {user.email}
                </p>

                <div className="mb-3 py-2 px-3 bg-gray-50 rounded-lg space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Department</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.department || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">College</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.college?.slice(11) || "N/A"}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Joined: {formatDate(user.createdAt)}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No users found
            </div>
          )}
        </div>
      )}

      {/* Users List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    College
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => openViewModal(user)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user.profilePicture ||
                              `https://ui-avatars.com/api/?name=${user.firstname}+${user.lastname}&background=be8443&color=fff`
                            }
                            alt={user.fullname}
                            className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
                          />
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              {user.firstname} {user.lastname}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role?.charAt(0).toUpperCase() +
                            user.role?.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              user.isOnline
                                ? "bg-green-500 animate-pulse"
                                : "bg-gray-400"
                            }`}
                          ></div>
                          <span className="text-xs font-medium text-gray-700">
                            {user.isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.department || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.college?.slice(11) || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.phoneNumber || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View User Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUser(null);
        }}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={
                  selectedUser.profilePicture ||
                  `https://ui-avatars.com/api/?name=${selectedUser.firstname}+${selectedUser.lastname}&background=be8443&color=fff`
                }
                alt={selectedUser.fullname}
                className="w-20 h-20 rounded-full border-2 border-gray-200 object-cover"
              />
              <div>
                <h3 className="font-bold text-2xl text-gray-900">
                  {selectedUser.firstname} {selectedUser.lastname}
                </h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(
                      selectedUser.role
                    )}`}
                  >
                    {selectedUser.role?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Department</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedUser.department || "N/A"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">College</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedUser.college?.slice(11) || "N/A"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Contact</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedUser.phoneNumber || "N/A"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Student ID</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedUser.studentId || "N/A"}
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 mb-1">Member Since</p>
              <p className="font-semibold text-blue-900">
                {formatDate(selectedUser.createdAt)}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default AdminUsers;
