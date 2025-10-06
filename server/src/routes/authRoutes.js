import { Router } from "express";
import { signup } from "../controllers/authControllers.js";

const router = Router();

router.post("/signup", signup);

export default router;
