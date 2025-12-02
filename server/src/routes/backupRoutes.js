import { Router } from "express";
import { adminRoute } from "../middlewares/auth.js";
import {
  createBackup,
  getBackups,
  downloadBackup,
  deleteBackup,
  restoreBackup,
} from "../controllers/backupController.js";

const router = Router();

// All routes require admin authentication
router.post("/create", adminRoute, createBackup);
router.get("/list", adminRoute, getBackups);
router.get("/download/:fileName", adminRoute, downloadBackup);
router.delete("/delete/:fileName", adminRoute, deleteBackup);
router.post("/restore/:fileName", adminRoute, restoreBackup);

export default router;
