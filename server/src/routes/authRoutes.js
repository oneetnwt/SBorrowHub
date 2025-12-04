import { Router } from "express";
import passport from "passport";
import { protectRoute } from "../middlewares/auth.js";
import {
  checkAuth,
  checkOtp,
  checkResetSession,
  checkRole,
  login,
  logout,
  resetPassword,
  signup,
  updateProfile,
  verifyCaptcha,
  verifyCode,
  verifyEmail,
  changePassword,
} from "../controllers/authController.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-captcha", verifyCaptcha);

router.post("/verify-email", verifyEmail);
router.post("/verify-otp", verifyCode);
router.post("/reset-password", resetPassword);

router.get("/check-otp", checkOtp);
router.get("/check-reset-session", checkResetSession);
router.get("/check-auth", protectRoute, checkAuth);
router.get("/check-role", protectRoute, checkRole);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/change-password", protectRoute, changePassword);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route after Google login
router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("=== Google Callback - START ===");
    passport.authenticate(
      "google",
      {
        session: false,
        failureRedirect: `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/auth/signup?error=google_auth_failed`,
      },
      (err, user, info) => {
        console.log("Passport authenticate callback - err:", err);
        console.log("Passport authenticate callback - user:", user);
        console.log("Passport authenticate callback - info:", info);

        if (err) {
          console.error("Passport authentication error:", err);
          return res.redirect(
            `${
              process.env.FRONTEND_URL || "http://localhost:5173"
            }/auth/signup?error=auth_error`
          );
        }

        if (!user) {
          console.log("No user returned from passport");
          return res.redirect(
            `${
              process.env.FRONTEND_URL || "http://localhost:5173"
            }/auth/signup?error=no_user`
          );
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  },
  async (req, res) => {
    try {
      console.log("Google callback handler - req.user:", req.user);

      // Check if user exists
      if (!req.user) {
        console.log("No user in req.user, redirecting to signup");
        return res.redirect(
          `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/auth/signup?error=no_account`
        );
      }

      // User is available in req.user after successful authentication
      const { generateToken } = await import("../utils/jwt.js");
      const UserModel = (await import("../models/user.js")).default;

      // Get the full user object with omitPassword method
      const user = await UserModel.findById(req.user._id);

      if (!user) {
        console.log("User not found in database");
        return res.redirect(
          `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/auth/signup?error=user_not_found`
        );
      }

      console.log("Generating token for user:", user._id);
      // Generate JWT token
      generateToken(user._id, res);

      // Redirect to frontend with success
      const redirectUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      console.log("Redirecting to:", redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google callback error:", error);
      console.error("Error stack:", error.stack);
      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/auth/signup?error=callback_error`
      );
    }
  }
);

export default router;
