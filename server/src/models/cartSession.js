import mongoose from "mongoose";

const cartSessionSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        borrowDays: { type: Number, required: true, min: 1, max: 30 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    totalItems: { type: Number, default: 0 },
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

const CartSessionModel = mongoose.model("CartSession", cartSessionSchema);

export default CartSessionModel;
