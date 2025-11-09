import z from "zod";

export const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().min(1, "Image URL is required"),
  quantity: z
    .number()
    .int()
    .nonnegative("Quantity must be a non-negative number"),
  available: z
    .number()
    .int()
    .nonnegative("Available must be a non-negative number"),
  status: z.enum(["available", "all_borrowed", "maintenance"]).optional(),
  tags: z.array(z.string()).optional(),
  condition: z.enum(["Good", "Fair", "Needs Repair"]).optional(),
  maxBorrowDays: z.number().int().positive().optional(),
});

export const updateItemSchema = z.object({
  name: z.string().min(1, "Item name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  image: z.string().min(1, "Image URL is required").optional(),
  quantity: z
    .number()
    .int()
    .nonnegative("Quantity must be a non-negative number")
    .optional(),
  available: z
    .number()
    .int()
    .nonnegative("Available must be a non-negative number")
    .optional(),
  status: z.enum(["available", "all_borrowed", "maintenance"]).optional(),
  tags: z.array(z.string()).optional(),
  condition: z.enum(["Good", "Fair", "Needs Repair"]).optional(),
  maxBorrowDays: z.number().int().positive().optional(),
});
