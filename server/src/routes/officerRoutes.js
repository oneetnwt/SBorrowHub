import { Router } from "express";
import { adminRoute } from "../middlewares/auth.js";
import {
  getAllTransactions,
  updateRequestStatus,
  getDashboardStats,
  getPendingRequests,
  getOverdueLoans,
  getRecentActivity,
  getLowStockItems,
} from "../controllers/officerController.js";

const router = Router();

router.get("/get-all-transactions", getAllTransactions);
router.get("/dashboard-stats", getDashboardStats);
router.get("/pending-requests", getPendingRequests);
router.get("/overdue-loans", getOverdueLoans);
router.get("/recent-activity", getRecentActivity);
router.get("/low-stock-items", getLowStockItems);
router.put("/update-request-status/:id", updateRequestStatus);

export default router;
