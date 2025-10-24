import { generateSlug } from "../utils/generateSlug.js";
import Template from "../models/template.model.js";
import {
  isUserOwnerOfTemplate,
  isUserOwnerOfTemplateOrTemplateIsPublic,
} from "../utils/checkIsUserOwner.js";

export const createTemplate = async (req, res, next) => {
  try {
    const { name, content, description, isPublic } = req.body;
    const userId = req.auth.userId;
    let slug = generateSlug();
    const templateExists = await Template.findOne({ slug });
    if (templateExists) {
      slug = slug + Date.now().toString(36);
    }
    const newTemplate = new Template({
      name,
      content,
      description,
      isPublic,
      slug,
      owner: userId,
    });
    const savedTemplate = await newTemplate.save();
    if (savedTemplate) {
      res.status(201).json({
        success: true,
        data: savedTemplate,
        message: "Template created successfully",
      });
    }
  } catch (error) {
    console.error("Error creating template:", error);
    next(error);
  }
};
export const fetchAllTemplates = async (req, res, next) => {
  try {
    const templates = await Template.find({ owner: req.auth.userId });
    res.status(200).json({
      success: true,
      data: templates,
      message: "Templates fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    next(error);
  }
};
export const fetchTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const template = await Template.findById(id);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }
    const showTemplate = await isUserOwnerOfTemplateOrTemplateIsPublic(
      req.auth.userId,
      template
    );
    if (!showTemplate) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this template",
      });
    }
    res.status(200).json({
      success: true,
      data: template,
      message: "Template fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching template by ID:", error);
    next(error);
  }
};
export const fetchTemplateBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const template = await Template.findOne({ slug });
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }
    const showTemplate = await isUserOwnerOfTemplateOrTemplateIsPublic(
      req.auth.userId,
      template
    );
    if (!showTemplate) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this template",
      });
    }
    res.status(200).json({
      success: true,
      data: template,
      message: "Template fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching template by slug:", error);
    next(error);
  }
};
export const updateTemplate = async (req, res, next) => {
  try {
    const { name, content, description, isPublic } = req.body;
    const { id } = req.params;
    const template = await Template.findById(id);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }
    const isOwner = isUserOwnerOfTemplate(req.auth.userId, template);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this template",
      });
    }
    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      { name, content, description, isPublic },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: updatedTemplate,
      message: "Template updated successfully",
    });
  } catch (error) {
    console.error("Error updating template:", error);
    next(error);
  }
};
export const deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const template = await Template.findById(id);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }
    const isOwner = isUserOwnerOfTemplate(req.auth.userId, template);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this template",
      });
    }
    await Template.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    next(error);
  }
};
export const fetchPublicTemplates = async (req, res, next) => {
  try {
    const publicTemplates = await Template.find({ isPublic: true });
    res.status(200).json({
      success: true,
      data: publicTemplates,
      message: "Public templates fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching public templates:", error);
    next(error);
  }
};
