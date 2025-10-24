import Mustache from "mustache";

/**
 * Render template with Mustache
 * @param {string} template - Template string with {{variables}}
 * @param {Object} data - Data to render in template
 * @returns {string} Rendered HTML
 */
export function renderTemplate(template, data = {}) {
  try {
    // Disable HTML escaping for email templates
    const rendered = Mustache.render(template, data);
    return rendered;
  } catch (error) {
    console.error("Error rendering template:", error);
    throw new Error("Failed to render template");
  }
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate array of emails
 * @param {Array<string>} emails - Array of email addresses
 * @returns {Object} { valid: [], invalid: [] }
 */
export function validateEmails(emails) {
  const valid = [];
  const invalid = [];

  for (const email of emails) {
    if (isValidEmail(email)) {
      valid.push(email);
    } else {
      invalid.push(email);
    }
  }

  return { valid, invalid };
}

/**
 * Create default email template if none provided
 * @param {string} content - Content text
 * @returns {string} HTML template
 */
export function createDefaultTemplate(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 5px;
    }
    .footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
  <div class="footer">
    <p>Sent via NotiPi - Notification as a Service</p>
  </div>
</body>
</html>
  `;
}

export default {
  renderTemplate,
  isValidEmail,
  validateEmails,
  createDefaultTemplate,
};
