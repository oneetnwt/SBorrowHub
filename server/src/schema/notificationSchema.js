import z from "zod";

export const notificationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  code: z.string().min(1, "Notification code is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["In progress", "Action needed", "Completed"], {
    errorMap: () => ({ message: "Invalid status" }),
  }),
  type: z.enum(
    [
      "item_borrowed",
      "return_reminder",
      "item_available",
      "request_approved",
      "request_rejected",
    ],
    {
      errorMap: () => ({ message: "Invalid notification type" }),
    }
  ),
  relatedItemId: z.string().optional(),
  relatedRequestId: z.string().optional(),
});
