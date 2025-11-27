import { OAuth2Client } from "google-auth-library";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import axios from "axios";

import {
  forgotPasswordSchema,
  loginSchema,
  signupSchema,
  updateProfileSchema,
} from "../schema/userSchema.js";
import { appAssert } from "../errors/appAssert.js";
import UserModel from "../models/user.js";
import { generateToken } from "../utils/jwt.js";
import { sendMail } from "../utils/smtp.js";
import cloudinary from "../api/cloudinary.js";

/**
 * @route POST /auth/signup
 */
export const signup = asyncHandler(async (req, res) => {
  const body = signupSchema.parse(req.body);

  appAssert(
    body.password === body.confirmpassword,
    "Password do not match",
    400
  );

  const user = await UserModel.findOne({
    $or: [{ studentId: body.studentId }, { email: body.email }],
  }).exec();
  appAssert(!user, "User already exists", 409);

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(body.password, salt);

  let profilePicture;
  if (!body.profilePicture) {
    profilePicture = `https://placehold.co/400x400/be8443/FFFFFF?text=${body.firstname[0]}+${body.lastname[0]}`;
  } else {
    profilePicture = body.profilePicture;
  }

  const newUser = new UserModel({
    studentId: body.studentId,
    firstname: body.firstname,
    lastname: body.lastname,
    email: body.email,
    phoneNumber: body.phoneNumber,
    college: body.college,
    department: body.department,
    profilePicture: profilePicture,
    password: hash,
  });

  await newUser.save();

  generateToken(newUser._id, res);

  res.status(201).json({
    message: "User created",
    user: newUser.omitPassword(),
  });
});

/**
 * @route POST /auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);

  const user = await UserModel.findOne({
    $or: [{ studentId: body.user }, { email: body.user }],
  });
  appAssert(user, "User not found", 404);

  const isMatch = await bcrypt.compare(body.password, user.password);
  appAssert(isMatch, "Invalid Credentials", 401);

  user.lastLoginAt = new Date();
  user.isOnline = true;
  await user.save();

  generateToken(user._id, res);
  res.status(200).json({
    message: "User logged in successfully",
    user: user.omitPassword(),
  });
});

/**
 * @route POST /auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  // Update user online status if authenticated
  if (req.user?._id) {
    await UserModel.findByIdAndUpdate(req.user._id, { isOnline: false });
  }

  res.clearCookie("jwt");
  res.status(200).json({ message: "Logout successful" });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const body = updateProfileSchema.parse(req.body);

  const user = await UserModel.findById(req.user._id);
  appAssert(user, "User not found", 404);

  // Update profile fields if provided
  if (body.firstname) user.firstname = body.firstname;
  if (body.lastname) user.lastname = body.lastname;
  if (body.email) {
    // Check if email is already taken by another user
    const existingUser = await UserModel.findOne({
      email: body.email,
      _id: { $ne: user._id },
    });
    appAssert(!existingUser, "Email already in use", 409);
    user.email = body.email;
  }
  if (body.phoneNumber) user.phoneNumber = body.phoneNumber;
  if (body.college) user.college = body.college;
  if (body.department) user.department = body.department;

  // Handle profile picture
  if (body.profilePicture) {
    try {
      const uploadResponse = await cloudinary.uploader.upload(
        body.profilePicture,
        {
          folder: "profile_pictures",
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
          ],
        }
      );
      user.profilePicture = uploadResponse.secure_url;
    } catch (cloudinaryError) {
      console.error("Cloudinary Error:", cloudinaryError);
      return res
        .status(500)
        .json({ message: "Failed to upload profile image" });
    }
  } else if (body.firstname && body.lastname) {
    // Generate new placeholder if names are updated
    user.profilePicture = `https://placehold.co/400x400?text=${body.firstname[0]}+${body.lastname[0]}`;
  }

  await user.save();

  res.status(200).json({
    message: "Profile updated successfully",
    user: user.omitPassword(),
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const email = req.body.email;

  appAssert(email, "Must enter an Email", 400);

  const user = await UserModel.findOne({ email });

  appAssert(user, "User not found", 404);

  const otp = Math.floor(100000 + Math.random() * 900000); // 100000–999999

  const subject = `Reset Your Password – SBorrowHub`;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #fbfaf8;
        }
        .email-container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(190, 132, 67, 0.15);
        }
        .email-header {
          background: linear-gradient(135deg, #be8443 0%, #e89e4a 100%);
          padding: 40px 20px;
          text-align: center;
          border-bottom: 4px solid #8b5f2f;
        }
        .logo {
          font-size: 36px;
          font-weight: bold;
          color: #ffffff;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }
        .email-body {
          padding: 40px 30px;
          background-color: #fbfaf8;
        }
        .greeting {
          font-size: 26px;
          font-weight: 600;
          color: #12100c;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          line-height: 1.7;
          color: #707062;
          margin-bottom: 30px;
        }
        .otp-container {
          text-align: center;
          margin: 30px 0;
          padding: 35px;
          background: linear-gradient(135deg, #f0d4b5 0%, #e6be90 100%);
          border-radius: 12px;
          border: 3px solid #be8443;
          box-shadow: 0 4px 8px rgba(190, 132, 67, 0.2);
        }
        .otp-label {
          font-size: 13px;
          color: #8b5f2f;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 600;
        }
        .otp-code {
          font-size: 52px;
          font-weight: bold;
          color: #be8443;
          letter-spacing: 10px;
          font-family: 'Courier New', monospace;
          margin: 15px 0;
          text-shadow: 1px 1px 2px rgba(139, 95, 47, 0.3);
        }
        .divider {
          border-top: 2px solid #e6be90;
          margin: 30px 0;
        }
        .warning {
          background-color: #fff8e8;
          border-left: 5px solid #e89e4a;
          padding: 18px;
          margin: 25px 0;
          font-size: 14px;
          color: #8b5f2f;
          border-radius: 6px;
        }
        .email-footer {
          background-color: #f5f3f0;
          padding: 30px;
          text-align: center;
          font-size: 13px;
          color: #9d9490;
          border-top: 2px solid #e6be90;
        }
        .footer-text {
          margin: 8px 0;
        }
        .expiry-time {
          font-weight: 700;
          color: #e89e4a;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1 class="logo">SBorrowHub</h1>
        </div>
        
        <div class="email-body">
          <h2 class="greeting">Hello, ${user.firstname}!</h2>
          
          <p class="message">
            We received a request to reset your password for your SBorrowHub account. 
            Use the verification code below to reset your password:
          </p>
          
          <div class="otp-container">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-code">${otp}</div>
          </div>
          
          <div class="warning">
            ⚠️ This code will expire in <span class="expiry-time">10 minutes</span>. 
            If you don't reset your password within this time, you'll need to request a new code.
          </div>
          
          <div class="divider"></div>
          
          <p class="message">
            If you didn't request a password reset, please ignore this email or contact support 
            if you have concerns about your account security.
          </p>
        </div>
        
        <div class="email-footer">
          <p class="footer-text">© ${new Date().getFullYear()} SBorrowHub. All rights reserved.</p>
          <p class="footer-text">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailSent = await sendMail(email, subject, html);

  appAssert(emailSent, "Failed to send email. Please try again later.", 500);

  res.cookie("otp", otp.toString(), {
    maxAge: 10 * 60 * 1000, // 10 minutes in milliseconds
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.cookie("resetUserId", user._id.toString(), {
    maxAge: 10 * 60 * 1000, // 10 minutes in milliseconds (same as OTP)
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({ message: "Email sent successfully" });
});

export const verifyCode = asyncHandler(async (req, res) => {
  const otp = req.body.otp;

  appAssert(otp, "OTP is required", 400);
  appAssert(req.cookies.otp, "OTP expired or not found", 410);

  const isMatch = otp.toString() === req.cookies.otp;
  appAssert(isMatch, "Invalid Code", 401);

  res.clearCookie("otp");

  res.status(200).json({ message: "Code Verified" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const body = forgotPasswordSchema.parse(req.body);

  appAssert(
    body.password === body.confirmpassword,
    "Passwords do not match",
    400
  );

  appAssert(
    req.cookies.resetUserId,
    "Session expired. Please request a new code",
    410
  );

  const user = await UserModel.findById(req.cookies.resetUserId);
  appAssert(user, "User not found", 404);

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(body.password, salt);

  user.password = hashed;
  await user.save();

  res.clearCookie("otp");
  res.clearCookie("resetUserId");

  res.status(200).json({ message: "Password reset successfully" });
});

export const checkOtp = asyncHandler(async (req, res) => {
  appAssert(req.cookies.otp, "No OTP session found", 404);
  res.status(200).json({ exists: true });
});

export const checkResetSession = asyncHandler(async (req, res) => {
  appAssert(req.cookies.resetUserId, "No reset session found", 404);
  res.status(200).json({ exists: true });
});

export const checkAuth = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

export const verifyCaptcha = asyncHandler(async (req, res) => {
  const { token } = req.body;

  appAssert(token, "Missing CAPTCHA token", 400);

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  const isRecaptchaValid = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
  );

  appAssert(isRecaptchaValid, "Invalid recaptcha token", 400);

  res.status(200).json({ success: true });
});

export const checkRole = asyncHandler(async (req, res) => {
  res.status(200).json(req.user.role);
});
