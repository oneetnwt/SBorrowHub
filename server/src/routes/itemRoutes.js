import { Router } from "express";
import { adminRoute, protectRoute } from "../middlewares/auth.js";
import {
  addItem,
  createBorrowRequest,
  getAllItem,
  getLowStock,
  getRequestItem,
  updateItem,
  getItemsWithAvailability,
  markAsPickedUp,
  requestReturnApproval,
  archiveItem,
  getArchivedItems,
  unarchiveItem,
} from "../controllers/itemController.js";

const router = Router();

router.post("/add-item", addItem);
router.get("/get-items", getAllItem);
router.get("/get-items-availability", getItemsWithAvailability);
router.put("/update-item/:id", updateItem);
router.put("/archive-item/:id", archiveItem);
router.get("/get-archived-items", getArchivedItems);
router.put("/unarchive-item/:id", unarchiveItem);

router.post("/request-item", protectRoute, createBorrowRequest);
router.get("/get-request-item", protectRoute, getRequestItem);
router.put("/mark-picked-up/:id", protectRoute, markAsPickedUp);
router.put("/request-return/:id", protectRoute, requestReturnApproval);
router.get("/get-low-stock", getLowStock);

export default router;
