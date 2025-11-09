import mongoose from "mongoose";

const borrowRequestSchema = mongoose.Schema(
  {
    requestCode: { type: String, unique: true, required: true },
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    borrowDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    purpose: { type: String, required: true },
    actualReturnDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "borrowed", "returned"],
      default: "pending",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const BorrowRequestModel = mongoose.model("BorrowRequest", borrowRequestSchema);

export default BorrowRequestModel;
