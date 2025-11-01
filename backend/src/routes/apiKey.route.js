import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
import {
  createApiKey,
  deleteApiKey,
  fetchAllApiKeys,
  fetchApiKeyById,
  updateApiKey,
  revokeApiKey,
  restoreApiKey,  // NEW
} from "../controllers/apiKey.controller.js";

const apiKeyRouter = Router();

apiKeyRouter.use(checkAuth);
apiKeyRouter.post("/", createApiKey);
apiKeyRouter.patch("/:id", updateApiKey);
apiKeyRouter.post("/:id/revoke", revokeApiKey);
apiKeyRouter.post("/:id/restore", restoreApiKey);  // NEW - Restore endpoint
apiKeyRouter.delete("/:id", deleteApiKey);
apiKeyRouter.get("/", fetchAllApiKeys);
apiKeyRouter.get("/:id", fetchApiKeyById);

export default apiKeyRouter;