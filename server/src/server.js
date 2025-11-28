import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import session from "express-session";
import passport from "passport";
import { WebSocketServer } from "ws";
import { createServer } from "http";

import errorHandler from "./middlewares/errorHandler.js";
import connectDB from "./db/connectDB.js";

import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import officerRoutes from "./routes/officerRoutes.js";
import UserModel from "./models/user.js";

// Import passport configuration (this registers the Google strategy)
import "./utils/passport.js";
import { logActivity } from "./middlewares/log.js";

config();

const app = express();

// Increase payload limit for base64 images
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

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

// Log activity for incoming requests (after passport/session so req.user is available)
app.use(logActivity);

// Routes
app.use("/auth", authRoutes);
app.use("/catalog", itemRoutes);
app.use("/admin", adminRoutes);
app.use("/officer", officerRoutes);
app.use("/notification", notificationRoutes);

// Error handler must be AFTER routes
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
const server = createServer(app);

// WebSocket Server Setup
const wss = new WebSocketServer({ server });

// Store connected clients with their user IDs
const clients = new Map();

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      // Register user connection
      if (data.type === "register" && data.userId) {
        clients.set(data.userId, ws);
        console.log(`User ${data.userId} registered for notifications`);

        // Update user online status in database
        await UserModel.findByIdAndUpdate(data.userId, {
          isOnline: true,
          lastLoginAt: new Date(),
        });

        // Broadcast updated active users count to all admins
        const activeUsersCount = await UserModel.countDocuments({
          isOnline: true,
        });
        broadcastToAdmins({
          type: "active_users_update",
          count: activeUsersCount,
        });
      }
    } catch (err) {
      console.error("WebSocket message error:", err);
    }
  });

  ws.on("close", async () => {
    // Remove client from map and update database
    for (const [userId, client] of clients.entries()) {
      if (client === ws) {
        clients.delete(userId);
        console.log(`User ${userId} disconnected`);

        // Update user offline status in database
        await UserModel.findByIdAndUpdate(userId, { isOnline: false });

        // Broadcast updated active users count to all admins
        const activeUsersCount = await UserModel.countDocuments({
          isOnline: true,
        });
        broadcastToAdmins({
          type: "active_users_update",
          count: activeUsersCount,
        });
        break;
      }
    }
  });
});

// Export function to send notifications to specific users
export const sendNotificationToUser = (userId, notification) => {
  const client = clients.get(userId.toString());
  if (client && client.readyState === 1) {
    // 1 = OPEN
    client.send(
      JSON.stringify({
        type: "notification",
        data: notification,
      })
    );
  }
};

// Export function to broadcast activity to all connected officers
export const broadcastActivity = (message) => {
  clients.forEach((client) => {
    if (client.readyState === 1) {
      // 1 = OPEN
      client.send(JSON.stringify(message));
    }
  });
};

// Function to broadcast to admin users only
const broadcastToAdmins = async (message) => {
  try {
    const adminUsers = await UserModel.find({ role: "admin" }).select("_id");
    const adminIds = adminUsers.map((user) => user._id.toString());

    adminIds.forEach((adminId) => {
      const client = clients.get(adminId);
      if (client && client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    });
  } catch (err) {
    console.error("Error broadcasting to admins:", err);
  }
};

server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});
