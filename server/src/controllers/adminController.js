import asyncHandler from "express-async-handler";
import { appAssert } from "../errors/appAssert.js";
import UserModel from "../models/user.js";
import LogModel from "../models/log.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.find();

  appAssert(users.length > 0, "No users found", 400);

  res.status(200).json(users);
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = req.body.role;

  appAssert(id, "ID not provided", 400);

  const user = await UserModel.findById(id);

  appAssert(user, "User not found", 400);

  user.role = role;

  await user.save();

  res.status(200).json({ message: "Role Updated", user: user.omitPassword() });
});

export const getAllOfficer = asyncHandler(async (req, res) => {
  const officers = await UserModel.find({ role: "officer" });

  appAssert(officers.length > 0, "No officer found", 400);

  res.status(200).json(officers);
});

export const getLogs = asyncHandler(async (req, res) => {
  const logs = await LogModel.find().sort({ createdAt: 1 });

  appAssert(logs.length > 0, "No logs found", 400);

  res.status(200).json(logs);
});
