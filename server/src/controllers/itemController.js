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
    category: body.category,
    condition: body.condition,
  });

  await newItem.save();
  res.status(200).json({ message: "Item created", newItem });
});

export const getAllItem = asyncHandler(async (req, res) => {
  const items = await ItemModel.find({ isArchived: { $ne: true } });

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

  res.status(200).json(updatedItem);
});

export const archiveItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await ItemModel.findById(id);
  appAssert(item, "Item not found", 404);

  const archivedItem = await ItemModel.findByIdAndUpdate(
    id,
    { isArchived: true },
    { new: true, runValidators: true }
  );

  res
    .status(200)
    .json({ message: "Item archived successfully", item: archivedItem });
});

export const getArchivedItems = asyncHandler(async (req, res) => {
  const items = await ItemModel.find({ isArchived: true });
  res.status(200).json(items);
});

export const unarchiveItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await ItemModel.findById(id);
  appAssert(item, "Item not found", 404);

  const unarchivedItem = await ItemModel.findByIdAndUpdate(
    id,
    { isArchived: false },
    { new: true, runValidators: true }
  );

  res
    .status(200)
    .json({ message: "Item unarchived successfully", item: unarchivedItem });
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

export const markAsPickedUp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id; // Use req.user._id instead of req.userId

  console.log("markAsPickedUp - Transaction ID:", id);
  console.log("markAsPickedUp - User ID from token:", userId);

  const borrowRequest = await BorrowRequestModel.findById(id);

  if (!borrowRequest) {
    console.log("markAsPickedUp - Borrow request not found");
    return res.status(404).json({ message: "Borrow request not found" });
  }

  console.log(
    "markAsPickedUp - BorrowerId from DB:",
    borrowRequest.borrowerId.toString()
  );
  console.log("markAsPickedUp - Current status:", borrowRequest.status);

  // Convert both to strings for comparison
  if (borrowRequest.borrowerId.toString() !== userId.toString()) {
    console.log("markAsPickedUp - Authorization failed");
    return res.status(403).json({ message: "Unauthorized action" });
  }

  if (borrowRequest.status !== "approved") {
    console.log("markAsPickedUp - Status check failed");
    return res.status(400).json({
      message: "Only approved requests can be marked as picked up",
    });
  }

  borrowRequest.status = "borrowed";
  borrowRequest.actualBorrowDate = new Date();
  await borrowRequest.save();

  console.log("markAsPickedUp - Successfully updated to borrowed");

  res.status(200).json({
    message: "Item marked as picked up successfully",
    borrowRequest,
  });
});

// Request return approval (user wants to return borrowed item)
export const requestReturnApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  console.log("requestReturnApproval - Transaction ID:", id);
  console.log("requestReturnApproval - User ID from token:", userId);

  const borrowRequest = await BorrowRequestModel.findById(id);

  if (!borrowRequest) {
    console.log("requestReturnApproval - Borrow request not found");
    return res.status(404).json({ message: "Borrow request not found" });
  }

  console.log(
    "requestReturnApproval - BorrowerId from DB:",
    borrowRequest.borrowerId.toString()
  );
  console.log("requestReturnApproval - Current status:", borrowRequest.status);

  // Verify user owns this request
  if (borrowRequest.borrowerId.toString() !== userId.toString()) {
    console.log("requestReturnApproval - Authorization failed");
    return res.status(403).json({ message: "Unauthorized action" });
  }

  // Only borrowed items can request return
  if (borrowRequest.status !== "borrowed") {
    console.log("requestReturnApproval - Status check failed");
    return res.status(400).json({
      message: "Only borrowed items can request return approval",
    });
  }

  borrowRequest.status = "return_pending";
  await borrowRequest.save();

  console.log("requestReturnApproval - Successfully updated to return_pending");

  res.status(200).json({
    message: "Return request submitted successfully",
    borrowRequest,
  });
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
