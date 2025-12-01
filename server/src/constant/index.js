export const PASSWORD_LENGTH = 8;

// Activity log type mappings
export const ACTIVITY_TYPES = {
  USER: "user",
  BORROW: "borrow",
  CART: "cart",
  REVIEW: "review",
  SUPPORT: "support",
  FEEDBACK: "feedback",
  NOTIFICATION: "notification",
  ACTIVITY: "activity",
};

// Activity log action mappings
export const ACTIVITY_ACTIONS = [
  {
    match: (action) => action.includes("/auth/signup"),
    type: ACTIVITY_TYPES.USER,
    getText: () => "Registered an account",
  },
  {
    match: (action) => action.includes("/auth/login"),
    type: ACTIVITY_TYPES.USER,
    getText: () => "Logged in",
  },
  {
    match: (action, method) =>
      action.includes("/request-item") && method === "POST",
    type: ACTIVITY_TYPES.BORROW,
    getText: (item) =>
      item ? `Requested to borrow ${item}` : "Requested to borrow an item",
  },
  {
    match: (action, method) =>
      action.includes("/catalog/request-item") && method === "POST",
    type: ACTIVITY_TYPES.BORROW,
    getText: (item) =>
      item ? `Requested to borrow ${item}` : "Requested to borrow an item",
  },
  {
    match: (action, method) =>
      action.includes("/borrow-requests") && method === "POST",
    type: ACTIVITY_TYPES.BORROW,
    getText: (item) =>
      item ? `Requested to borrow ${item}` : "Requested to borrow an item",
  },
  {
    match: (action, method) => action.includes("/cart") && method === "POST",
    type: ACTIVITY_TYPES.CART,
    getText: (item) => (item ? `Added ${item} to cart` : "Added item to cart"),
  },
  {
    match: (action, method) => action.includes("/cart") && method === "DELETE",
    type: ACTIVITY_TYPES.CART,
    getText: (item) =>
      item ? `Removed ${item} from cart` : "Removed item from cart",
  },
  {
    match: (action, method) => action.includes("/profile") && method === "PUT",
    type: ACTIVITY_TYPES.USER,
    getText: () => "Updated profile information",
  },
  {
    match: (action, method) => action.includes("/password") && method === "PUT",
    type: ACTIVITY_TYPES.USER,
    getText: () => "Changed account password",
  },
  {
    match: (action, method) => action.includes("/review") && method === "POST",
    type: ACTIVITY_TYPES.REVIEW,
    getText: () => "Submitted a review",
  },
  {
    match: (action, method) => action.includes("/contact") && method === "POST",
    type: ACTIVITY_TYPES.SUPPORT,
    getText: () => "Sent a message to support",
  },
  {
    match: (action, method) =>
      action.includes("/feedback") && method === "POST",
    type: ACTIVITY_TYPES.FEEDBACK,
    getText: () => "Submitted feedback",
  },
  {
    match: (action, method) =>
      action.includes("/notification") &&
      action.includes("/read") &&
      method === "PATCH",
    type: ACTIVITY_TYPES.NOTIFICATION,
    getText: () => "Marked a notification as read",
  },
  {
    match: (action, method) =>
      action.includes("/notification") &&
      action.includes("mark-all-read") &&
      method === "PATCH",
    type: ACTIVITY_TYPES.NOTIFICATION,
    getText: () => "Marked all notifications as read",
  },
];

// Fallback activity actions by method
export const FALLBACK_ACTIONS = {
  POST: { type: ACTIVITY_TYPES.ACTIVITY, text: "Created something" },
  PUT: { type: ACTIVITY_TYPES.ACTIVITY, text: "Updated something" },
  PATCH: { type: ACTIVITY_TYPES.ACTIVITY, text: "Updated something" },
  DELETE: { type: ACTIVITY_TYPES.ACTIVITY, text: "Deleted something" },
};
