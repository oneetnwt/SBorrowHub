import { Router } from "express";
import {
  addItem,
  createBorrowRequest,
  getAllItem,
  updateItem,
} from "../controllers/itemController.js";

const router = Router();

router.post("/add-item", addItem);
router.get("/get-items", getAllItem);
router.put("/update-item/:id", updateItem);

router.post("/request-item", createBorrowRequest);

export default router;
