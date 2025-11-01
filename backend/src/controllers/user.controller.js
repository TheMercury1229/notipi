import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import envVars from "../config/envVars.js";

// Clerk auth callback
export const authCallback = async (req, res) => {
  try {
    const { clerkId } = req.body;

    if (!clerkId) {
      return res.status(400).json({
        success: false,
        message: "Clerk ID is required",
      });
    }

    // Find or create user
    let user = await User.findOne({ clerkId });

    if (!user) {
      user = await User.create({
        clerkId,
        usage: [
          { type: "email", allowedLimit: 100, usedLimit: 0 },
          { type: "sms", allowedLimit: 50, usedLimit: 0 },
          { type: "push_notification", allowedLimit: 100, usedLimit: 0 },
        ],
      });
    }

    return res.status(200).json({
      success: true,
      message: "User authenticated",
      data: user,
    });
  } catch (error) {
    console.error("Auth callback error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

//Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // Add password verification logic here
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, envVars.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res
      .status(200)
      .json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    console.log("USER SIGNUP");
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      usage: [
        { type: "email", allowedLimit: 100, usedLimit: 0 },
        { type: "sms", allowedLimit: 50, usedLimit: 0 },
        { type: "push_notification", allowedLimit: 100, usedLimit: 0 },
      ],
    });
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: "Signup failed" });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("apiKeys")
      .populate("templates");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    });
  }
};

// Update user plan
export const updateUserPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { plan } = req.body;

    // Validate plan
    const validPlans = ["free", "pro", "enterprise"];
    if (!plan || !validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan. Must be one of: free, pro, enterprise",
      });
    }

    // Define usage limits for each plan
    const planLimits = {
      free: {
        email: 5000,
        sms: 0,
        push_notification: 100,
      },
      pro: {
        email: 100000,
        sms: 1000,
        push_notification: 10000,
      },
      enterprise: {
        email: -1, // unlimited
        sms: -1, // unlimited
        push_notification: -1, // unlimited
      },
    };

    // Get the user first to preserve usedLimit values
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update usage limits based on the new plan
    const updatedUsage = existingUser.usage.map((usageItem) => {
      const newLimit = planLimits[plan][usageItem.type];
      return {
        type: usageItem.type,
        allowedLimit: newLimit,
        usedLimit: usageItem.usedLimit, // Preserve current usage
      };
    });

    // Update user plan and usage limits
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        userPlan: plan,
        usage: updatedUsage
      },
      { new: true, runValidators: true }
    )
      .populate("apiKeys")
      .populate("templates");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update user plan error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user plan",
    });
  }
};
