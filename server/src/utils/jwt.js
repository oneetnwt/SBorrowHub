import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const jwtToken = process.env.JWT_SECRET || "secret-token";
  const token = jwt.sign({ userId }, jwtToken, { expiresIn: "30d" });

  res.cookie("jwt", token, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};
