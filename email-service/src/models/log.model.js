import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    apiKey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiKey",
      required: true,
    },
    eventType: {
      type: String,
      enum: ["email", "sms", "push_notification"],
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failure"],
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
logSchema.index({ user: 1, createdAt: -1 });
logSchema.index({ apiKey: 1, createdAt: -1 });
logSchema.index({ status: 1 });

const Log = mongoose.model("Log", logSchema);
export default Log;
