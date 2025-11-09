import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import session from "express-session";
import passport from "passport";

import errorHandler from "./middlewares/errorHandler.js";
import connectDB from "./db/connectDB.js";

import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";

// Import passport configuration (this registers the Google strategy)
import "./utils/passport.js";

config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(errorHandler);

// Routes
app.use("/auth", authRoutes);
app.use("/catalog", itemRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
