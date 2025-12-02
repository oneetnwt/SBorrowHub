import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Envelope from "../components/icons/Envelope";
import axiosInstance from "../api/axiosInstance";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post("/auth/verify-email", {
        email: email,
      });

      if (res.status === 200) {
        console.log("Reset password for:", email);
        setIsSubmitted(true);
        navigate("/auth/verify-code");
      }
    } catch (error) {}
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-linear-to-br from-(--success) to-(--info) rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-(--text)">Check Your Email</h1>
          <p className="text-(--neutral-500) max-w-sm mx-auto">
            We've sent a 6-digit verification code to{" "}
            <span className="font-medium text-(--text)">{email}</span>
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-(--neutral-100) rounded-xl p-4 text-left space-y-2">
          <p className="text-sm text-(--text) font-medium">Next steps:</p>
          <ul className="text-sm text-(--neutral-600) space-y-1 list-disc list-inside">
            <li>Check your email inbox</li>
            <li>Enter the 6-digit code on the next page</li>
            <li>Create a new password</li>
          </ul>
        </div>

        {/* Resend & Back */}
        <div className="space-y-3">
          <button
            onClick={() => setIsSubmitted(false)}
            className="w-full bg-linear-to-r from-(--primary) to-(--accent) text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Resend Email
          </button>

          <Link
            to="/auth/login"
            className="block w-full text-center text-(--primary) hover:text-(--primary-dark) font-medium transition-colors"
          >
            Back to Login
          </Link>
        </div>

        {/* Support */}
        <p className="text-xs text-(--neutral-500)">
          Didn't receive the email?{" "}
          <a
            href="mailto:support@sborrowhub.com"
            className="text-(--primary) hover:text-(--primary-dark) transition-colors"
          >
            Contact support
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/auth/login"
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
        Back to Login
      </Link>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-(--text)">Forgot Password?</h1>
        <p className="text-(--neutral-500)">
          No worries, we'll send you reset instructions
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-(--text)"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Envelope className="h-5 w-5 text-(--neutral-400)" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
              className="w-full pl-12 pr-4 py-3 border border-(--neutral-300) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200 bg-white/50"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-linear-to-r from-(--primary) to-(--accent) text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-(--primary) focus:ring-offset-2"
        >
          Send Verification Code
        </button>
      </form>

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
            Enter the email address associated with your account and we'll send
            you a 6-digit verification code to reset your password.
          </span>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
