import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Logo from "../components/icons/Logo";
import Icon from "../assets/SBO.png";
import { useUserStore } from "../store/user";
import axiosInstance from "../api/axiosInstance";

function Authentication() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/check-auth");
        setUser(data);
        navigate("/", { replace: true });
      } catch (error) {
        // User is not authenticated, allow access to auth pages
        setIsChecking(false);
      }
    };

    // If user is already in store, redirect to home
    if (user) {
      navigate("/", { replace: true });
    } else {
      // Otherwise check if they have a valid session
      checkAuth();
    }
  }, []); // Run only once on mount

  // Don't render auth pages if user is authenticated or still checking
  if (user || isChecking) {
    return null;
  }

  return (
    <main className="w-full min-h-screen bg-linear-to-br from-(--background) via-(--neutral-50) to-(--secondary-light) flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden md:flex flex-col items-center justify-center p-12 space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-(--primary) to-(--accent) opacity-20 blur-3xl rounded-full"></div>
              <img
                src={Icon}
                alt="SBorrowHub Logo"
                className="w-96 h-96 object-contain relative z-10 drop-shadow-2xl animate-[fadeIn_1s_ease-out]"
              />
            </div>
            <div className="text-center space-y-4 animate-[fadeIn_1.2s_ease-out]">
              <h1 className="text-4xl font-bold text-(--primary-dark)">
                Welcome to SBorrowHub
              </h1>
              <p className="text-lg text-(--neutral-600) max-w-md">
                Your trusted platform for borrowing and lending items within
                your community
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-xl">
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-(--neutral-200) animate-[fadeIn_0.8s_ease-out]">
                {/* Logo for mobile */}
                <div className="md:hidden flex justify-center mb-6">
                  <Logo />
                </div>

                <Outlet />
              </div>

              {/* Footer text */}
              <p className="text-center mt-6 text-sm text-(--neutral-500)">
                © 2025 SBorrowHub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Authentication;
