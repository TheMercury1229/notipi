import express from "express";
import cors from "cors";

// Custom Imports
import connectDB from "./config/dbConnect.js";
import envVars from "./config/envVars.js";
import emailRoutes from "./routes/email.route.js";
import { apiRateLimiter } from "./middlewares/rateLimiter.middleware.js";

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiter (applies to all routes)
app.use(apiRateLimiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Email service is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api", emailRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message:
      envVars.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// Server Listening
const PORT = envVars.PORT;
app.listen(PORT, () => {
  console.log(`\n🚀 Email Service is running on port ${PORT}`);
  console.log(`📧 Environment: ${envVars.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📌 API Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/send-email`);
  console.log(`   POST http://localhost:${PORT}/api/send-bulk-email`);
  console.log(`   GET  http://localhost:${PORT}/api/queue-stats`);
  console.log(`\n⚠️  Don't forget to start the worker: npm run worker\n`);
});
