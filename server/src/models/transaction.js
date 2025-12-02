import mongoose from "mongoose";

const transactionSchema = mongoose.Schema(
  {
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
    borrowRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BorrowRequest",
      required: true,
    },
    quantityBorrowed: { type: Number, required: true, min: 1 },
    borrowDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    actualReturnDate: { type: Date, default: null },
    daysOverdue: { type: Number, default: 0 },
    penaltyAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["completed", "overdue", "returned_late"],
      default: "completed",
    },
  },
  { timestamps: true }
);

const TransactionModel = mongoose.model("Transaction", transactionSchema);

export default TransactionModel;
