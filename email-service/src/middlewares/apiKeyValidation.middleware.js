import ApiKey from "../models/apikey.model.js";
import bcrypt from "bcryptjs";
import { errorResponse } from "../utils/responseHandler.js";

export const apiKeyValidation = async (req, res, next) => {
  try {
    const providedKey = req.headers["x-api-key"];

    if (!providedKey) {
      return errorResponse(res, 401, "API key is required.");
    }

    // Get all keys and compare via bcrypt
    const allKeys = await ApiKey.find();
    let validKey = false;

    for (const keyDoc of allKeys) {
      const match = await bcrypt.compare(providedKey, keyDoc.hashedKey);
      if (match && !keyDoc.isRevoked) {
        validKey = true;
        break;
      }
    }

    if (!validKey) {
      return errorResponse(res, 401, "Invalid or revoked API key");
    }

    next();
  } catch (error) {
    console.error("API key validation error:", error);
    return errorResponse(res, 500, "API key validation failed");
  }
};
