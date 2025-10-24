import express from "express";
import {
  sendEmail,
  sendBulkEmail,
  getQueueStats,
} from "../controllers/email.controller.js";
import apiKeyValidation from "../middlewares/apiKeyValidation.middleware.js";
import {
  perUserRateLimiter,
  bulkEmailRateLimiter,
} from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

// Send single email (with per-user rate limiting)
router.post("/send-email", apiKeyValidation, perUserRateLimiter, sendEmail);

// Send bulk emails (with stricter rate limiting)
router.post(
  "/send-bulk-email",
  apiKeyValidation,
  bulkEmailRateLimiter,
  sendBulkEmail
);

// Get queue statistics (with per-user rate limiting)
router.get("/queue-stats", apiKeyValidation, perUserRateLimiter, getQueueStats);

export default router;
