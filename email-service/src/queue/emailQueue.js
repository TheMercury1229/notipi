import { Queue } from "bullmq";
import { redisConnection } from "./redisConnection.js";
import envVars from "../config/envVars.js";

// Create the BullMQ Queue
export const emailQueue = new Queue(envVars.QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 1,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100, age: 24 * 3600 },
    removeOnFail: { count: 500 },
  },
});

/**
 * Add email job to queue (one unique job per email)
 * @param {Object} emailData
 */
export async function addEmailToQueue(emailData) {
  try {
    // Create a unique job ID for each specific request
    const uniqueJobId = `job-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const job = await emailQueue.add("send-email", emailData, {
      jobId: uniqueJobId, // ensures no duplicate execution
    });

    return job;
  } catch (error) {
    console.error("Error adding email to queue:", error);
    throw error;
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  } catch (error) {
    console.error("Error getting queue stats:", error);
    throw error;
  }
}

export default emailQueue;
