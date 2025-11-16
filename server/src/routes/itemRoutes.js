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
} from "../controllers/itemController.js";

const router = Router();

router.post("/add-item", addItem);
router.get("/get-items", getAllItem);
router.get("/get-items-availability", getItemsWithAvailability);
router.put("/update-item/:id", updateItem);

router.post("/request-item", protectRoute, createBorrowRequest);
router.get("/get-request-item", protectRoute, getRequestItem);
router.get("/get-low-stock", getLowStock);

export default router;
