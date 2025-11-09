import { useEffect, useState } from "react";
import { useUserStore } from "../store/user";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function ProtectedRoute({ children }) {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/check-auth");
        // Backend returns user object directly from checkAuth endpoint
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
        <p className="text-xl font-bold mt-5">Authenticating</p>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}

export default ProtectedRoute;
