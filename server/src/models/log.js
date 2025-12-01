import { Schema, model } from "mongoose";

const logSchema = Schema({
  userId: { type: String, default: "anonymous" },
  method: String,
  url: String,
  action: String, // legacy combined method + url for backward compatibility
  ip: String,
  status: Number,
  responseTimeMs: Number,
  bodySize: Number,
  headers: { type: Object, default: {} }, // sanitized subset
  details: String, // truncated body JSON string
  error: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now, index: -1 }, // Add descending index
});

// Add compound index for better query performance
logSchema.index({ timestamp: -1, method: 1 });

const LogModel = model("log", logSchema);

export default LogModel;
