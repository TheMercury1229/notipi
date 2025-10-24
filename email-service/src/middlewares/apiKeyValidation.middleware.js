import ApiKey from "../models/apikey.model.js";
import bcrypt from "bcryptjs";

export default async function apiKeyValidation(req, res, next) {
  try {
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API key is missing. Please provide x-api-key header",
      });
    }

    // API key format: notipi_live_xxxxxxxxxxxxx or notipi_test_xxxxxxxxxxxxx
    const parts = apiKey.split("_");
    if (parts.length !== 3 || parts[0] !== "notipi") {
      return res.status(401).json({
        success: false,
        message: "Invalid API key format",
      });
    }

    const keySecret = parts[2];

    // Find all non-revoked API keys
    const apiKeys = await ApiKey.find({ isRevoked: false });

    let matchedKey = null;
    for (const key of apiKeys) {
      const isMatch = await bcrypt.compare(keySecret, key.hashedKey);
      if (isMatch) {
        matchedKey = key;
        break;
      }
    }

    if (!matchedKey) {
      return res.status(403).json({
        success: false,
        message: "Invalid or revoked API key",
      });
    }

    // Attach user and API key info to request
    req.auth = {
      apiKeyId: matchedKey._id,
      userId: matchedKey.user,
    };

    next();
  } catch (error) {
    console.error("API key validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
