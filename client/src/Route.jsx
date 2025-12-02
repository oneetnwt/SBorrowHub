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
import ChangePassword from "./pages/ChangePassword";
import Authentication from "./pages/Authentication";
import Signup from "./pages/Signup";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Officer from "./pages/officer/Officer";
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import OfficerAnalytics from "./pages/officer/OfficerAnalytics";
import OfficerInventory from "./pages/officer/OfficerInventory";
import OfficerArchive from "./pages/officer/OfficerArchive";
import OfficerRequests from "./pages/officer/OfficerRequests";
import OfficerTransactions from "./pages/officer/OfficerTransactions";
import OfficerUsers from "./pages/officer/OfficerUsers";
import ProtectedRoute from "./components/ProtectedRoute";
import OfficerProtectedRoute from "./components/OfficerProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Admin from "./pages/admin/Admin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPermissionControl from "./pages/admin/AdminPermissionControl";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLog from "./pages/admin/AdminLog";
import AdminBackup from "./pages/admin/AdminBackup";
import UserHelp from "./pages/UserHelp";
import OfficerHelp from "./pages/officer/OfficerHelp";
import Error from "./pages/Error";

function Route() {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <App />
        </ProtectedRoute>
      ),
      errorElement: <Error />,
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
              path: "change-password",
              element: <ChangePassword />,
            },
          ],
        },
        {
          path: "help",
          element: <UserHelp />,
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
    {
      path: "/officer",
      element: (
        <OfficerProtectedRoute>
          <Officer />
        </OfficerProtectedRoute>
      ),
      children: [
        {
          path: "",
          element: <OfficerDashboard />,
        },
        {
          path: "inventory",
          element: <OfficerInventory />,
        },
        {
          path: "archive",
          element: <OfficerArchive />,
        },
        {
          path: "requests",
          element: <OfficerRequests />,
        },
        {
          path: "transactions",
          element: <OfficerTransactions />,
        },
        {
          path: "users",
          element: <OfficerUsers />,
        },
        {
          path: "analytics",
          element: <OfficerAnalytics />,
        },
        {
          path: "help",
          element: <OfficerHelp />,
        },
      ],
    },
    {
      path: "/admin",
      element: (
        <AdminProtectedRoute>
          <Admin />
        </AdminProtectedRoute>
      ),
      children: [
        {
          path: "",
          element: <AdminDashboard />,
        },
        {
          path: "permission-control",
          element: <AdminPermissionControl />,
        },
        {
          path: "users",
          element: <AdminUsers />,
        },
        {
          path: "logs",
          element: <AdminLog />,
        },
        {
          path: "backup",
          element: <AdminBackup />,
        },
      ],
    },
  ]);

  return <RouterProvider router={routes} />;
}

export default Route;
