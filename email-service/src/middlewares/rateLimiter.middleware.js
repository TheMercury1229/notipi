import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import envVars from "../config/envVars.js";
import redisConnection from "../queue/redisConnection.js";

/**
 * General API rate limiter
 * Limits all requests to the API
 */
export const apiRateLimiter = rateLimit({
  windowMs: envVars.RATE_LIMIT_WINDOW_MS, // 1 minute default
  max: envVars.RATE_LIMIT_MAX_REQUESTS, // 100 requests per window
  message: {
    success: false,
    message: "Too many requests, please try again later.",
    retryAfter: Math.ceil(envVars.RATE_LIMIT_WINDOW_MS / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // Use sendCommand wrapper for ioredis compatibility
    sendCommand: (...args) => redisConnection.call(...args),
    prefix: "rl:api:",
  }),
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === "/health";
  },
});

/**
 * Per-user rate limiter
 * Limits requests per authenticated user
 */
export const perUserRateLimiter = rateLimit({
  windowMs: envVars.RATE_LIMIT_WINDOW_MS,
  max: envVars.RATE_LIMIT_PER_USER_MAX, // 50 requests per user per window
  message: {
    success: false,
    message: "You have exceeded the rate limit. Please try again later.",
    retryAfter: Math.ceil(envVars.RATE_LIMIT_WINDOW_MS / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisConnection.call(...args),
    prefix: "rl:user:",
  }),
  keyGenerator: (req) => {
    // Use userId from auth middleware
    return req.auth?.userId?.toString() || req.ip;
  },
});

/**
 * Bulk email rate limiter
 * Stricter limits for bulk operations
 */
export const bulkEmailRateLimiter = rateLimit({
  windowMs: envVars.RATE_LIMIT_WINDOW_MS,
  max: envVars.RATE_LIMIT_BULK_EMAIL_MAX, // 20 bulk requests per window
  message: {
    success: false,
    message:
      "You have exceeded the bulk email rate limit. Please try again later.",
    retryAfter: Math.ceil(envVars.RATE_LIMIT_WINDOW_MS / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisConnection.call(...args),
    prefix: "rl:bulk:",
  }),
  keyGenerator: (req) => {
    return req.auth?.userId?.toString() || req.ip;
  },
});

/**
 * Custom rate limiter for specific endpoints
 */
export function createCustomRateLimiter(max, windowMs, prefix) {
  return rateLimit({
    windowMs: windowMs || envVars.RATE_LIMIT_WINDOW_MS,
    max: max || 10,
    message: {
      success: false,
      message: "Rate limit exceeded for this endpoint.",
      retryAfter: Math.ceil((windowMs || envVars.RATE_LIMIT_WINDOW_MS) / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redisConnection.call(...args),
      prefix: `rl:${prefix}:`,
    }),
    keyGenerator: (req) => {
      return req.auth?.userId?.toString() || req.ip;
    },
  });
}

export default {
  apiRateLimiter,
  perUserRateLimiter,
  bulkEmailRateLimiter,
  createCustomRateLimiter,
};
