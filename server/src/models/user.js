import mongoose from "mongoose";

const userSchema = mongoose.Schema(
	{
		studentId: {
			type: String,
			required: true,
		},
		firstname: {
			type: String,
			required: true,
		},
		lastname: {
			type: String,
			required: true,
		},
		email: {
			type: String,
		},
		phoneNumber: {
			type: String,
			required: true,
		},
		college: {
			type: String,
			required: true,
		},
		department: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		profilePicture: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
