import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/database.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";

config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use(errorHandler);

// Routes
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	connectDB();
	console.log(`Server running on port ${PORT}`);
});
