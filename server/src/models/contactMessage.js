import mongoose from "mongoose";

const contactMessageSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    replies: [
      {
        repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: { type: String },
        repliedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved"],
      default: "new",
    },
  },
  { timestamps: true }
);

const ContactMessageModel = mongoose.model(
  "ContactMessage",
  contactMessageSchema
);

export default ContactMessageModel;
