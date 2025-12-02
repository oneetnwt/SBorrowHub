import asyncHandler from "express-async-handler";
import { appAssert } from "../errors/appAssert.js";
import CartSessionModel from "../models/cartSession.js";
import ItemModel from "../models/item.js";

// Get user's cart
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await CartSessionModel.findOne({ userId }).populate(
    "items.itemId",
    "name category image available"
  );

  // Create cart if doesn't exist
  if (!cart) {
    cart = await CartSessionModel.create({
      userId,
      items: [],
      totalItems: 0,
    });
  }

  res.status(200).json(cart);
});

// Add item to cart
export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId, quantity = 1, borrowDays = 7 } = req.body;

  appAssert(itemId, "Item ID is required", 400);
  appAssert(quantity > 0, "Quantity must be greater than 0", 400);
  appAssert(
    borrowDays >= 1 && borrowDays <= 30,
    "Borrow days must be between 1 and 30",
    400
  );

  // Check if item exists and has availability
  const item = await ItemModel.findById(itemId);
  appAssert(item, "Item not found", 404);
  appAssert(item.available >= quantity, "Not enough items available", 400);

  let cart = await CartSessionModel.findOne({ userId });

  if (!cart) {
    cart = await CartSessionModel.create({
      userId,
      items: [],
      totalItems: 0,
    });
  }

  // Check if item already in cart
  const existingItemIndex = cart.items.findIndex(
    (cartItem) => cartItem.itemId.toString() === itemId
  );

  if (existingItemIndex > -1) {
    // Update quantity and borrow days
    cart.items[existingItemIndex].quantity = quantity;
    cart.items[existingItemIndex].borrowDays = borrowDays;
  } else {
    // Add new item
    cart.items.push({
      itemId,
      quantity,
      borrowDays,
      addedAt: new Date(),
    });
  }

  cart.totalItems = cart.items.length;
  await cart.save();

  // Populate item details before sending response
  await cart.populate({
    path: "items.itemId",
    select: "name category images available",
  });

  res.status(200).json(cart);
});

// Update cart item
export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;
  const { quantity, borrowDays } = req.body;

  const cart = await CartSessionModel.findOne({ userId });
  appAssert(cart, "Cart not found", 404);

  const itemIndex = cart.items.findIndex(
    (cartItem) => cartItem.itemId.toString() === itemId
  );
  appAssert(itemIndex > -1, "Item not found in cart", 404);

  if (quantity !== undefined) {
    appAssert(quantity > 0, "Quantity must be greater than 0", 400);
    const item = await ItemModel.findById(itemId);
    appAssert(item.available >= quantity, "Not enough items available", 400);
    cart.items[itemIndex].quantity = quantity;
  }

  if (borrowDays !== undefined) {
    appAssert(
      borrowDays >= 1 && borrowDays <= 30,
      "Borrow days must be between 1 and 30",
      400
    );
    cart.items[itemIndex].borrowDays = borrowDays;
  }

  await cart.save();
  await cart.populate({
    path: "items.itemId",
    select: "name category images available",
  });

  res.status(200).json(cart);
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  const cart = await CartSessionModel.findOne({ userId });
  appAssert(cart, "Cart not found", 404);

  cart.items = cart.items.filter(
    (cartItem) => cartItem.itemId.toString() !== itemId
  );
  cart.totalItems = cart.items.length;

  await cart.save();
  await cart.populate({
    path: "items.itemId",
    select: "name category images available",
  });

  res.status(200).json(cart);
});

// Clear cart
export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await CartSessionModel.findOne({ userId });
  appAssert(cart, "Cart not found", 404);

  cart.items = [];
  cart.totalItems = 0;
  await cart.save();

  res.status(200).json({ message: "Cart cleared successfully", cart });
});
