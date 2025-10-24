import User from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
  try {
    const { id } = req.body;
    // check if user exits
    const user = await User.findOne({ clerkId: id });
    // signup
    if (!user) {
      await User.create({
        clerkId: id,
        apiKeys: [],
        usage: [
          { type: "email", allowedLimit: 100, usedLimit: 0 },
          { type: "sms", allowedLimit: 100, usedLimit: 0 },
          { type: "push_notification", allowedLimit: 100, usedLimit: 0 },
        ],
        templates: [],
      });
    }
    res.status(200).json({ success: true, message: "Signed Up successfully" });
  } catch (error) {
    console.log("Error in auth callback", error);
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const user = await User.findById({ clerkId: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      data: user,
      message: "User profile fetched successfully",
    });
  } catch (error) {
    console.log("Error in getting user profile", error);
    next(error);
  }
};
