import asyncHandler from "express-async-handler";
import { appAssert } from "../errors/appAssert.js";
import UserModel from "../models/user.js";
import LogModel from "../models/log.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const { limit = 500, skip = 0, sort = -1 } = req.query;

  const logs = await LogModel.find()
    .sort({ timestamp: parseInt(sort) })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .lean(); // Use lean() for faster queries

  const totalCount = await LogModel.countDocuments();

  // Return empty array if no logs, don't throw error
  res.status(200).json({
    logs: logs || [],
    total: totalCount,
    hasMore: totalCount > parseInt(skip) + parseInt(limit),
  });
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

export const getSystemInfo = asyncHandler(async (req, res) => {
  try {
    // Get server uptime
    const uptimeSeconds = Math.floor(process.uptime());
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const formattedUptime = `${days}d ${hours}h ${minutes}m`;

    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

    // Get last backup info
    const BACKUP_DIR = path.join(__dirname, "../../backups");
    let lastBackup = "Never";

    if (fs.existsSync(BACKUP_DIR)) {
      const files = fs
        .readdirSync(BACKUP_DIR)
        .filter((file) => file.endsWith(".gz"))
        .map((file) => {
          const filePath = path.join(BACKUP_DIR, file);
          const stats = fs.statSync(filePath);
          return {
            fileName: file,
            createdAt: stats.mtime,
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (files.length > 0) {
        const lastBackupDate = new Date(files[0].createdAt);
        const now = new Date();
        const diffMs = now - lastBackupDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
          lastBackup = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        } else if (diffHours > 0) {
          lastBackup = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        } else if (diffMins > 0) {
          lastBackup = `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
        } else {
          lastBackup = "Just now";
        }
      }
    }

    // Get app version from package.json
    const packageJsonPath = path.join(__dirname, "../../package.json");
    let version = "v1.0.0";
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      version = `v${packageJson.version}`;
    }

    res.status(200).json({
      version,
      uptime: formattedUptime,
      database: dbStatus,
      lastBackup,
    });
  } catch (error) {
    console.error("Error fetching system info:", error);
    res.status(500).json({
      message: "Failed to fetch system info",
      error: error.message,
    });
  }
});
