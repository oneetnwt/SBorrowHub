import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

import { appAssert } from "../errors/appAssert.js";
import { config } from "dotenv";
import UserModel from "../models/user.js";

config();

export const protectRoute = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt;

  appAssert(token, "Unauthorized - No token provided", 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  appAssert(decoded, "Unauthorized - Invalid Token", 401);

  const user = await UserModel.findById(decoded.userId).select("-password");

  appAssert(user, "Unauthorized - User not found", 404);

  req.user = user;

  next();
});

export const adminRoute = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt;

  appAssert(token, "Unauthorized - No token provided", 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  appAssert(decoded, "Unauthorized - Invalid Token", 401);

  const user = await UserModel.findById(decoded.userId).select("-password");

  appAssert(user, "Unauthorized - User not found", 404);

  const isAdmin = user.role === "admin";

  appAssert(isAdmin, "Unauthorized - User is not an Admin", 400);

  req.user = user;

  next();
});
