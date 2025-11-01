import dotenv from "dotenv";
dotenv.config();

const envVars = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV || "development",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  JWT_SECRET: process.env.JWT_SECRET || "defaultsecretkey",
};

Object.freeze(envVars);

export default envVars;
