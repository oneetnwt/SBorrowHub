import { useState, useRef, useEffect } from "react";
import { useUserStore } from "../store/user";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-hot-toast";

function Profile() {
  const { user } = useUserStore();
  const [loading, SetLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    college: "",
    department: "",
    profilePicture: "",
  });

  const fileInputRef = useRef(null);

  // Update formData when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        college: user.college || "",
        department: user.department || "",
        profilePicture: user.profilePicture || "",
      });
    }
  }, [user]);

  // Return early if no user data
  if (!user) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePicture: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      SetLoading(true);
      // Prepare data to send (only send changed fields)
      const updateData = {};

      if (formData.firstname !== user.firstname)
        updateData.firstname = formData.firstname;
      if (formData.lastname !== user.lastname)
        updateData.lastname = formData.lastname;
      if (formData.email !== user.email) updateData.email = formData.email;
      if (formData.phoneNumber !== user.phoneNumber)
        updateData.phoneNumber = formData.phoneNumber;
      if (formData.college !== user.college)
        updateData.college = formData.college;
      if (formData.department !== user.department)
        updateData.department = formData.department;
      if (formData.profilePicture !== user.profilePicture)
        updateData.profilePicture = formData.profilePicture;

      // Only make API call if there are changes
      if (Object.keys(updateData).length === 0) {
        toast.error("No changes to save");
        setIsEditing(false);
        return;
      }

      const response = await axiosInstance.put(
        "/auth/update-profile",
        updateData
      );

      if (response.data.user) {
        // Update user in store
        useUserStore.getState().setUser(response.data.user);
        toast.success(response.data.message || "Profile updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      SetLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      college: user?.college || "",
      department: user?.department || "",
      profilePicture: user?.profilePicture || "",
    });
    setIsEditing(false);
  };

  return (
    <section className="h-full w-full flex flex-col overflow-hidden p-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">My Profile</h1>
          <p className="text-gray-600 text-sm">
            View and manage your account information
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-(--accent) hover:bg-(--accent)/90 text-white font-medium py-2 px-4 rounded-lg transition-all hover:shadow-md flex items-center gap-2 text-sm"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Content */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">
        {/* Left: Profile Picture */}
        <div className="md:w-80 flex flex-col gap-4 overflow-y-auto pr-2">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-black/10">
            <div className="flex flex-col items-center">
              {/* Profile Picture with Edit Overlay */}
              <div className="relative group mb-4">
                <div className="w-36 h-36 rounded-full bg-linear-to-br from-(--accent) to-(--accent)/70 p-1">
                  <img
                    src={
                      isEditing ? formData.profilePicture : user.profilePicture
                    }
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 bg-(--accent) hover:bg-(--accent)/90 text-white p-2.5 rounded-full transition-all shadow-lg hover:shadow-xl"
                    title="Change profile picture"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <h2 className="text-xl font-bold text-center">
                {user.firstname} {user.lastname}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-(--accent)/10 text-(--accent)">
                  {user.studentId}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-2 text-center">
                {user.department}
              </p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-black/10">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-(--accent)"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Quick Info
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-gray-400 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-gray-400 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{user.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-gray-400 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">College</p>
                  <p className="text-sm font-medium">{user.college}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Account Stats and Personal Information */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Account Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-black/10">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-(--accent)"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Account Statistics
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-xs text-gray-600 mt-1">Borrowed</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-2xl font-bold text-green-600">8</p>
                <p className="text-xs text-gray-600 mt-1">Returned</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-2xl font-bold text-orange-600">2</p>
                <p className="text-xs text-gray-600 mt-1">Pending</p>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-5 border border-black/10 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-3 border-b border-black/10 z-10">
              <h3 className="text-lg font-bold flex items-center gap-2">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Personal Information
              </h3>
              {isEditing && (
                <span className="text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded">
                  Editing Mode
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1.5">
                  First Name
                  {isEditing && <span className="text-red-500">*</span>}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent transition-shadow"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-100">
                    {user.firstname}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1.5">
                  Last Name
                  {isEditing && <span className="text-red-500">*</span>}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent transition-shadow"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-100">
                    {user.lastname}
                  </p>
                )}
              </div>

              {/* Student ID */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Student ID
                </label>
                <div className="px-3 py-2 text-sm bg-gray-100 rounded-lg text-gray-500 border border-gray-200 flex items-center gap-2">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  {user.studentId}
                  <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded">
                    Read-only
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="col-span-2">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                  {isEditing && <span className="text-red-500">*</span>}
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent transition-shadow"
                    placeholder="your.email@example.com"
                  />
                ) : (
                  <p className="px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-100">
                    {user.email}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="col-span-2">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                  {isEditing && <span className="text-red-500">*</span>}
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent transition-shadow"
                    placeholder="09XX XXX XXXX"
                  />
                ) : (
                  <p className="px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-100">
                    {user.phoneNumber}
                  </p>
                )}
              </div>

              {/* College */}
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1.5">
                  College
                  {isEditing && <span className="text-red-500">*</span>}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent transition-shadow"
                    placeholder="College name"
                  />
                ) : (
                  <p className="px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-100">
                    {user.college}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1.5">
                  Department
                  {isEditing && <span className="text-red-500">*</span>}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent transition-shadow"
                    placeholder="Department name"
                  />
                ) : (
                  <p className="px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-100">
                    {user.department}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="col-span-2 flex gap-3 pt-3 border-t border-black/10">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm text-white font-semibold py-2.5 px-4 rounded-lg transition-all hover:shadow-md ${
                      loading
                        ? "bg-(--neutral-300) hover:bg-(--neutral-400)"
                        : " bg-(--accent) hover:bg-(--accent)/90"
                    }`}
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-all hover:shadow-md flex items-center justify-center gap-2 text-sm"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
