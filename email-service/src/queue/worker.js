import { Worker } from "bullmq";
import { redisConnection } from "./redisConnection.js";
import envVars from "../config/envVars.js";
import { sendEmailWithNodemailer } from "../services/email.service.js";
import Log from "../models/log.model.js";
import ApiKey from "../models/apikey.model.js";
import User from "../models/user.model.js";
import connectDB from "../config/dbConnect.js";

// Connect to database
await connectDB();

console.log(`🔄 Starting email worker...`);
console.log(`📦 Queue: ${envVars.QUEUE_NAME}`);
console.log(`🔗 Redis: ${envVars.REDIS_HOST}:${envVars.REDIS_PORT}`);
console.log(`⚡ Concurrency: ${envVars.QUEUE_CONCURRENCY}`);

// Create worker
const worker = new Worker(
  envVars.QUEUE_NAME,
  async (job) => {
    const { to, subject, html, userId, apiKeyId, templateId } = job.data;

    console.log(`📧 Processing email job ${job.id} for ${to}`);

    try {
      // Send email
      const result = await sendEmailWithNodemailer({
        to,
        subject,
        html,
      });

      // Update API key usage
      await ApiKey.findByIdAndUpdate(apiKeyId, {
        $inc: { usageCount: 1 },
        lastUsedAt: new Date(),
      });

      // Update user usage
      await User.findByIdAndUpdate(
        userId,
        {
          $inc: { "usage.$[elem].usedLimit": 1 },
        },
        {
          arrayFilters: [{ "elem.type": "email" }],
        }
      );

      // Log success
      await Log.create({
        user: userId,
        apiKey: apiKeyId,
        eventType: "email",
        status: "success",
        metadata: {
          to,
          subject,
          templateId,
          messageId: result.messageId,
        },
      });

      console.log(`✅ Email sent successfully to ${to}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);

      // Log failure
      await Log.create({
        user: userId,
        apiKey: apiKeyId,
        eventType: "email",
        status: "failure",
        metadata: {
          to,
          subject,
          templateId,
          error: error.message,
        },
      });

      throw error; // Re-throw to trigger retry
    }
  },
  {
    connection: redisConnection,
    concurrency: envVars.QUEUE_CONCURRENCY,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  }
);

// Worker event listeners
worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("❌ Worker error:", err);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("📴 SIGTERM received, closing worker...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("📴 SIGINT received, closing worker...");
  await worker.close();
  process.exit(0);
});

console.log("✅ Worker started successfully");
