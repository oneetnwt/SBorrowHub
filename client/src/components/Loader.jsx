import React from "react";

/**
 * Loader Component
 * Props:
 *  - variant: 'spinner' | 'dots' | 'bar' (default: 'spinner')
 *  - size: 'sm' | 'md' | 'lg' (default: 'md')
 *  - label: optional accessible label shown to screen readers
 *  - className: extra classes for wrapper
 */

const SIZE_CLASSES = {
  sm: "h-4 w-4 text-gray-600",
  md: "h-6 w-6 text-gray-700",
  lg: "h-10 w-10 text-gray-800",
};

export default function Loader({
  variant = "spinner",
  size = "md",
  label = "Loading...",
  className = "",
}) {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  if (variant === "dots") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-2 ${className}`}
      >
        <span className="sr-only">{label}</span>
        <span className="flex items-center space-x-1">
          <span
            className={`inline-block ${
              size === "sm"
                ? "h-1.5 w-1.5"
                : size === "lg"
                ? "h-3 w-3"
                : "h-2 w-2"
            } rounded-full animate-bounce`}
          ></span>
          <span
            className={`inline-block ${
              size === "sm"
                ? "h-1.5 w-1.5"
                : size === "lg"
                ? "h-3 w-3"
                : "h-2 w-2"
            } rounded-full animate-bounce delay-150`}
          ></span>
          <span
            className={`inline-block ${
              size === "sm"
                ? "h-1.5 w-1.5"
                : size === "lg"
                ? "h-3 w-3"
                : "h-2 w-2"
            } rounded-full animate-bounce delay-300`}
          ></span>
        </span>
      </div>
    );
  }

  if (variant === "bar") {
    return (
      <div role="status" aria-live="polite" className={`w-full ${className}`}>
        <span className="sr-only">{label}</span>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-1/3 animate-[progress_1.2s_linear_infinite] bg-gradient-to-r from-gray-300 to-gray-500" />
        </div>
        <style jsx>{`
          @keyframes progress {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(20%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  }

  // default: spinner
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center ${className}`}
    >
      <span className="sr-only">{label}</span>
      <svg
        className={`${sizeClass} animate-spin`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
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
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </div>
  );
}

/*
Example usage:

import Loader from './Loader';

<Loader variant="spinner" size="md" />
<Loader variant="dots" size="sm" label="Fetching messages" />
<Loader variant="bar" />

*/
