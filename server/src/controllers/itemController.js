import asyncHandler from "express-async-handler";
import { itemSchema, updateItemSchema } from "../schema/itemSchema.js";
import cloudinary from "../api/cloudinary.js";
import ItemModel from "../models/item.js";
import { appAssert } from "../errors/appAssert.js";
import { borrowRequestSchema } from "../schema/borrowRequestSchema.js";
import BorrowRequestModel from "../models/borrowRequest.js";
import { generateRequestCode } from "../utils/generateRequestCode.js";

export const addItem = asyncHandler(async (req, res) => {
  const body = itemSchema.parse(req.body);

  let uploadResponse;
  try {
    uploadResponse = await cloudinary.uploader.upload(body.image);
  } catch (cloudinaryError) {
    console.error("Cloudinary Error:", cloudinaryError);
    return res.status(500).json({ message: "Failed to upload profile image" });
  }

  const newItem = new ItemModel({
    name: body.name,
    description: body.description,
    tags: body.tags,
    image: uploadResponse.secure_url,
    quantity: body.quantity,
    available: body.available,
  });

  await newItem.save();
  res.status(200).json({ message: "Item created", newItem });
});

export const getAllItem = asyncHandler(async (req, res) => {
  const items = await ItemModel.find();

  appAssert(items.length > 0, "No items found", 400);

  res.status(200).json(items);
});

export const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const body = updateItemSchema.parse(req.body);

  const item = await ItemModel.findById(id);
  appAssert(item, "Item not found", 404);

  const updatedItem = await ItemModel.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    message: "Item updated successfully",
    item: updatedItem,
  });
});

export const createBorrowRequest = asyncHandler(async (req, res) => {
  const body = borrowRequestSchema.parse(req.body);

  // Verify item exists and has enough quantity
  const item = await ItemModel.findById(body.itemId);
  appAssert(item, "Item not found", 404);
  appAssert(
    item.available >= body.quantity,
    `Only ${item.available} items available`,
    400
  );

  // Validate dates
  const borrowDate = new Date(body.borrowDate);
  const returnDate = new Date(body.returnDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  appAssert(borrowDate >= today, "Borrow date cannot be in the past", 400);
  appAssert(
    returnDate > borrowDate,
    "Return date must be after borrow date",
    400
  );

  // Generate unique request code
  const requestCode = generateRequestCode();

  // Create borrow request
  const borrowRequest = new BorrowRequestModel({
    requestCode,
    borrowerId: body.borrowerId,
    itemId: body.itemId,
    quantity: body.quantity,
    borrowDate: borrowDate,
    returnDate: returnDate,
    purpose: body.purpose,
    notes: body.notes || "",
    status: "pending",
  });

  await borrowRequest.save();

  res.status(201).json({
    message: "Borrow request submitted successfully",
    borrowRequest,
  });
});
