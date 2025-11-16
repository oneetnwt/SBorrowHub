import asyncHandler from "express-async-handler";
import { appAssert } from "../errors/appAssert.js";
import UserModel from "../models/user.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.find();

  appAssert(users.length > 0, "No users found", 400);

  res.status(200).json(users);
});
