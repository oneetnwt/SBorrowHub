import z from "zod";
import { PASSWORD_LENGTH } from "../constant/index.js";

export const signupSchema = z.object({
  studentId: z
    .string()
    .length(10, "Student ID must exactly have 10 characters"),
  firstname: z.string().min(1, "Please provide a firstname"),
  lastname: z.string().min(1, "Please provide a lastname"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().regex(/^\d{11}$/, "Phone number must be 11 digits"),
  college: z.string(),
  department: z.string(),
  password: z
    .string()
    .min(PASSWORD_LENGTH, "Password must have at least 8 characters"),
  confirmpassword: z
    .string()
    .min(PASSWORD_LENGTH, "Password must have at least 8 characters"),
});

export const loginSchema = z.object({
  user: z.string(),
  password: z
    .string()
    .min(PASSWORD_LENGTH, "Password must have at least 8 characters"),
});

export const forgotPasswordSchema = z.object({
  password: z
    .string()
    .min(PASSWORD_LENGTH, "Password must have at least 8 characters"),
  confirmpassword: z
    .string()
    .min(PASSWORD_LENGTH, "Password must have at least 8 characters"),
});

export const updateProfileSchema = z.object({
  firstname: z.string().min(1, "Please provide a firstname").optional(),
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z
    .string()
    .regex(/^\d{11}$/, "Phone number must be 11 digits")
    .optional(),
  college: z.string().optional(),
  department: z.string().optional(),
  profilePicture: z.string().optional(),
});
