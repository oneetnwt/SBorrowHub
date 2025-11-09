import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import axiosInstance from "../api/axiosInstance";
import { useUserStore } from "../store/user";
import { COLLEGE_DATA } from "../constants";

function Signup() {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const recaptchaRef = useRef(null);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const [formData, setFormData] = useState({
    studentId: "",
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    college: "",
    department: "",
    password: "",
    confirmpassword: "",
    agreeToTerms: false,
  });

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If college changes, reset department
    if (name === "college") {
      setFormData((prev) => ({
        ...prev,
        college: value,
        department: "", // Reset department when college changes
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstname.trim())
      newErrors.firstname = "First name is required";
    if (!formData.lastname.trim()) newErrors.lastname = "Last name is required";
    if (!formData.studentId.trim())
      newErrors.studentId = "Student ID is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.college) newErrors.college = "Please select a college";
    if (!formData.department)
      newErrors.department = "Please select a department";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== formData.confirmpassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaValue) {
      setErrors({ submit: "Please complete the CAPTCHA" });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      // Verify CAPTCHA first
      const captchaRes = await axiosInstance.post("/auth/verify-captcha", {
        token: captchaValue,
      });

      if (!captchaRes.data.success) {
        setErrors({ submit: "CAPTCHA verification failed. Please try again." });
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setCaptchaValue(null);
        return;
      }

      // If CAPTCHA is verified, proceed with signup
      const { status, data } = await axiosInstance.post(
        "/auth/signup",
        formData
      );

      if (status === 201) {
        // Extract the user object from the response
        setUser(data.user);
        navigate("/");
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Registration failed. Please try again." });
      }

      // Reset CAPTCHA on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaValue(null);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="text-center space-y-0.5">
        <h1 className="text-xl font-bold text-(--text)">Create your account</h1>
        <p className="text-xs text-(--neutral-500)">
          Get instant access to a smarter borrowing and sharing hub.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="space-y-2">
          {/* Error Message */}
          {errors.submit && (
            <div className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          {/* Name Fields - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* First Name */}
            <div className="space-y-0.5">
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                placeholder="First Name"
                className={`w-full px-3 py-1.5 border ${
                  errors.firstname ? "border-red-500" : "border-(--neutral-300)"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200 bg-white/50`}
              />
              {errors.firstname && (
                <p className="text-red-500 text-xs">{errors.firstname}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-0.5">
              <input
                type="text"
                id="lastName"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                placeholder="Last Name"
                className={`w-full px-3 py-1.5 border ${
                  errors.lastname ? "border-red-500" : "border-(--neutral-300)"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200 bg-white/50`}
              />
              {errors.lastname && (
                <p className="text-red-500 text-xs">{errors.lastname}</p>
              )}
            </div>
          </div>

          {/* Student ID */}
          <div className="space-y-0.5">
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="Student ID"
              className={`w-full px-3 py-1.5 border ${
                errors.studentId ? "border-red-500" : "border-(--neutral-300)"
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200 bg-white/50`}
            />
            {errors.studentId && (
              <p className="text-red-500 text-xs">{errors.studentId}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-0.5">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={`w-full px-3 py-1.5 border ${
                errors.email ? "border-red-500" : "border-(--neutral-300)"
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200 bg-white/50`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-0.5">
            <input
              type="number"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              className={`w-full px-3 py-1.5 border ${
                errors.phoneNumber ? "border-red-500" : "border-(--neutral-300)"
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200 bg-white/50`}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs">{errors.phoneNumber}</p>
            )}
          </div>

          {/* College and Department - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* College Dropdown */}
            <div className="space-y-0.5">
              <select
                id="college"
                name="college"
                value={formData.college}
                onChange={handleChange}
                className={`w-full px-3 py-1.5 border ${
                  errors.college ? "border-red-500" : "border-(--neutral-300)"
                } rounded-xl outline-none focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200 bg-white/50 ${
                  formData.college ? "text-(--text)" : "text-(--neutral-500)"
                }`}
                style={{ outline: "none" }}
              >
                <option value="">College</option>
                {Object.keys(COLLEGE_DATA).map((college) => (
                  <option key={college} value={college}>
                    {college}
                  </option>
                ))}
              </select>
              {errors.college && (
                <p className="text-red-500 text-xs">{errors.college}</p>
              )}
            </div>

            {/* Department Dropdown */}
            <div className="space-y-0.5">
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={!formData.college}
                className={`w-full px-3 py-1.5 border ${
                  errors.department
                    ? "border-red-500"
                    : "border-(--neutral-300)"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200 bg-white/50 ${
                  formData.department ? "text-(--text)" : "text-(--neutral-500)"
                } ${!formData.college ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <option value="">
                  {formData.college
                    ? "Select Department"
                    : "Select College First"}
                </option>
                {formData.college &&
                  COLLEGE_DATA[formData.college]?.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-xs">{errors.department}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-0.5">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="new-password"
                className={`w-full px-4 pr-10 py-2 border ${
                  errors.password ? "border-red-500" : "border-(--neutral-300)"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200 bg-white/50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-(--neutral-500) hover:text-(--text) transition-colors"
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-0.5">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmpassword"
                value={formData.confirmpassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                autoComplete="new-password"
                className={`w-full px-4 pr-10 py-2 border ${
                  errors.confirmpassword
                    ? "border-red-500"
                    : "border-(--neutral-300)"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200 bg-white/50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-(--neutral-500) hover:text-(--text) transition-colors"
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
            )}
          </div>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={siteKey}
            onChange={handleCaptchaChange}
          />

          {/* Terms and Conditions */}
          <div className="space-y-0.5">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className={`mt-1 w-4 h-4 rounded border-gray-300 text-(--primary) focus:ring-(--primary) ${
                  errors.agreeToTerms ? "border-red-500" : ""
                }`}
              />
              <label
                htmlFor="agreeToTerms"
                className="ml-2 text-sm text-(--text)"
              >
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-(--primary) hover:underline"
                  target="_blank"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-(--primary) hover:underline"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-500 text-xs ml-6">{errors.agreeToTerms}</p>
            )}
          </div>
        </div>

        {/* Submit Button - Outside scrollable area */}
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-xl font-semibold text-white ${
            !formData.agreeToTerms
              ? "bg-linear-to-r from-(--neutral-400) to-(--neutral-300)"
              : "bg-linear-to-r from-(--primary) to-(--accent) hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          }`}
          disabled={!formData.agreeToTerms}
        >
          Sign up
        </button>
      </form>

      {/* Sign In Link */}
      <div className="text-center text-sm text-(--neutral-500)">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="text-(--primary) font-semibold hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default Signup;
