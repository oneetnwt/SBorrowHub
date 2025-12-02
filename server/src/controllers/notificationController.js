import asyncHandler from "express-async-handler";
import NotificationModel from "../models/notification.js";
import { appAssert } from "../errors/appAssert.js";
import { sendNotificationToUser } from "../server.js";

export const getUserNotifications = asyncHandler(async (req, res) => {
  const notification = await NotificationModel.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("relatedItemId")
    .populate("relatedRequestId");

  res.status(200).json(notification);
});

export const createNotification = asyncHandler(async (notificationData) => {
  appAssert(notificationData, "No notification data", 400);

  const notification = new NotificationModel(notificationData);

  await notification.save();

  // Send real-time notification via WebSocket
  try {
    sendNotificationToUser(notificationData.userId, notification);
  } catch (err) {
    console.error("Failed to send WebSocket notification:", err);
  }

  return notification;
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await NotificationModel.findById(req.params.id);

  appAssert(notification, "Notification not found", 404);
  appAssert(
    notification.userId.toString() === req.user._id.toString(),
    "Unauthorized to mark this notification as read",
    403
  );

  notification.isRead = true;
  await notification.save();

  res.status(200).json(notification);
});
