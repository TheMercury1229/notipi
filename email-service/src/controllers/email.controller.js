import Template from "../models/template.model.js";
import User from "../models/user.model.js";
import { addEmailToQueue } from "../queue/emailQueue.js";
import {
  renderTemplate,
  isValidEmail,
  validateEmails,
} from "../utils/templateRenderer.js";

/**
 * Helper: get auth identity dynamically
 */
const getAuthInfo = (req) => {
  // If it’s from Clerk-authenticated request
  if (req.auth && (req.auth.userId || req.auth.apiKeyId)) {
    return { userId: req.auth.userId, apiKeyId: req.auth.apiKeyId || null };
  }

  // If it’s an API-key-based request (validated by middleware)
  if (req.headers["x-api-key"]) {
    return { userId: "api_key_user", apiKeyId: "via_api_key" };
  }

  // Fallback if both missing
  return { userId: null, apiKeyId: null };
};

/**
 * Send single email
 * POST /api/send-email
 * Body: { to, subject, templateId OR templateSlug, data }
 */
export const sendEmail = async (req, res) => {
  try {
    const { to, subject, templateId, templateSlug, data } = req.body;
    const { userId, apiKeyId } = getAuthInfo(req);

    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: to, subject",
      });
    }

    if (!isValidEmail(to)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Skip user validation if request came from API key
    let user = null;
    if (userId !== "api_key_user") {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const emailUsage = user.usage.find((u) => u.type === "email");
      if (emailUsage && emailUsage.usedLimit >= emailUsage.allowedLimit) {
        return res.status(429).json({
          success: false,
          message: "Email usage limit exceeded",
          usage: {
            used: emailUsage.usedLimit,
            allowed: emailUsage.allowedLimit,
          },
        });
      }
    }

    let html = "";

    // Load template using ID or Slug
    let template = null;
    if (templateId) {
      template = await Template.findById(templateId);
    } else if (templateSlug) {
      template = await Template.findOne({ slug: templateSlug });
    }

    if (template) {
      // Check access (only for user-based requests)
      if (
        userId !== "api_key_user" &&
        template.owner.toString() !== userId.toString() &&
        !template.isPublic
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have access to this template",
        });
      }
      html = renderTemplate(template.content, data || {});
    } else {
      // Use raw HTML as fallback
      html = data?.html || data?.content || "";
      if (!html) {
        return res.status(400).json({
          success: false,
          message:
            "Either templateId/templateSlug or raw html/content required",
        });
      }
    }

    const job = await addEmailToQueue({
      to,
      subject,
      html,
      userId,
      apiKeyId,
      templateId: template?._id || null,
    });

    return res.status(200).json({
      success: true,
      message: "Email queued successfully",
      data: { jobId: job.id, to, subject },
    });
  } catch (error) {
    console.error("Error in sendEmail:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to queue email",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Send bulk emails
 * POST /api/send-bulk-email
 * Body: { recipients, subject, templateId OR templateSlug, data }
 */
export const sendBulkEmail = async (req, res) => {
  try {
    const { recipients, subject, templateId, templateSlug, data } = req.body;
    const { userId, apiKeyId } = getAuthInfo(req);

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Recipients array required and must not be empty",
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject is required",
      });
    }

    const { valid, invalid } = validateEmails(recipients);
    if (valid.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid email addresses provided",
        invalid,
      });
    }

    // Skip user limit check if API key request
    let user = null;
    let remainingQuota = Infinity;

    if (userId !== "api_key_user") {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const emailUsage = user.usage.find((u) => u.type === "email");
      remainingQuota = emailUsage
        ? emailUsage.allowedLimit - emailUsage.usedLimit
        : 0;

      if (remainingQuota < valid.length) {
        return res.status(429).json({
          success: false,
          message: `Insufficient quota. Required: ${valid.length}, Available: ${remainingQuota}`,
        });
      }
    }

    // Load template using ID or Slug
    let html = "";
    let template = null;
    if (templateId) {
      template = await Template.findById(templateId);
    } else if (templateSlug) {
      template = await Template.findOne({ slug: templateSlug });
    }

    if (template) {
      html = renderTemplate(template.content, data || {});
    } else {
      html = data?.html || data?.content || "";
      if (!html) {
        return res.status(400).json({
          success: false,
          message: "Either templateId/templateSlug or html/content required",
        });
      }
    }

    const jobPromises = valid.map((to) =>
      addEmailToQueue({
        to,
        subject,
        html,
        userId,
        apiKeyId,
        templateId: template?._id || null,
      })
    );

    const results = await Promise.allSettled(jobPromises);
    const jobs = results
      .filter((r) => r.status === "fulfilled")
      .map((r, index) => ({
        jobId: r.value.id,
        to: valid[index],
        status: "queued",
      }));

    return res.status(200).json({
      success: true,
      message: `${jobs.length} emails queued successfully`,
      data: {
        queued: jobs.length,
        failed: valid.length - jobs.length,
        invalid: invalid.length,
        jobs,
        invalidEmails: invalid.length > 0 ? invalid : undefined,
      },
    });
  } catch (error) {
    console.error("Error in sendBulkEmail:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to queue bulk emails",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get queue statistics
 * GET /api/queue-stats
 */
export const getQueueStats = async (req, res) => {
  try {
    const { getQueueStats } = await import("../queue/emailQueue.js");
    const stats = await getQueueStats();

    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Error getting queue stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get queue statistics",
    });
  }
};
