import z from "zod";

export const borrowRequestSchema = z.object({
  borrowerId: z.string().min(1, "Borrower ID is required"),
  itemId: z.string().min(1, "Item ID is required"),
  quantity: z.number().int().positive("Quantity must be a positive number"),
  borrowDate: z.string().min(1, "Borrow date is required"),
  returnDate: z.string().min(1, "Return date is required"),
  purpose: z.string().min(1, "Purpose is required"),
  notes: z.string().optional(),
});

export const updateBorrowRequestSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "borrowed", "returned"], {
    errorMap: () => ({ message: "Invalid status" }),
  }),
});
