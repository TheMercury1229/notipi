import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
import {
  createApiKey,
  deleteApiKey,
  fetchAllApiKeys,
  fetchApiKeyById,
  updateApiKey,
} from "../controllers/apiKey.controller.js";

const apiKeyRouter = Router();

apiKeyRouter.use(checkAuth);
apiKeyRouter.post("/", createApiKey);
apiKeyRouter.patch("/:id", updateApiKey);
apiKeyRouter.delete("/:id", deleteApiKey);
apiKeyRouter.get("/", fetchAllApiKeys);
apiKeyRouter.get("/:id", fetchApiKeyById);

export default apiKeyRouter;
