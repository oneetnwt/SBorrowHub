import { useEffect, useState } from "react";
import Modal from "../../components/modals/Modal";
import ConfirmModal from "../../components/modals/ConfirmModal";
import axiosInstance from "../../api/axiosInstance";

function AdminPermissionControl() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    role: "student",
    permissions: [],
  });

  const availablePermissions = [
    {
      id: "view_items",
      name: "View Items",
      description: "Can view catalog items",
    },
    {
      id: "borrow_items",
      name: "Borrow Items",
      description: "Can request to borrow items",
    },
    {
      id: "manage_inventory",
      name: "Manage Inventory",
      description: "Can add/edit/delete items",
    },
    {
      id: "approve_requests",
      name: "Approve Requests",
      description: "Can approve/reject borrow requests",
    },
    {
      id: "manage_users",
      name: "Manage Users",
      description: "Can view and edit user accounts",
    },
    {
      id: "view_analytics",
      name: "View Analytics",
      description: "Can access analytics dashboard",
    },
    {
      id: "system_settings",
      name: "System Settings",
      description: "Can modify system settings",
    },
    {
      id: "manage_permissions",
      name: "Manage Permissions",
      description: "Can assign roles and permissions",
    },
  ];

  const rolePermissions = {
    student: ["view_items", "borrow_items"],
    faculty: ["view_items", "borrow_items"],
    staff: ["view_items", "borrow_items"],
    officer: [
      "view_items",
      "borrow_items",
      "manage_inventory",
      "approve_requests",
      "view_analytics",
    ],
    admin: [
      "view_items",
      "borrow_items",
      "manage_inventory",
      "approve_requests",
      "manage_users",
      "view_analytics",
      "system_settings",
      "manage_permissions",
    ],
  };

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

  const getRoleBadge = (role) => {
    const badges = {
      student: "bg-blue-100 text-blue-700 border-blue-200",
      faculty: "bg-purple-100 text-purple-700 border-purple-200",
      staff: "bg-orange-100 text-orange-700 border-orange-200",
      officer: "bg-green-100 text-green-700 border-green-200",
      admin: "bg-red-100 text-red-700 border-red-200",
    };
    return badges[role] || badges.student;
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      role: user.role || "student",
      permissions: rolePermissions[user.role] || [],
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePermissions = async () => {
    try {
      await axiosInstance.put(`/admin/update-user-role/${selectedUser._id}`, {
        role: formData.role,
      });

      setUsers(
        users.map((user) =>
          user._id === selectedUser._id
            ? { ...user, role: formData.role }
            : user
        )
      );
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating permissions:", error);
      alert("Failed to update permissions. Please try again.");
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleRoleChange = (newRole) => {
    setFormData({
      role: newRole,
      permissions: rolePermissions[newRole] || [],
    });
  };

  return (
    <section className="h-full w-full flex flex-col overflow-y-auto p-4 pb-16 bg-gray-50">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        <p className="text-sm text-gray-600 mt-0.5">
          Assign and manage user roles across the system
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs mb-0.5">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 shadow-sm">
          <p className="text-blue-600 text-xs mb-0.5">Students</p>
          <p className="text-2xl font-bold text-blue-700">
            {users.filter((u) => u.role === "student").length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 shadow-sm">
          <p className="text-purple-600 text-xs mb-0.5">Faculty</p>
          <p className="text-2xl font-bold text-purple-700">
            {users.filter((u) => u.role === "faculty").length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 shadow-sm">
          <p className="text-green-600 text-xs mb-0.5">Officers</p>
          <p className="text-2xl font-bold text-green-700">
            {users.filter((u) => u.role === "officer").length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200 shadow-sm">
          <p className="text-red-600 text-xs mb-0.5">Admins</p>
          <p className="text-2xl font-bold text-red-700">
            {users.filter((u) => u.role === "admin").length}
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
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="staff">Staff</option>
            <option value="officer">Officer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Current Role
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
                    colSpan="4"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
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
                          <p className="font-medium text-gray-900">
                            {user.firstname} {user.lastname}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.studentId || user._id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {user.role?.charAt(0).toUpperCase() +
                          user.role?.slice(1) || "Student"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEditModal(user)}
                        className="px-3 py-1.5 bg-(--accent) hover:bg-(--accent-dark) text-white text-xs rounded-md font-medium transition-colors"
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
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

      {/* Edit Role Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        title="Change User Role"
      >
        {selectedUser && (
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={
                  selectedUser.profilePicture ||
                  `https://ui-avatars.com/api/?name=${selectedUser.firstname}+${selectedUser.lastname}&background=be8443&color=fff`
                }
                alt={selectedUser.fullname}
                className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  {selectedUser.firstname} {selectedUser.lastname}
                </p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-(--accent) focus:border-(--accent)"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="staff">Staff</option>
                <option value="officer">Officer</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Changing the role will automatically update the user's access
                permissions.
              </p>
            </div>

            {/* Role Description */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Role Capabilities
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                {formData.role === "student" && (
                  <>
                    <li>• View available items</li>
                    <li>• Request to borrow items</li>
                  </>
                )}
                {formData.role === "faculty" && (
                  <>
                    <li>• View available items</li>
                    <li>• Request to borrow items</li>
                  </>
                )}
                {formData.role === "staff" && (
                  <>
                    <li>• View available items</li>
                    <li>• Request to borrow items</li>
                  </>
                )}
                {formData.role === "officer" && (
                  <>
                    <li>• All student/faculty/staff permissions</li>
                    <li>• Manage inventory items</li>
                    <li>• Approve/reject borrow requests</li>
                    <li>• View analytics and reports</li>
                  </>
                )}
                {formData.role === "admin" && (
                  <>
                    <li>• All officer permissions</li>
                    <li>• Manage user accounts and roles</li>
                    <li>• System settings and configuration</li>
                    <li>• Full administrative access</li>
                  </>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePermissions}
                className="flex-1 px-4 py-2 bg-(--accent) hover:bg-(--accent-dark) text-white rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default AdminPermissionControl;
