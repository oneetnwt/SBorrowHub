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
  timestamp: { type: Date, default: Date.now },
});

const LogModel = model("log", logSchema);

export default LogModel;
