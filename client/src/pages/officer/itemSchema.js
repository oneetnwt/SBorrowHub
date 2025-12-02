import { z } from "zod";

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
});
