import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Error() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Code */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-(--accent) mb-4 animate-bounce">
            404
          </h1>
          <div className="w-24 h-1 bg-(--accent) mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500">
            It might have been moved or deleted, or you may have mistyped the
            URL.
          </p>
        </div>

        {/* Illustration */}
        <div className="mb-8">
          <svg
            className="w-64 h-64 mx-auto text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white border-2 border-(--accent) text-(--accent) rounded-lg font-semibold hover:bg-(--accent) hover:text-white transition-all shadow-sm"
          >
            <div className="flex items-center justify-center gap-2">
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go Back
            </div>
          </button>

          <Link
            to="/"
            className="px-6 py-3 bg-(--accent) text-white rounded-lg font-semibold hover:bg-(--accent-dark) transition-all shadow-sm"
          >
            <div className="flex items-center justify-center gap-2">
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Back to Home
            </div>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12">
          <p className="text-sm text-gray-500">
            Need help? Contact our{" "}
            <Link
              to="/help"
              className="text-(--accent) hover:underline font-medium"
            >
              support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Error;
