import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    apiKeys: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ApiKey",
      },
    ],
    usage: [
      {
        type: {
          type: String, //[email, sms, etc.]
          enum: ["email", "sms", "push_notification"],
          required: true,
        },
        allowedLimit: {
          type: Number,
          default: 100,
        },
        usedLimit: {
          type: Number,
          default: 0,
        },
      },
    ],
    templates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Template",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create index on clerkId
// userSchema.index({ clerkId: 1 });

const User = mongoose.model("User", userSchema);

export default User;
