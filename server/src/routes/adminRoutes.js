import { Router } from "express";
import { adminRoute } from "../middlewares/auth.js";
import {
  getAllOfficer,
  getAllUsers,
  getLogs,
  updateUserRole,
} from "../controllers/adminController.js";

const router = Router();

router.get("/get-all-users", getAllUsers);
router.put("/update-role/:id", updateUserRole);
router.get("/officer", getAllOfficer);
router.get("/logs", getLogs);

export default router;
