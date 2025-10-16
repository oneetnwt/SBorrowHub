import z from "zod";

export const createUserSchema = z
	.object({
		studentId: z
			.string()
			.length(10, "Student ID must exactly have 10 characters"),
		firstname: z.string().min(1, "Please provide a firstname"),
		lastname: z.string().min(1, "Please provide a lastname"),
		email: z.string().email("Invalid email address"),
		phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
		college: z.string(),
		department: z.string(),
		password: z
			.string()
			.min(PASSWORD_MIN_LENGTH, "Password must have at least 8 characters"),
		confirmpassword: z
			.string()
			.min(PASSWORD_MIN_LENGTH, "Password must have at least 8 characters"),
		profilePicture: z.string(),
	})
	.refine((data) => data.password === data.confirmpassword, {
		message: "Passwords do not match",
		path: ["confirmpassword"],
	});

export const signupSchema = z
.object({
	
});
