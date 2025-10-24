import dotenv from "dotenv";
dotenv.config();

const envVars = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV || "development",
};

Object.freeze(envVars);

export default envVars;
