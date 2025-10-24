import { Queue } from "bullmq";
import { redisConnection } from "./redisConnection.js";
import envVars from "../config/envVars.js";

// Create email queue
export const emailQueue = new Queue(envVars.QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs
    },
  },
});

/**
 * Add email job to queue
 * @param {Object} emailData - Email data
 * @param {string} emailData.to - Recipient email
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.html - HTML content
 * @param {string} emailData.userId - User ID
 * @param {string} emailData.apiKeyId - API Key ID
 * @param {string} emailData.templateId - Template ID (optional)
 * @returns {Promise<Job>}
 */
export async function addEmailToQueue(emailData) {
  try {
    const job = await emailQueue.add("send-email", emailData, {
      jobId: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    return job;
  } catch (error) {
    console.error("Error adding email to queue:", error);
    throw error;
  }
}

/**
 * Get queue statistics
 * @returns {Promise<Object>}
 */
export async function getQueueStats() {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
    };
  } catch (error) {
    console.error("Error getting queue stats:", error);
    throw error;
  }
}

export default emailQueue;
