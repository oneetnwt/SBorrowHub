import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import { createUserSchema } from "../schema/userSchema.js";
import { appAssert } from "../errors/appAssert.js";

export const signup = asyncHandler(async (req, res) => {
	const body = createUserSchema.parse(req.body);

	const user = await User.findOne({ studentId }).exec();
	appAssert(!user, "User already exists", 400);

	// const hashPassword = /
});
