/**
 * SmartBiz Database Seed Script
 * ================================
 * Run this ONCE to wipe legacy accounts and create a clean Admin account
 * with a properly linked Workspace (required for the invite system to work).
 *
 * Usage (from the /backend directory):
 *   node seed.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Workspace from "./models/Workspace.js";

dotenv.config();

const seed = async () => {
  try {
    const connStr = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-business-platform";
    console.log("🔗 Connecting to MongoDB:", connStr);
    await mongoose.connect(connStr);
    console.log("✅ Connected!\n");

    // --- Step 1: Wipe all old, legacy data ---
    console.log("🗑️  Wiping all existing Users and Workspaces...");
    await User.deleteMany({});
    await Workspace.deleteMany({});
    console.log("✅ All old data cleared.\n");

    // --- Step 2: Create a fresh Admin user ---
    console.log("👤 Creating Admin user: owner@smartbiz.com / password123");
    const adminUser = new User({
      name: "Admin Owner",
      email: "owner@smartbiz.com",
      password: "password123",
      role: "admin",
    });

    // --- Step 3: Create a Workspace linked to this admin ---
    console.log("🏢 Creating Workspace: SmartBiz HQ");
    const workspace = await Workspace.create({
      name: "SmartBiz HQ",
      owner: adminUser._id,
    });

    // --- Step 4: Link workspace back to user and save ---
    adminUser.workspaceId = workspace._id;
    await adminUser.save();

    console.log("\n🎉 Seed Complete! Here are your credentials:\n");
    console.log("  Admin Email    : owner@smartbiz.com");
    console.log("  Admin Password : password123");
    console.log(`  Workspace Name : ${workspace.name}`);
    console.log(`  Workspace ID   : ${workspace._id}`);
    console.log(`\n  🔗 Invite Token: ${workspace.inviteToken}`);
    console.log(`  🔗 Invite URL  : http://localhost:5173/join?token=${workspace.inviteToken}`);
    console.log("\n  Share the Invite URL with employees so they can join your workspace.\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
