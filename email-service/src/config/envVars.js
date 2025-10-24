import dotenv from "dotenv";
dotenv.config();

const envVars = {
  // Server
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || "development",

  // MongoDB
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/emailservice",

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  REDIS_URL: process.env.REDIS_URL,

  // SMTP
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || "NotiPi",
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,

  // Queue
  QUEUE_NAME: process.env.QUEUE_NAME || "email-queue",
  QUEUE_CONCURRENCY: parseInt(process.env.QUEUE_CONCURRENCY) || 5,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  RATE_LIMIT_PER_USER_MAX: parseInt(process.env.RATE_LIMIT_PER_USER_MAX) || 50,
  RATE_LIMIT_BULK_EMAIL_MAX:
    parseInt(process.env.RATE_LIMIT_BULK_EMAIL_MAX) || 20,
};

// Validate required environment variables
const requiredEnvVars = ["MONGO_URI", "SMTP_USER", "SMTP_PASS", "REDIS_URL"];
for (const envVar of requiredEnvVars) {
  if (!envVars[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
  }
}

Object.freeze(envVars);
export default envVars;
