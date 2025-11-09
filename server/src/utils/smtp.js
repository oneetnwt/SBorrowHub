import nodemailer from "nodemailer";
import { config } from "dotenv";

config();

export const sendMail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: "SBorrowHub <noreply@sborrowhub.com>",
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    return false;
  }
};
