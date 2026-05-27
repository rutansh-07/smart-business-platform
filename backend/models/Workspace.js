import mongoose from "mongoose";
import crypto from "crypto";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    inviteToken: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple nulls if ever needed
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate invite token before saving if it doesn't exist
workspaceSchema.pre("save", async function () {
  if (!this.inviteToken) {
    // Generate a secure 20-character hex string
    this.inviteToken = crypto.randomBytes(20).toString("hex");
  }
});

const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace;
