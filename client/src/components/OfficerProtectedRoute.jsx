import { useEffect, useState } from "react";
import { useUserStore } from "../store/user";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useOfficerStore } from "../store/officer";
import Loader from "./Loader";

function OfficerProtectedRoute({ children }) {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [isChecking, setIsChecking] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/check-auth");

        // Check if user has officer role
        if (data.role !== "officer") {
          console.log("Access denied: Not an officer");
          setIsUnauthorized(true);
          setIsChecking(false);
          return;
        }

        setUser(data);
        setIsChecking(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
        setIsChecking(false);
        navigate("/auth/login", { replace: true });
      }
    };

    // Always check authentication on mount to ensure fresh data
    checkAuth();
  }, []); // Run only once on mount

  if (isChecking) {
    return (
      <section className="w-dvw h-dvh flex flex-col justify-center items-center">
        <Loader variant="spinner" size="lg" />
        <p className="text-xl font-bold mt-5">Authenticating</p>
      </section>
    );
  }

  if (isUnauthorized) {
    return (
      <section className="w-dvw h-dvh flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 mx-auto text-red-500"
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
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this area. This section is
            restricted to authorized officers only.
          </p>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="px-6 py-3 bg-(--accent) hover:bg-(--accent-dark) text-white rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </section>
    );
  }

  if (!user || !officer || user.role !== "officer") {
    return null;
  }

  return children;
}

export default OfficerProtectedRoute;
