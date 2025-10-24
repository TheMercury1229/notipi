import nodemailer from "nodemailer";
import envVars from "../config/envVars.js";

// Create transporter
const transporter = nodemailer.createTransport({
  host: envVars.SMTP_HOST,
  port: envVars.SMTP_PORT,
  secure: envVars.SMTP_SECURE,
  auth: {
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP configuration error:", error);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

/**
 * Send email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @param {string} options.from - Sender email (optional)
 * @returns {Promise<Object>}
 */
export async function sendEmailWithNodemailer({
  to,
  subject,
  html,
  text,
  from,
}) {
  try {
    const mailOptions = {
      from: from || `"${envVars.SMTP_FROM_NAME}" <${envVars.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || undefined,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export default transporter;
