import mongoose from "mongoose";
import envVars from "./envVars.js";

export default async function connectDB() {
  try {
    const conn = await mongoose.connect(envVars.MONGO_URI);
    console.log("MongoDB connected successfully", conn.connection.host);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}
