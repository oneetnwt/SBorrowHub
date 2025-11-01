import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";

import errorHandler from "./middlewares/errorHandler.js";
import connectDB from "./db/connectDB.js";

config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
