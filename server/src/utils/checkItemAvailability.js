import BorrowRequestModel from "../models/borrowRequest.js";
import ItemModel from "../models/item.js";

/**
 * Check how many items are available for a specific date range
 * @param {String} itemId - The item ID to check
 * @param {Date} startDate - The borrow/start date
 * @param {Date} endDate - The return/end date
 * @param {String} excludeRequestId - Optional request ID to exclude from calculation (for updates)
 * @returns {Object} { totalQuantity, available, overlappingRequests }
 */
export const checkItemAvailability = async (
  itemId,
  startDate,
  endDate,
  excludeRequestId = null
) => {
  // Get the item to know total quantity
  const item = await ItemModel.findById(itemId);
  if (!item) {
    throw new Error("Item not found");
  }

  // Find all requests that overlap with the requested date range
  // A request overlaps if:
  // - It's approved or borrowed (active statuses)
  // - Its date range intersects with the requested range
  const query = {
    itemId: itemId,
    status: { $in: ["approved", "borrowed"] },
    $or: [
      // Case 1: Existing request starts during our period
      {
        borrowDate: { $gte: startDate, $lt: endDate },
      },
      // Case 2: Existing request ends during our period
      {
        returnDate: { $gt: startDate, $lte: endDate },
      },
      // Case 3: Existing request spans our entire period
      {
        borrowDate: { $lte: startDate },
        returnDate: { $gte: endDate },
      },
    ],
  };

  // Exclude the current request if updating
  if (excludeRequestId) {
    query._id = { $ne: excludeRequestId };
  }

  const overlappingRequests = await BorrowRequestModel.find(query);

  // Calculate total quantity borrowed during this period
  const totalBorrowed = overlappingRequests.reduce(
    (sum, request) => sum + request.quantity,
    0
  );

  // Calculate available items
  const available = item.quantity - totalBorrowed;

  return {
    totalQuantity: item.quantity,
    available: Math.max(0, available),
    overlappingRequests: overlappingRequests.length,
    borrowedCount: totalBorrowed,
  };
};

/**
 * Update item's available count based on current active borrows
 * This should be called after any status change
 * @param {String} itemId - The item ID to update
 */
export const updateItemAvailableCount = async (itemId) => {
  const item = await ItemModel.findById(itemId);
  if (!item) {
    throw new Error("Item not found");
  }

  // Get all currently active borrows (approved or borrowed status)
  const activeRequests = await BorrowRequestModel.find({
    itemId: itemId,
    status: { $in: ["approved", "borrowed"] },
    returnDate: { $gte: new Date() }, // Only count non-expired requests
  });

  // Calculate total borrowed
  const totalBorrowed = activeRequests.reduce(
    (sum, request) => sum + request.quantity,
    0
  );

  // Update available count
  const available = Math.max(0, item.quantity - totalBorrowed);

  await ItemModel.findByIdAndUpdate(itemId, { available });

  // Update status based on availability
  let status = "available";
  if (available === 0) {
    status = "all_borrowed";
  } else if (item.condition === "Needs Repair") {
    status = "maintenance";
  }

  await ItemModel.findByIdAndUpdate(itemId, { status });

  return { available, status };
};
