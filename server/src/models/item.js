import mongoose from "mongoose";

const itemSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    available: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["available", "all_borrowed", "maintenance"],
      default: "available",
    },
    tags: [{ type: String }],
    condition: {
      type: String,
      enum: ["Good", "Fair", "Needs Repair"],
      default: "Good",
    },
    maxBorrowDays: { type: Number, default: 30 },
  },
  { timestamps: true }
);

const ItemModel = mongoose.model("Item", itemSchema);

export default ItemModel;
