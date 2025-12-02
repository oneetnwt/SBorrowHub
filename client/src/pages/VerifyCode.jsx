import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function VerifyCode() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Check if user came from forgot-password (has OTP cookie)
    const checkOtpExists = async () => {
      try {
        // Try to verify that OTP cookie exists by making a test request
        const response = await axiosInstance.get("/auth/check-otp");
        if (response.status !== 200) {
          navigate("/auth/forgot-password", { replace: true });
        }
      } catch (error) {
        // If error, redirect to forgot password
        navigate("/auth/forgot-password", { replace: true });
      }
    };

    checkOtpExists();
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, [navigate]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post("/auth/verify-otp", {
        otp: otpCode,
      });

      if (res.status === 200) {
        navigate("/auth/reset-password");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Invalid verification code");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    // Navigate back to forgot password to resend
    navigate("/auth/forgot-password");
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/auth/forgot-password"
        className="inline-flex items-center text-sm text-(--neutral-600) hover:text-(--text) transition-colors"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </Link>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-(--text)">Verify Code</h1>
        <p className="text-(--neutral-500)">
          Enter the 6-digit code we sent to your email
        </p>
      </div>

      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-linear-to-br from-(--primary-light) to-(--accent-light) rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input */}
        <div className="space-y-3">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                  error
                    ? "border-(--error) bg-(--error)/5"
                    : digit
                    ? "border-(--primary) bg-(--primary)/5"
                    : "border-(--neutral-300) bg-white/50 focus:border-(--primary) focus:ring-2 focus:ring-(--primary)"
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center">
              <p className="text-sm text-(--error) font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || otp.join("").length !== 6}
          className="w-full bg-linear-to-r from-(--primary) to-(--accent) text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-(--primary) focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      {/* Resend */}
      <div className="text-center">
        <p className="text-sm text-(--neutral-600)">
          Didn't receive the code?{" "}
          <button
            onClick={handleResend}
            className="text-(--primary) hover:text-(--primary-dark) font-medium transition-colors"
          >
            Resend Code
          </button>
        </p>
      </div>

      {/* Help Text */}
      <div className="bg-(--neutral-100) rounded-xl p-4 text-sm text-(--neutral-600)">
        <p className="flex items-start">
          <svg
            className="w-5 h-5 mr-2 mt-0.5 text-(--info) shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            The verification code will expire in 10 minutes. If you don't
            receive the code, check your spam folder.
          </span>
        </p>
      </div>
    </div>
  );
}

export default VerifyCode;
