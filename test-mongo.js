import mongoose from "mongoose";
import User from "./backend/models/User.js";
import Workspace from "./backend/models/Workspace.js";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartbiz")
  .then(async () => {
    try {
      const user = new User({
        name: "Test",
        email: "test@example.com",
        password: "password123",
        role: "admin",
      });

      console.log("User ID:", user._id);

      const workspace = await Workspace.create({
        name: "Test's Workspace",
        owner: user._id,
      });

      console.log("Workspace created:", workspace);
      process.exit(0);
    } catch (e) {
      console.error("Error:", e);
      process.exit(1);
    }
  });
