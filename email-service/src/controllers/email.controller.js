import Template from "../models/template.model.js";
import User from "../models/user.model.js";
import { addEmailToQueue } from "../queue/emailQueue.js";
import {
  renderTemplate,
  isValidEmail,
  validateEmails,
} from "../utils/templateRenderer.js";

/**
 * Send single email
 * POST /api/send-email
 * Body: { to, subject, templateId, data }
 */
export const sendEmail = async (req, res) => {
  try {
    const { to, subject, templateId, data } = req.body;
    const { userId, apiKeyId } = req.auth;

    // Validate required fields
    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: to, subject",
      });
    }

    // Validate email format
    if (!isValidEmail(to)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check user usage limits
    const user = await User.findById(userId);
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

    let html = "";

    // Load template if templateId provided
    if (templateId) {
      const template = await Template.findById(templateId);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      // Check if user owns the template or it's public
      if (
        template.owner.toString() !== userId.toString() &&
        !template.isPublic
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have access to this template",
        });
      }

      // Render template with data
      html = renderTemplate(template.content, data || {});
    } else {
      // Use data.html or data.content as fallback
      html = data?.html || data?.content || "";

      if (!html) {
        return res.status(400).json({
          success: false,
          message: "Either templateId or html content is required",
        });
      }
    }

    // Add job to queue
    const job = await addEmailToQueue({
      to,
      subject,
      html,
      userId,
      apiKeyId,
      templateId: templateId || null,
    });

    return res.status(200).json({
      success: true,
      message: "Email queued successfully",
      data: {
        jobId: job.id,
        to,
        subject,
      },
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
 * Body: { recipients: [emails], subject, templateId, data }
 */
export const sendBulkEmail = async (req, res) => {
  try {
    const { recipients, subject, templateId, data } = req.body;
    const { userId, apiKeyId } = req.auth;

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Recipients array is required and must not be empty",
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject is required",
      });
    }

    // Validate emails
    const { valid, invalid } = validateEmails(recipients);

    if (valid.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid email addresses provided",
        invalid,
      });
    }

    // Check user usage limits
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const emailUsage = user.usage.find((u) => u.type === "email");
    const remainingQuota = emailUsage
      ? emailUsage.allowedLimit - emailUsage.usedLimit
      : 0;

    if (remainingQuota < valid.length) {
      return res.status(429).json({
        success: false,
        message: `Insufficient quota. Required: ${valid.length}, Available: ${remainingQuota}`,
        usage: {
          used: emailUsage?.usedLimit || 0,
          allowed: emailUsage?.allowedLimit || 0,
          required: valid.length,
        },
      });
    }

    let html = "";

    // Load template if templateId provided
    if (templateId) {
      const template = await Template.findById(templateId);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      // Check if user owns the template or it's public
      if (
        template.owner.toString() !== userId.toString() &&
        !template.isPublic
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have access to this template",
        });
      }

      // Render template with data
      html = renderTemplate(template.content, data || {});
    } else {
      // Use data.html or data.content as fallback
      html = data?.html || data?.content || "";

      if (!html) {
        return res.status(400).json({
          success: false,
          message: "Either templateId or html content is required",
        });
      }
    }

    // Add jobs to queue for each recipient
    const jobs = [];
    const jobPromises = valid.map((to) =>
      addEmailToQueue({
        to,
        subject,
        html,
        userId,
        apiKeyId,
        templateId: templateId || null,
      })
    );

    const results = await Promise.allSettled(jobPromises);

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        jobs.push({
          jobId: result.value.id,
          to: valid[index],
          status: "queued",
        });
      }
    });

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

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting queue stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get queue statistics",
    });
  }
};
