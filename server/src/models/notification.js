import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["In progress", "Action needed", "Completed"],
      default: "In progress",
    },
    isRead: { type: Boolean, default: false },
    relatedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      default: null,
    },
    relatedRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BorrowRequest",
      default: null,
    },
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model("Notification", notificationSchema);

export default NotificationModel;
