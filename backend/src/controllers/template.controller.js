import Template from "../models/template.model.js";
import User from "../models/user.model.js";
import { generateSlug } from "../utils/generateSlug.js";
import {
  isUserOwnerOfTemplate,
  isUserOwnerOfTemplateOrTemplateIsPublic,
} from "../utils/checkIsUserOwner.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import envVars from "../config/envVars.js";

// Create template
export const createTemplate = async (req, res) => {
  try {
    const { name, content, description, isPublic } = req.body;
    const userId = req.user._id;

    if (!name || !content) {
      return res.status(400).json({
        success: false,
        message: "Name and content are required",
      });
    }

    // Generate slug
    const slug = generateSlug();

    // Create template
    const template = await Template.create({
      name,
      content,
      description,
      slug,
      owner: userId,
      isPublic: isPublic || false,
    });

    // Add to user's templates
    await User.findByIdAndUpdate(userId, {
      $push: { templates: template._id },
    });

    return res.status(201).json({
      success: true,
      message: "Template created successfully",
      data: template,
    });
  } catch (error) {
    console.error("Create template error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create template",
    });
  }
};

// Fetch all templates for user
export const fetchAllTemplates = async (req, res) => {
  try {
    const userId = req.user._id;
    const templates = await Template.find({ owner: userId }).select("-__v");

    return res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Fetch templates error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
    });
  }
};

// Fetch all public templates
export const fetchPublicTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ isPublic: true }).select("-__v");

    return res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Fetch public templates error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch public templates",
    });
  }
};

// Fetch template by ID
export const fetchTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    // Check access
    if (!isUserOwnerOfTemplateOrTemplateIsPublic(userId.toString(), template)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Fetch template error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch template",
    });
  }
};

// Fetch template by slug
export const fetchTemplateBySlug = async (req, res) => {
  try {
    const { id: slug } = req.params;
    const userId = req.user._id;

    const template = await Template.findOne({ slug });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    // Check access
    if (!isUserOwnerOfTemplateOrTemplateIsPublic(userId.toString(), template)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Fetch template by slug error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch template",
    });
  }
};

// Update template
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content, description, isPublic } = req.body;
    const userId = req.user._id;

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    // Check ownership
    if (!isUserOwnerOfTemplate(userId.toString(), template)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Update fields
    if (name) template.name = name;
    if (content) template.content = content;
    if (description !== undefined) template.description = description;
    if (isPublic !== undefined) template.isPublic = isPublic;

    await template.save();

    return res.status(200).json({
      success: true,
      message: "Template updated successfully",
      data: template,
    });
  } catch (error) {
    console.error("Update template error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update template",
    });
  }
};

// Delete template
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    // Check ownership
    if (!isUserOwnerOfTemplate(userId.toString(), template)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Remove from user's templates
    await User.findByIdAndUpdate(userId, {
      $pull: { templates: template._id },
    });

    // Delete template
    await Template.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Delete template error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete template",
    });
  }
};

//Create template with ai
export const createTemplateWithAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user._id;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }
    // Call AI service to generate template content
    const SYSTEM_PROMPT = `You are NotiPi’s AI Email Template Designer — an expert in creating professional, responsive, and production-ready HTML email templates.

Your role:
- Generate **complete HTML email templates** based on a user’s prompt (e.g., “Welcome email for new users,” “Password reset notification,” “Product launch announcement,” etc.).
- Output **clean, valid HTML** that can be used directly in an email client.
- Ensure compatibility with all major email services (Gmail, Outlook, Apple Mail, etc.).
- Never include external CSS files — use **inline styles** or minimal embedded ** <
      style >**
       blocks.
- Use a mobile-first, responsive design with fallback support for older clients.
- Keep templates under ~60KB for performance.
- Maintain good contrast and professional visual hierarchy.

Rules:
1. Always wrap the email in a **<html><body>** structure with **<table>**-based layout for reliable email rendering.
2. Include a **header section** (logo/title), **main message section**, and **footer** (optional unsubscribe or contact info).
3. Colors must be elegant and theme-neutral — prefer semantic use like **#1a1a1a** for text and **#3b82f6** for accent links.
4. Include placeholders for dynamic variables using double curly braces syntax, e.g.:
{{username}}, {{verification_link}}, {{product_name}}

less
Copy code
Do not fill them with dummy data.
5. Always add proper spacing and visual balance — no clutter or tight padding.
6. Use accessible HTML (alt attributes, readable text sizes, good color contrast).
7. Never include JavaScript or unsafe HTML.
8. If the user asks for multiple sections, include them in a scrollable vertical layout with distinct separation (e.g., product highlights, testimonials, CTA).

Output format:
- Return **only the HTML code**, without explanations or markdown formatting.
- Do not wrap code in triple backticks or text formatting.
- The HTML must be **ready to render directly** in an email client or web preview.

Example Input → Output behavior:
- Input: "Create a welcome email for a new SaaS user with CTA button to get started"
- Output: Full HTML for a professional welcome email with header, body, CTA button, and footer.

Your tone:
- Clean, minimal, professional.
- Focused on clarity and brand-neutral presentation.`;

    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Request: ${prompt}\n\nGenerate the HTML email template now:`;

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(envVars.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate template with AI
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let generatedHTML = response.text();

    // Clean up the response - remove markdown code blocks if present
    generatedHTML = generatedHTML
      .replace(/```html\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Generate a template name from the prompt
    const templateName = prompt.slice(0, 50).trim() + " (AI Generated)";

    // Generate slug
    const slug = generateSlug();

    // Create template in database
    const template = await Template.create({
      name: templateName,
      content: generatedHTML,
      description: `AI-generated template based on: ${prompt}`,
      slug,
      owner: userId,
      isPublic: false,
    });

    // Add to user's templates
    await User.findByIdAndUpdate(userId, {
      $push: { templates: template._id },
    });

    return res.status(201).json({
      success: true,
      message: "Template created successfully with AI",
      data: template,
    });
  } catch (error) {
    console.error("Create template with AI error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create template with AI",
      error: error.message,
    });
  }
};
