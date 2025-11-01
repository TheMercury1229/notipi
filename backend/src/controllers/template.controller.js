import Template from "../models/template.model.js";
import User from "../models/user.model.js";
import { generateSlug } from "../utils/generateSlug.js";
import {
  isUserOwnerOfTemplate,
  isUserOwnerOfTemplateOrTemplateIsPublic,
} from "../utils/checkIsUserOwner.js";

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
  } catch (error) {
    console.error("Create template with AI error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create template with AI",
    });
  }
};
