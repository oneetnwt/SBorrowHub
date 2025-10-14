import { Schema, model } from "mongoose";

const userSchema = Schema({
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
	},
	college: {
		type: String,
	},
	department: {
		type: String,
	},
	password: {
		type: String,
		minlength: 8,
	},
	profilePicture: {
		type: String,
		default: "",
	},
});

const User = model("User", userSchema);

export default User;
