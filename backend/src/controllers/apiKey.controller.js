import ApiKey from "../models/apikey.model.js";
import User from "../models/user.model.js";
import { generateAPIKey } from "../utils/generateAPIKey.js";
import { isUserOwnerOfKey } from "../utils/checkIsUserOwner.js";

// Create new API key
export const createApiKey = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    console.log("📝 Creating API key with name:", name); // Debug log

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "API key name is required",
      });
    }

    // Generate API key
    const { rawKey, hashedKey } = await generateAPIKey();

    console.log("🔑 Generated raw key:", rawKey); // Debug log
    console.log("🔐 Generated hashed key:", hashedKey); // Debug log

    // Create API key in database
    const apiKey = await ApiKey.create({
      name,
      hashedKey,
      user: userId,
    });

    console.log("💾 Saved to DB:", apiKey); // Debug log

    // Add to user's apiKeys array
    await User.findByIdAndUpdate(userId, {
      $push: { apiKeys: apiKey._id },
    });

    const responseData = {
      _id: apiKey._id,
      name: apiKey.name,
      key: rawKey, // THIS IS CRITICAL
      user: apiKey.user,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };

    console.log("📤 Sending response:", responseData); // Debug log

    return res.status(201).json({
      success: true,
      message: "API key created successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Create API key error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create API key",
      error: error.message,
    });
  }
};

// Fetch all API keys for a user
export const fetchAllApiKeys = async (req, res) => {
  try {
    const userId = req.user._id;

    const apiKeys = await ApiKey.find({ user: userId }).select(
      "-hashedKey -__v"
    );

    return res.status(200).json({
      success: true,
      data: apiKeys,
    });
  } catch (error) {
    console.error("Fetch API keys error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch API keys",
    });
  }
};

// Fetch single API key by ID
export const fetchApiKeyById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const apiKey = await ApiKey.findById(id).select("-hashedKey");

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    // Check ownership
    if (!isUserOwnerOfKey(userId.toString(), apiKey)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    console.error("Fetch API key error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch API key",
    });
  }
};

// Update API key
export const updateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    const apiKey = await ApiKey.findById(id);

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    // Check ownership
    if (!isUserOwnerOfKey(userId.toString(), apiKey)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Update name
    apiKey.name = name || apiKey.name;
    await apiKey.save();

    return res.status(200).json({
      success: true,
      message: "API key updated successfully",
      data: {
        _id: apiKey._id,
        name: apiKey.name,
        user: apiKey.user,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    console.error("Update API key error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update API key",
    });
  }
};

// Delete API key
export const deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const apiKey = await ApiKey.findById(id);

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    // Check ownership
    if (!isUserOwnerOfKey(userId.toString(), apiKey)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Remove from user's apiKeys array
    await User.findByIdAndUpdate(userId, {
      $pull: { apiKeys: apiKey._id },
    });

    // Delete the API key
    await ApiKey.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "API key deleted successfully",
    });
  } catch (error) {
    console.error("Delete API key error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete API key",
    });
  }
};
