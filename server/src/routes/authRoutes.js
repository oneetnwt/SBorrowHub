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

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route after Google login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/auth/signup",
  }),
  async (req, res) => {
    try {
      // User is available in req.user after successful authentication
      const { generateToken } = await import("../utils/jwt.js");
      const UserModel = (await import("../models/user.js")).default;

      // Get the full user object with omitPassword method
      const user = await UserModel.findById(req.user._id);

      // Generate JWT token
      generateToken(user._id, res);

      // Redirect to frontend with success
      res.redirect("http://localhost:5173");
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect("http://localhost:5173/auth/signup");
    }
  }
);

export default router;
