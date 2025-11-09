import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import UserDashboard from "./pages/UserDashboard";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import UserCatalog from "./pages/UserCatalog";
import BorrowCart from "./pages/BorrowCart";
import ProfilePage from "./pages/ProfilePage";
import Profile from "./pages/Profile";
import TransactionHistory from "./pages/TransactionHistory";
import UserSettings from "./pages/UserSettings";
import Authentication from "./pages/Authentication";
import ProtectedRoute from "./components/protectedRoute";
import Signup from "./pages/Signup";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

function Route() {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <App />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "",
          element: <UserDashboard />,
        },
        {
          path: "catalog",
          element: <UserCatalog />,
        },
        {
          path: "cart",
          element: <BorrowCart />,
        },
        {
          path: "profile",
          element: <ProfilePage />,
          children: [
            {
              path: "",
              element: <Profile />,
            },
            {
              path: "transactions",
              element: <TransactionHistory />,
            },
            {
              path: "settings",
              element: <UserSettings />,
            },
          ],
        },
      ],
    },
    {
      path: "/auth",
      element: <Authentication />,
      children: [
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "signup",
          element: <Signup />,
        },
        {
          path: "forgot-password",
          element: <ForgotPassword />,
        },
        {
          path: "verify-code",
          element: <VerifyCode />,
        },
        {
          path: "reset-password",
          element: <ResetPassword />,
        },
      ],
    },
    {
      path: "/terms",
      element: <TermsOfService />,
    },
    {
      path: "/privacy",
      element: <PrivacyPolicy />,
    },
  ]);

  return <RouterProvider router={routes} />;
}

export default Route;
