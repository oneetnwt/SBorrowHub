import { Router } from "express";
import { adminRoute } from "../middlewares/auth.js";
import {
  getAllTransactions,
  updateRequestStatus,
  getDashboardStats,
  getPendingRequests,
  getRecentActivity,
  getLowStockItems,
  getOverdue,
  sendOverdueNotification,
  getReturnPendingRequests,
  approveReturn,
} from "../controllers/officerController.js";

const router = Router();

router.get("/get-all-transactions", getAllTransactions);
router.get("/dashboard-stats", getDashboardStats);
router.get("/pending-requests", getPendingRequests);
router.get("/overdue", getOverdue);
router.get("/recent-activity", getRecentActivity);
router.get("/low-stock-items", getLowStockItems);
router.get("/return-pending", getReturnPendingRequests);
router.put("/update-request-status/:id", updateRequestStatus);
router.put("/approve-return/:id", approveReturn);
router.post("/send-overdue-notification/:id", sendOverdueNotification);

export default router;
