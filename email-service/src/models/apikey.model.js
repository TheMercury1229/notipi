import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    hashedKey: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ApiKey = mongoose.model("ApiKey", apiKeySchema);

export default ApiKey;
