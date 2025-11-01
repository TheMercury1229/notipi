import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
import {
  createTemplate,
  createTemplateWithAI,
  deleteTemplate,
  fetchAllTemplates,
  fetchPublicTemplates,
  fetchTemplateById,
  fetchTemplateBySlug,
  updateTemplate,
} from "../controllers/template.controller.js";

const templateRouter = Router();

templateRouter.use(checkAuth);
templateRouter.get("/", fetchAllTemplates);
templateRouter.get("/:id", fetchTemplateById);
templateRouter.post("/", createTemplate);
templateRouter.get("/slug/:id", fetchTemplateBySlug);
templateRouter.patch("/:id", updateTemplate);
templateRouter.delete("/:id", deleteTemplate);
templateRouter.get("/all", fetchPublicTemplates);
templateRouter.post("/generate-ai", createTemplateWithAI);
export default templateRouter;
