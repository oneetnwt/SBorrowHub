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

export const getUptime = asyncHandler(async (req, res) => {
  console.log("getUptime called");
  const uptimeSeconds = Math.floor(process.uptime());
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);

  const result = {
    uptime: uptimeSeconds * 1000,
    formatted: `${days}d ${hours}h ${minutes}m`,
    percentage: 99.9,
  };

  console.log("Uptime result:", result);
  res.status(200).json(result);
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  // User statistics
  const totalUsers = await UserModel.countDocuments();
  const activeUsers = await UserModel.countDocuments({ isOnline: true });
  const usersByRole = await UserModel.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  // User activity status
  const onlineUsers = await UserModel.countDocuments({ isOnline: true });
  const offlineUsers = await UserModel.countDocuments({ isOnline: false });

  res.status(200).json({
    totalUsers,
    activeUsers,
    usersByRole,
    activityStatus: {
      online: onlineUsers,
      offline: offlineUsers,
    },
  });
});
