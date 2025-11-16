import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import LogModel from "../models/log.js";
import UserModel from "../models/user.js";
import ItemModel from "../models/item.js";
import { broadcastActivity } from "../server.js";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TYPES,
  FALLBACK_ACTIONS,
} from "../constant/index.js";

export const logActivity = asyncHandler(async (req, res, next) => {
  // Skip logging GET requests
  if (req.method === "GET") {
    return next();
  }

  // Try to extract user ID from JWT cookie if it exists
  let userId = "anonymous";

  try {
    const token = req.cookies.jwt;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId || "anonymous";
    }
  } catch (error) {
    // If JWT is invalid or expired, just log as anonymous
    userId = "anonymous";
  }

  // Log activity for both authenticated and unauthenticated requests
  try {
    const newLog = new LogModel({
      userId: userId,
      action: `${req.method} ${req.originalUrl}`,
      ip: req.ip,
      details: JSON.stringify(req.body),
    });

    await newLog.save();

    // Special logging for new user registration
    if (
      req.method === "POST" &&
      req.originalUrl === "/auth/signup" &&
      req.body
    ) {
      console.log(
        `🆕 New user registered: ${req.body.email} (${req.body.studentId}) - ${req.body.firstname} ${req.body.lastname}`
      );
    } else {
      console.log(
        `✓ Logged: ${req.method} ${req.originalUrl} - User: ${userId}`
      );
    }

    // Broadcast activity to WebSocket clients (only for user role activities)
    if (userId !== "anonymous") {
      try {
        const user = await UserModel.findById(userId).select(
          "firstname lastname role"
        );

        // Only broadcast activities from regular users
        if (user && user.role === "user") {
          let userName = `${user.firstname} ${user.lastname}`;
          let type = "user";
          let item = "";
          let action = "";

          // Try to extract item info from request body
          if (req.body && req.body.itemId) {
            const itemData = await ItemModel.findById(req.body.itemId).select(
              "name"
            );
            if (itemData) {
              item = itemData.name;
            }
          }

          // Match action with predefined patterns
          const matchedAction = ACTIVITY_ACTIONS.find((a) =>
            a.match(`${req.method} ${req.originalUrl}`, req.method)
          );

          if (matchedAction) {
            type = matchedAction.type;
            action = matchedAction.getText(item);

            // Broadcast to all connected WebSocket clients
            broadcastActivity({
              type: "activity",
              data: {
                _id: newLog._id,
                action,
                userName,
                item,
                timestamp: newLog.timestamp,
                type,
              },
            });
          }
        }
      } catch (broadcastError) {
        console.error("Error broadcasting activity:", broadcastError.message);
      }
    }
  } catch (logError) {
    // Don't block the request if logging fails
    console.error("Logging error:", logError.message);
  }

  next();
});
