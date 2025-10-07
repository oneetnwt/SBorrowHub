import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import cloudinary from "../api/cloudinary.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";

export const signup = asyncHandler(async (req, res) => {
  const {
    studentId,
    firstname,
    lastname,
    email,
    phoneNumber,
    college,
    department,
    password,
    confirmpassword,
    profilePicture,
  } = req.body;

  if (
    !studentId ||
    !firstname ||
    !lastname ||
    !email ||
    !phoneNumber ||
    !college ||
    !department ||
    !password ||
    !confirmpassword
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password != confirmpassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must have at least 8 characters" });
  }

  if (studentId.trim().length < 10) {
    return res.status(400).json({ message: "Invalid Student ID" });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const numberRegex = /^(?:\+639|09)\d{9}$/;
  if (!numberRegex.test(phoneNumber)) {
    return res.status(400).json({ message: "Invalid phone numbers format" });
  }

  let uploadProfile;
  try {
    uploadProfile = await cloudinary.uploader.upload(profilePicture);
  } catch (cloudinaryError) {
    console.error("Cloudinary Error:", cloudinaryError);
    return res.status(500).json({ message: "Failed to upload profile image" });
  }

  const existingUser = await User.findOne({ studentId });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    studentId,
    firstname,
    lastname,
    email,
    phoneNumber,
    college,
    department,
    password: hashedPassword,
    profilePicture: uploadProfile.secure_url,
  });

  newUser.save();
  generateToken(newUser._id, res);
  const userResponse = newUser.toObject();
  delete userResponse.password;
  res.status(200).json({ message: "User created", userResponse });
});

export const signin = asyncHandler(async (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res
      .status(400)
      .json({ message: "Must have Student ID or Email and Password" });
  }

  const existingUser = await User.findOne({
    $or: [{ studentId: user }, { email: user }],
  });

  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!bcrypt.compare(password, existingUser.password)) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const userResponse = existingUser.toObject();
  delete userResponse.password;

  generateToken(existingUser._id, res);
  res.status(200).json({ message: "Logged in successfully", userResponse });
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
  res.status(200).json({ message: "Logged out successfully" });
});
