import Redis from "ioredis";
import envVars from "../config/envVars.js";

// Create Redis connection for Upstash
export const redisConnection = new Redis(envVars.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  tls: {
    rejectUnauthorized: false,
  },
});

redisConnection.on("connect", () => {
  console.log("✅ Upstash Redis connected");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export default redisConnection;
