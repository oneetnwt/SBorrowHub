import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import "./index.css";
import Route from "./Route";

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Route />
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={12}
      toastOptions={{
        duration: 3000,
        style: {
          marginTop: "20px",
          zIndex: 999999,
          fontWeight: "500",
          padding: "16px",
          borderRadius: "8px",
        },
        success: {
          duration: 3000,
          style: {
            background: "#10B981",
            color: "#fff",
            zIndex: 999999,
            marginTop: "20px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#10B981",
          },
        },
        error: {
          duration: 3000,
          style: {
            background: "#EF4444",
            color: "#fff",
            zIndex: 999999,
            marginTop: "20px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        },
      }}
      containerStyle={{
        top: 0,
        zIndex: 999999,
      }}
    />
  </GoogleOAuthProvider>
);
