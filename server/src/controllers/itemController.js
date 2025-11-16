import asyncHandler from "express-async-handler";
import { itemSchema, updateItemSchema } from "../schema/itemSchema.js";
import cloudinary from "../api/cloudinary.js";
import ItemModel from "../models/item.js";
import { appAssert } from "../errors/appAssert.js";
import { borrowRequestSchema } from "../schema/borrowRequestSchema.js";
import BorrowRequestModel from "../models/borrowRequest.js";
import { generateRequestCode } from "../utils/generateRequestCode.js";
import { checkItemAvailability } from "../utils/checkItemAvailability.js";
import { broadcastActivity } from "../server.js";

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
  const userId = req.user._id;

  appAssert(userId, "User ID is required", 400);

  // Verify item exists
  const item = await ItemModel.findById(body.itemId);
  appAssert(item, "Item not found", 404);

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

  // Check availability for the requested date range
  const availability = await checkItemAvailability(
    body.itemId,
    borrowDate,
    returnDate
  );

  appAssert(
    availability.available >= body.quantity,
    `Only ${availability.available} item(s) available for the selected dates. ${availability.borrowedCount} already borrowed during this period.`,
    400
  );

  // Generate unique request code
  const requestCode = generateRequestCode();

  // Create borrow request
  const borrowRequest = new BorrowRequestModel({
    requestCode,
    borrowerId: userId,
    itemId: body.itemId,
    quantity: body.quantity,
    borrowDate: borrowDate,
    returnDate: returnDate,
    purpose: body.purpose,
    notes: body.notes || "",
    status: "pending",
  });

  await borrowRequest.save();

  // Populate the data for WebSocket broadcast
  await borrowRequest.populate(
    "borrowerId",
    "firstname lastname profilePicture email"
  );
  await borrowRequest.populate("itemId", "name image");

  // Broadcast new pending request to all connected officers via WebSocket
  broadcastActivity({
    type: "pendingRequest",
    data: borrowRequest,
  });

  res.status(201).json({
    message: "Borrow request submitted successfully",
    borrowRequest,
  });
});

export const getRequestItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  appAssert(userId, "No User ID found", 404);

  const items = await BorrowRequestModel.find({ borrowerId: userId }).populate(
    "itemId",
    "name tags image status"
  );

  res.status(200).json(items);
});

export const getLowStock = asyncHandler(async (req, res) => {
  const item = await ItemModel.find({ available: { $lte: 1 } });
  res.status(200).json(item);
});

export const getItemsWithAvailability = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Get all items
  const items = await ItemModel.find();

  // If no date range specified, return items with current availability
  if (!startDate || !endDate) {
    return res.status(200).json(items);
  }

  // Calculate availability for each item for the specified date range
  const itemsWithAvailability = await Promise.all(
    items.map(async (item) => {
      try {
        const availability = await checkItemAvailability(
          item._id,
          new Date(startDate),
          new Date(endDate)
        );

        return {
          ...item.toObject(),
          availableForDateRange: availability.available,
          borrowedForDateRange: availability.borrowedCount,
          overlappingRequests: availability.overlappingRequests,
        };
      } catch (error) {
        console.error(
          `Error checking availability for item ${item._id}:`,
          error
        );
        return {
          ...item.toObject(),
          availableForDateRange: item.available,
          borrowedForDateRange: 0,
          overlappingRequests: 0,
        };
      }
    })
  );

  res.status(200).json(itemsWithAvailability);
});
