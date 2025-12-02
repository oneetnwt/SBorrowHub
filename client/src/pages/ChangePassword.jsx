import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-hot-toast";
import Loader from "../components/Loader";

function ChangePassword() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Clear success message when user starts typing
    if (success) {
      setSuccess(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    try {
      setLoading(true);

      // Validate passwords match
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        const errorMsg = "New passwords do not match";
        setErrors({ confirmPassword: errorMsg });
        toast.error(errorMsg);
        return;
      }

      // Validate new password is different from current
      if (passwordData.newPassword === passwordData.currentPassword) {
        const errorMsg = "New password must be different from current password";
        setErrors({ newPassword: errorMsg });
        toast.error(errorMsg);
        return;
      }

      const response = await axiosInstance.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      toast.success(response.data.message || "Password changed successfully");
      setSuccess(true);
      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);

      // Handle different error scenarios
      if (error.response?.data?.errors) {
        // Zod validation errors
        const errors = error.response.data.errors;
        const errorObj = {};
        errors.forEach((err) => {
          const field = err.path[0];
          errorObj[field] = err.message;
          toast.error(`${err.path.join(".")}: ${err.message}`);
        });
        setErrors(errorObj);
      } else if (error.response?.data?.message) {
        // Custom error message from backend
        const message = error.response.data.message;
        toast.error(message);
        // Try to determine which field has the error
        if (message.toLowerCase().includes("current password")) {
          setErrors({ currentPassword: message });
        } else if (message.toLowerCase().includes("new password")) {
          setErrors({ newPassword: message });
        } else {
          setErrors({ general: message });
        }
      } else if (error.response?.status === 400) {
        const msg = "Invalid password data. Please check your inputs.";
        toast.error(msg);
        setErrors({ general: msg });
      } else if (error.response?.status === 401) {
        const msg = "Current password is incorrect";
        toast.error(msg);
        setErrors({ currentPassword: msg });
      } else {
        const msg = "Failed to change password. Please try again.";
        toast.error(msg);
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="h-full w-full flex flex-col overflow-y-auto p-4 pb-16">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
        <p className="text-gray-600 mt-1">
          Update your password to keep your account secure
        </p>
      </div>

      {/* Change Password Form */}
      <div className="max-w-2xl">
        {/* Success Alert */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-green-900">
                  Success!
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  Your password has been changed successfully. You can now use
                  your new password to log in.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {errors.general && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5"
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
              <div>
                <h4 className="text-sm font-semibold text-red-900">Error</h4>
                <p className="text-sm text-red-700 mt-1">{errors.general}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 border border-black/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                Current Password
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent transition-shadow ${
                  errors.currentPassword
                    ? "border-red-500 bg-red-50"
                    : "border-black/10"
                }`}
                placeholder="Enter your current password"
              />
              {errors.currentPassword ? (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
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
                  {errors.currentPassword}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Enter your current password to verify your identity
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                New Password
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={8}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent transition-shadow ${
                  errors.newPassword
                    ? "border-red-500 bg-red-50"
                    : "border-black/10"
                }`}
                placeholder="Enter your new password"
              />
              {errors.newPassword ? (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
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
                  {errors.newPassword}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength={8}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent transition-shadow ${
                  errors.confirmPassword
                    ? "border-red-500 bg-red-50"
                    : "border-black/10"
                }`}
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword ? (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
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
                  {errors.confirmPassword}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Re-enter your new password to confirm
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Password Requirements
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li className="flex items-center gap-2">
                  <svg
                    className="w-3 h-3"
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
                  At least 8 characters long
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-3 h-3"
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
                  Different from your current password
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-3 h-3"
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
                  Both new passwords must match
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={
                  loading ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
                className="flex-1 bg-(--accent) hover:bg-(--accent)/90 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <Loader variant="spinner" size="sm" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                    Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Tips */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Security Tips
          </h4>
          <ul className="text-xs text-yellow-800 space-y-1">
            <li>• Use a strong, unique password for your account</li>
            <li>• Don't share your password with anyone</li>
            <li>• Change your password regularly for better security</li>
            <li>• Avoid using common words or personal information</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default ChangePassword;
