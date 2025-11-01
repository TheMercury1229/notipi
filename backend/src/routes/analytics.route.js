import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
import {
  getAnalyticsStats,
  getActivityLogs,
  getRealTimeStats,
} from "../controllers/analytics.controller.js";

const analyticsRouter = Router();

// All routes require authentication
analyticsRouter.use(checkAuth);

// Get comprehensive analytics stats
analyticsRouter.get("/stats", getAnalyticsStats);

// Get activity logs with filtering
analyticsRouter.get("/logs", getActivityLogs);

// Get real-time stats for dashboard
analyticsRouter.get("/realtime", getRealTimeStats);

export default analyticsRouter;