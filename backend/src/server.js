import express from "express";
import cors from "cors";
// Custom Imports
import connectDB from "./config/connectDB.js";
import envVars from "./config/envVars.js";

//Routes Imports
import userRouter from "./routes/user.route.js";
import apiKeyRouter from "./routes/apiKey.route.js";
import templateRouter from "./routes/template.route.js";
import analyticsRouter from "./routes/analytics.route.js";
import cookieParser from "cookie-parser";

const app = express();

await connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: envVars.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(cookieParser());

//Routes
app.use("/api/users", userRouter);
app.use("/api/apikeys", apiKeyRouter);
app.use("/api/templates", templateRouter);
app.use("/api/analytics", analyticsRouter);

// Error Handling Middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

//Server Listening
const PORT = envVars.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});