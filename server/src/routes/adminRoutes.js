import { Router } from "express";
import { adminRoute } from "../middlewares/auth.js";
import {
  getAllOfficer,
  getAllUsers,
  getLogs,
  getUptime,
  updateUserRole,
  getDashboardStats,
} from "../controllers/adminController.js";

const router = Router();

router.get("/get-all-users", getAllUsers);
router.put("/update-role/:id", updateUserRole);
router.get("/officer", getAllOfficer);
router.get("/logs", getLogs);
router.get("/uptime", getUptime);
router.get("/dashboard-stats", getDashboardStats);

export default router;
