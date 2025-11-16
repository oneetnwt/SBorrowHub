import { Router } from "express";
import {
  getUserNotifications,
  markAsRead,
} from "../controllers/notificationController.js";
import { protectRoute } from "../middlewares/auth.js";

const router = Router();

router.get("/", protectRoute, getUserNotifications);
router.patch("/:id/read", protectRoute, markAsRead);

export default router;
