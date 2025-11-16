import { Schema, model } from "mongoose";

const logSchema = Schema({
  userId: String,
  action: String,
  ip: String,
  details: String,
  timestamp: { type: Date, default: Date.now },
});

const LogModel = model("log", logSchema);

export default LogModel;
