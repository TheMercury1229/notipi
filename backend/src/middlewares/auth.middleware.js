import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const checkAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("Token from cookies:", token);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized / No token" });
    }
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
