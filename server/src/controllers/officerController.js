import asyncHandler from "express-async-handler";
import { appAssert } from "../errors/appAssert.js";
import BorrowRequestModel from "../models/borrowRequest.js";
import ItemModel from "../models/item.js";
import { createNotification } from "./notificationController.js";
import LogModel from "../models/log.js";
import UserModel from "../models/user.js";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TYPES,
  FALLBACK_ACTIONS,
} from "../constant/index.js";
import {
  checkItemAvailability,
  updateItemAvailableCount,
} from "../utils/checkItemAvailability.js";
import { broadcastActivity } from "../server.js";

export const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await BorrowRequestModel.find()
    .populate("borrowerId", "firstname lastname profilePicture email fullname")
    .populate("itemId", "name");

  appAssert(transactions.length > 0, "No transaction found", 400);

  res.status(200).json(transactions);
});

export const getAllItems = asyncHandler(async (req, res) => {
  const items = await ItemModel.find();

  appAssert(items.length > 0, "No items found", 400);

  res.status(200).json(items);
});

export const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  appAssert(status, "No status provided", 400);
  appAssert(id, "No id provided", 400);

  // Validate status
  const validStatuses = [
    "pending",
    "approved",
    "rejected",
    "borrowed",
    "return_pending",
    "returned",
  ];
  appAssert(validStatuses.includes(status), "Invalid status value", 400);

  // Find and update borrow request
  const borrowRequest = await BorrowRequestModel.findById(id)
    .populate("borrowerId", "firstname lastname email")
    .populate("itemId", "name");

  appAssert(borrowRequest, "Borrow request not found", 404);

  const previousStatus = borrowRequest.status;
  const itemId = borrowRequest.itemId._id;

  // If approving, check if items are available for the date range
  if (status === "approved" && previousStatus === "pending") {
    const availability = await checkItemAvailability(
      itemId,
      borrowRequest.borrowDate,
      borrowRequest.returnDate,
      borrowRequest._id
    );

    appAssert(
      availability.available >= borrowRequest.quantity,
      `Cannot approve: Only ${availability.available} item(s) available for the selected dates. ${availability.borrowedCount} already borrowed during this period.`,
      400
    );
  }

  // Update request status
  borrowRequest.status = status;
  await borrowRequest.save();

  // Update item availability based on status changes
  if (
    status === "approved" ||
    status === "borrowed" ||
    status === "returned" ||
    status === "rejected"
  ) {
    await updateItemAvailableCount(itemId);
  }

  // Create notification for borrower
  const notificationTitles = {
    approved: "Request Approved",
    rejected: "Request Rejected",
    borrowed: "Item Borrowed",
    returned: "Item Returned",
  };

  const notificationDescriptions = {
    approved: `Your request for ${borrowRequest.itemId.name} has been approved`,
    rejected: `Your request for ${borrowRequest.itemId.name} has been rejected`,
    borrowed: `You have borrowed ${borrowRequest.itemId.name}`,
    returned: `You have returned ${borrowRequest.itemId.name}`,
  };

  const notificationStatuses = {
    approved: "Action needed",
    rejected: "Completed",
    borrowed: "In progress",
    returned: "Completed",
  };

  await createNotification({
    userId: borrowRequest.borrowerId._id,
    title: notificationTitles[status] || "Request Updated",
    description:
      notificationDescriptions[status] ||
      `Your request status has been updated to ${status}`,
    status: notificationStatuses[status] || "In progress",
    relatedItemId: borrowRequest.itemId._id,
    relatedRequestId: borrowRequest._id,
  });

  // Broadcast request status update to all officers via WebSocket
  if (status === "approved" || status === "rejected") {
    broadcastActivity({
      type: "requestStatusUpdate",
      data: {
        requestId: borrowRequest._id,
        status: status,
        itemName: borrowRequest.itemId.name,
        userName: `${borrowRequest.borrowerId.firstname} ${borrowRequest.borrowerId.lastname}`,
      },
    });
  }

  res.status(200).json({
    message: "Request status updated successfully",
    borrowRequest,
  });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get counts
  const totalUsers = await UserModel.countDocuments({ role: "user" });
  const totalItems = await ItemModel.countDocuments();
  const pendingRequests = await BorrowRequestModel.countDocuments({
    status: "pending",
  });
  const activeLoans = await BorrowRequestModel.countDocuments({
    status: "borrowed",
  });
  const overdueItems = await BorrowRequestModel.countDocuments({
    status: "borrowed",
    dueDate: { $lt: new Date() },
  });

  // Monthly borrows (current month)
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );
  const monthlyBorrows = await BorrowRequestModel.countDocuments({
    createdAt: { $gte: startOfMonth },
    status: { $in: ["approved", "borrowed", "returned"] },
  });

  res.status(200).json({
    totalUsers,
    totalItems,
    pendingRequests,
    activeLoans,
    overdueItems,
    monthlyBorrows,
  });
});

export const getPendingRequests = asyncHandler(async (req, res) => {
  const pendingRequests = await BorrowRequestModel.find({ status: "pending" })
    .populate("borrowerId", "firstname lastname email profilePicture")
    .populate("itemId", "name images")
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json(pendingRequests);
});

// TODO: Get overdue loans
export const getOverdue = asyncHandler(async (req, res) => {
  const overdueLoans = await BorrowRequestModel.find({
    status: "borrowed",
    dueDate: { $lt: new Date() },
  })
    .populate("borrowerId", "firstname lastname email profilePicture")
    .populate("itemId", "name")
    .sort({ dueDate: 1 })
    .limit(10);

  // Calculate days overdue
  const loansWithOverdue = overdueLoans.map((loan) => {
    const daysOverdue = Math.floor(
      (new Date() - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24)
    );
    return {
      ...loan.toObject(),
      daysOverdue,
    };
  });

  res.status(200).json(loansWithOverdue, overdueLoans);
});

// Get recent activity from logs (user activities only)
export const getRecentActivity = asyncHandler(async (req, res) => {
  const logs = await LogModel.find().sort({ timestamp: -1 });

  const userActivities = [];

  for (const log of logs) {
    // Skip if already have enough activities
    if (userActivities.length >= 20) break;

    let userName = "User";
    let type = "user";
    let item = "";
    let action = "";
    let isSignup = log.action.includes("/auth/signup");

    // Handle signup specially (user doesn't exist yet when log is created)
    if (isSignup && log.details) {
      try {
        const details = JSON.parse(log.details);
        if (details.firstname && details.lastname) {
          userName = `${details.firstname} ${details.lastname}`;
        } else {
          continue; // Skip if names are missing
        }
        // Signup is always from a regular user
      } catch (err) {
        continue;
      }
    } else {
      // Skip anonymous users for non-signup activities
      if (!log.userId || log.userId === "anonymous") continue;

      // Try to get user info
      try {
        const user = await UserModel.findById(log.userId).select(
          "firstname lastname role"
        );
        if (!user) continue;

        if (user.firstname && user.lastname) {
          userName = `${user.firstname} ${user.lastname}`;
        } else {
          continue; // Skip if names are missing
        }

        // Only process users with role "user"
        if (user.role !== "user") continue;
      } catch (err) {
        continue;
      }
    }

    // Determine action based on log - display all activities
    const method = log.action.split(" ")[0];

    // Try to extract item info from log details
    try {
      if (log.details) {
        const details = JSON.parse(log.details);
        if (details.itemId) {
          const itemData = await ItemModel.findById(details.itemId).select(
            "name"
          );
          if (itemData) {
            item = itemData.name;
          }
        }
      }
    } catch (err) {
      // Continue without item name if parsing fails
    }

    // Match action with predefined patterns
    const matchedAction = ACTIVITY_ACTIONS.find((a) =>
      a.match(log.action, method)
    );

    if (matchedAction) {
      type = matchedAction.type;
      action = matchedAction.getText(item);
    } else {
      // Use fallback actions based on HTTP method
      const fallback = FALLBACK_ACTIONS[method];
      if (fallback) {
        type = fallback.type;
        action = fallback.text;
      } else {
        // For any other activity
        type = ACTIVITY_TYPES.ACTIVITY;
        action = log.action;
      }
    }

    // Add significant user activities only
    userActivities.push({
      _id: log._id,
      action,
      userName,
      item,
      timestamp: log.timestamp,
      type,
    });
  }

  console.log(`Returning ${userActivities.length} user activities`);
  res.status(200).json(userActivities);
});

// TODO: Get low stock items
export const getLowStockItems = asyncHandler(async (req, res) => {
  // Assuming items have quantity and minimumStock fields
  const lowStockItems = await ItemModel.find({
    $expr: { $lte: ["$quantity", "$minimumStock"] },
  })
    .sort({ quantity: 1 })
    .limit(10);

  const itemsWithStatus = lowStockItems.map((item) => ({
    _id: item._id,
    name: item.name,
    current: item.quantity || 0,
    minimum: item.minimumStock || 5,
    status:
      item.quantity === 0
        ? "critical"
        : item.quantity <= 2
        ? "critical"
        : "low",
  }));

  res.status(200).json(itemsWithStatus);
});

// Send overdue notification email
export const sendOverdueNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const borrowRequest = await BorrowRequestModel.findById(id)
    .populate("borrowerId", "firstname lastname email")
    .populate("itemId", "name");

  appAssert(borrowRequest, "Borrow request not found", 404);
  appAssert(borrowRequest.borrowerId, "Borrower information not found", 404);

  // Send email notification
  const emailSubject = "Overdue Item Reminder - SBorrowHub";
  const emailBody = `
    <h2>Overdue Item Reminder</h2>
    <p>Dear ${borrowRequest.borrowerId.firstname} ${
    borrowRequest.borrowerId.lastname
  },</p>
    <p>This is a reminder that the following item is overdue:</p>
    <ul>
      <li><strong>Item:</strong> ${borrowRequest.itemId.name}</li>
      <li><strong>Quantity:</strong> ${borrowRequest.quantity}</li>
      <li><strong>Due Date:</strong> ${new Date(
        borrowRequest.returnDate
      ).toLocaleDateString()}</li>
    </ul>
    <p>Please return the item as soon as possible to avoid any penalties.</p>
    <p>If you have already returned the item, please request return approval in your account.</p>
    <br>
    <p>Best regards,</p>
    <p>SBorrowHub Team</p>
  `;

  try {
    const { sendEmail } = await import("../utils/smtp.js");
    await sendEmail(borrowRequest.borrowerId.email, emailSubject, emailBody);

    // Create notification
    await createNotification({
      userId: borrowRequest.borrowerId._id,
      title: "Overdue Item Reminder",
      description: `Your borrowed item "${borrowRequest.itemId.name}" is overdue. Please return it as soon as possible.`,
      status: "Action needed",
      relatedItemId: borrowRequest.itemId._id,
      relatedRequestId: borrowRequest._id,
    });

    res.status(200).json({ message: "Overdue notification sent successfully" });
  } catch (error) {
    console.error("Error sending overdue notification:", error);
    res.status(500).json({ message: "Failed to send notification email" });
  }
});

// Get return pending requests (items user wants to return, waiting for officer approval)
export const getReturnPendingRequests = asyncHandler(async (req, res) => {
  const returnPending = await BorrowRequestModel.find({
    status: "return_pending",
  })
    .populate("borrowerId", "firstname lastname email profilePicture")
    .populate("itemId", "name images")
    .sort({ updatedAt: -1 })
    .limit(10);

  res.status(200).json(returnPending);
});

// Approve return (mark as returned)
export const approveReturn = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const borrowRequest = await BorrowRequestModel.findById(id)
    .populate("borrowerId", "firstname lastname email")
    .populate("itemId", "name");

  appAssert(borrowRequest, "Borrow request not found", 404);
  appAssert(
    borrowRequest.status === "return_pending",
    "Only return_pending requests can be approved for return",
    400
  );

  // Update status to returned and set return date
  borrowRequest.status = "returned";
  borrowRequest.actualReturnDate = new Date();
  await borrowRequest.save();

  // Increase item available count
  await updateItemAvailableCount(
    borrowRequest.itemId._id,
    borrowRequest.quantity,
    "increase"
  );

  // Create notification for user
  await createNotification({
    userId: borrowRequest.borrowerId._id,
    title: "Item Return Confirmed",
    description: `Your return of "${borrowRequest.itemId.name}" has been verified and confirmed.`,
    status: "Completed",
    relatedItemId: borrowRequest.itemId._id,
    relatedRequestId: borrowRequest._id,
  });

  // Broadcast activity
  broadcastActivity({
    type: "return",
    userName: `${borrowRequest.borrowerId.firstname} ${borrowRequest.borrowerId.lastname}`,
    action: "returned",
    item: borrowRequest.itemId.name,
    timestamp: new Date(),
  });

  res.status(200).json({
    message: "Return approved successfully",
    borrowRequest,
  });
});
