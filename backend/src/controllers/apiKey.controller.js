import ApiKey from "../models/apikey.model.js";

import { generateAPIKey } from "../utils/generateAPIKey.js";
import { isUserOwnerOfKey } from "../utils/checkIsUserOwner.js";

export const createApiKey = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { name } = req.body;
    // Generate a secure random API key
    const { rawKey, hashedKey } = await generateAPIKey();
    // Store the hashed API key in the database
    const newApiKey = new ApiKey({
      user: userId,
      name,
      key: hashedKey,
      isRevoked: false,
      lastUsedAt: new Date().now(),
      usageCount: 0,
    });
    await newApiKey.save();

    res.status(201).json({
      success: true,
      apiKey: rawKey,
      message: "API Key created successfully",
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    next(error);
  }
};

export const updateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;
    const { name, isRevoked } = req.body;
    const apiKey = await ApiKey.findById(id);
    const isOwner = isUserOwnerOfKey(userId, apiKey);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this API Key",
      });
    }
    const updatedApiKey = await ApiKey.findByIdAndUpdate(
      id,
      { name, isRevoked },
      { new: true }
    );
    if (!updatedApiKey) {
      return res
        .status(404)
        .json({ success: false, message: "API Key not found" });
    }
    res.status(200).json({
      success: true,
      data: updatedApiKey,
      message: "API Key updated successfully",
    });
  } catch (error) {
    console.error("Error updating API key:", error);
    next(error);
  }
};

export const deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;
    const apiKey = await ApiKey.findById(id);
    if (!apiKey) {
      return res
        .status(404)
        .json({ success: false, message: "API Key not found" });
    }
    const isOwner = isUserOwnerOfKey(userId, apiKey);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this API Key",
      });
    }
    await ApiKey.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "API Key deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting API key:", error);
    next(error);
  }
};

export const fetchAllApiKeys = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const apiKeys = await ApiKey.find({ user: userId });
    res.status(200).json({
      success: true,
      data: apiKeys,
      message: "API Keys fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    next(error);
  }
};

export const fetchApiKeyById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;
    const apiKey = await ApiKey.findById(id);
    if (!apiKey) {
      return res
        .status(404)
        .json({ success: false, message: "API Key not found" });
    }
    const isOwner = isUserOwnerOfKey(userId, apiKey);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this API Key",
      });
    }
    res.status(200).json({
      success: true,
      data: apiKey,
      message: "API Key fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching API key by ID:", error);
    next(error);
  }
};
