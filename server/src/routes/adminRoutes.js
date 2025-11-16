import { Router } from "express";
import { adminRoute } from "../middlewares/auth.js";
import { getAllUsers } from "../controllers/adminController.js";

const router = Router();

router.get("/get-all-users", getAllUsers);

export default router;
