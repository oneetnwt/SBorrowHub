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
import cartRoutes from "./routes/cartRoutes.js";
import backupRoutes from "./routes/backupRoutes.js";
import UserModel from "./models/user.js";

// Import passport configuration (this registers the Google strategy)
import "./utils/passport.js";
import { logActivity } from "./middlewares/log.js";

config();

const app = express();
export const serverStartTime = Date.now();

// Increase payload limit for base64 images
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
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
app.use("/cart", cartRoutes);
app.use("/backup", backupRoutes);

// Error handler must be AFTER routes
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
const server = createServer(app);

// WebSocket Server Setup
const wss = new WebSocketServer({ server });

// Store connected clients with their user IDs and last activity
const clients = new Map();

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  // Set up heartbeat
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      // Register user connection
      if (data.type === "register" && data.userId) {
        clients.set(data.userId, { ws, lastActivity: Date.now() });
        console.log(`User ${data.userId} registered for notifications`);

        // Update user online status in database
        await UserModel.findByIdAndUpdate(data.userId, {
          isOnline: true,
          lastLoginAt: new Date(),
        });

        // Broadcast user status update to all admins
        broadcastToAdmins({
          type: "user_status_update",
          userId: data.userId,
          isOnline: true,
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

      // Update last activity on any message
      for (const [userId, client] of clients.entries()) {
        if (client.ws === ws) {
          client.lastActivity = Date.now();
          break;
        }
      }
    } catch (err) {
      console.error("WebSocket message error:", err);
    }
  });

  ws.on("close", async () => {
    // Remove client from map and update database
    for (const [userId, client] of clients.entries()) {
      if (client.ws === ws) {
        clients.delete(userId);
        console.log(`User ${userId} disconnected`);

        // Update user offline status in database
        await UserModel.findByIdAndUpdate(userId, { isOnline: false });

        // Broadcast user status update to all admins
        broadcastToAdmins({
          type: "user_status_update",
          userId: userId,
          isOnline: false,
        });

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

// Heartbeat interval to detect dead connections
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      // Connection is dead, terminate it
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30000); // Check every 30 seconds

// Clean up interval on server shutdown
wss.on("close", () => {
  clearInterval(heartbeatInterval);
});

// Export function to send notifications to specific users
export const sendNotificationToUser = (userId, notification) => {
  const clientData = clients.get(userId.toString());
  if (clientData && clientData.ws && clientData.ws.readyState === 1) {
    // 1 = OPEN
    clientData.ws.send(
      JSON.stringify({
        type: "notification",
        data: notification,
      })
    );
  }
};

// Export function to broadcast activity to all connected officers
export const broadcastActivity = (message) => {
  clients.forEach((clientData) => {
    if (clientData.ws && clientData.ws.readyState === 1) {
      // 1 = OPEN
      clientData.ws.send(JSON.stringify(message));
    }
  });
};

// Function to broadcast to admin users only
const broadcastToAdmins = async (message) => {
  try {
    const adminUsers = await UserModel.find({ role: "admin" }).select("_id");
    const adminIds = adminUsers.map((user) => user._id.toString());

    adminIds.forEach((adminId) => {
      const clientData = clients.get(adminId);
      if (clientData && clientData.ws && clientData.ws.readyState === 1) {
        clientData.ws.send(JSON.stringify(message));
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
