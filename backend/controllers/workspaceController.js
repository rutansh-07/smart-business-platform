import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import crypto from "crypto";

// @desc    Get the invite token for the admin's workspace
// @route   GET /api/workspaces/invite
// @access  Private (Admin only)
export const getWorkspaceInvite = async (req, res) => {
  try {
    if (!req.user.workspaceId) {
      return res.status(404).json({
        message: "No workspace found for your account. Please log out and register as a new Owner to create a workspace.",
      });
    }

    const workspace = await Workspace.findById(req.user.workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found in the database." });
    }

    res.json({ token: workspace.inviteToken, workspaceName: workspace.name });
  } catch (error) {
    console.error("Get Invite Token Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Regenerate the invite token for the admin's workspace
// @route   POST /api/workspaces/regenerate-invite
// @access  Private (Admin only)
export const regenerateWorkspaceInvite = async (req, res) => {
  try {
    if (!req.user.workspaceId) {
      return res.status(404).json({
        message: "No workspace found for your account.",
      });
    }

    const workspace = await Workspace.findById(req.user.workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found." });
    }

    // Generate a brand-new secure invite token
    workspace.inviteToken = crypto.randomBytes(20).toString("hex");
    await workspace.save();

    res.json({ token: workspace.inviteToken, workspaceName: workspace.name });
  } catch (error) {
    console.error("Regenerate Invite Token Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify an invite token and return workspace name
// @route   GET /api/workspaces/verify-invite/:token
// @access  Public
export const verifyInviteToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const workspace = await Workspace.findOne({ inviteToken: token });

    if (!workspace) {
      return res.status(404).json({ message: "Invalid or expired invite link. Please ask your admin for a new one." });
    }

    res.json({ name: workspace.name, workspaceName: workspace.name });
  } catch (error) {
    console.error("Verify Invite Token Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all members of the admin's workspace
// @route   GET /api/workspaces/members
// @access  Private (Admin only)
export const getWorkspaceMembers = async (req, res) => {
  try {
    if (!req.user.workspaceId) {
      return res.status(400).json({ message: "No workspace associated with this user." });
    }

    // Find all users that belong to this workspace
    const members = await User.find({ workspaceId: req.user.workspaceId })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(members);
  } catch (error) {
    console.error("Get Workspace Members Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all members of the user's workspace (accessible to all roles)
// @route   GET /api/workspaces/team
// @access  Private
export const getTeamMembers = async (req, res) => {
  try {
    if (!req.user.workspaceId) {
      return res.status(400).json({ message: "No workspace associated with this user." });
    }
    const members = await User.find({
      workspaceId: req.user.workspaceId,
    })
      .select("name email avatar role status")
      .sort({ name: 1 });
    res.json(members);
  } catch (error) {
    console.error("Get Team Members Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a member from the workspace
// @route   DELETE /api/workspaces/members/:id
// @access  Private (Admin only)
export const removeWorkspaceMember = async (req, res) => {
  try {
    if (!req.user.workspaceId) {
      return res.status(400).json({ message: "No workspace associated with this user." });
    }

    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify the target user belongs to the admin's workspace
    if (targetUser.workspaceId.toString() !== req.user.workspaceId.toString()) {
      return res.status(403).json({ message: "Cannot remove a user from a different workspace." });
    }

    // Cannot remove oneself
    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot remove yourself from the workspace." });
    }

    // Delete the user from the database
    await targetUser.deleteOne();

    res.json({ message: "Member removed successfully." });
  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Invite a member by email (Creates a pending user)
// @route   POST /api/workspaces/invite-email
// @access  Private (Admin only)
export const inviteMemberByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (!req.user.workspaceId) {
      return res.status(400).json({ message: "No workspace associated with this user." });
    }

    // Check if user already exists
    let userExists = await User.findOne({ email });

    if (userExists) {
      if (userExists.status === "pending") {
        return res.status(400).json({ message: "User is already invited and pending." });
      }
      return res.status(400).json({ message: "User already exists." });
    }

    // Generate a dummy random password since they will set it upon joining
    const dummyPassword = crypto.randomBytes(16).toString("hex");

    // Create a pending placeholder user
    const pendingUser = await User.create({
      name: email.split("@")[0], // Placeholder name
      email: email,
      password: dummyPassword,
      role: "employee",
      status: "pending",
      workspaceId: req.user.workspaceId,
    });

    res.status(201).json({
      message: "User successfully invited.",
      user: {
        _id: pendingUser._id,
        name: pendingUser.name,
        email: pendingUser.email,
        role: pendingUser.role,
        status: pendingUser.status,
      }
    });
  } catch (error) {
    console.error("Invite Member by Email Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete workspace onboarding
// @route   PUT /api/workspaces/onboarding
// @access  Private (Admin only)
export const completeOnboarding = async (req, res) => {
  try {
    const { name, businessType } = req.body;

    if (!req.user.workspaceId) {
      return res.status(400).json({ message: "No workspace associated with this user." });
    }

    const workspace = await Workspace.findById(req.user.workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found." });
    }

    // Only owner/admin can update onboarding
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update workspace onboarding." });
    }

    if (name) workspace.name = name;
    if (businessType) workspace.businessType = businessType;
    workspace.onboardingCompleted = true;

    await workspace.save();

    res.json({
      message: "Onboarding completed successfully.",
      workspace: {
        _id: workspace._id,
        name: workspace.name,
        businessType: workspace.businessType,
        onboardingCompleted: workspace.onboardingCompleted,
      }
    });
  } catch (error) {
    console.error("Complete Onboarding Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Skip workspace onboarding
// @route   PUT /api/workspaces/skip-onboarding
// @access  Private (Admin only)
export const skipOnboarding = async (req, res) => {
  try {
    if (!req.user.workspaceId) {
      return res.status(400).json({ message: "No workspace associated with this user." });
    }

    const workspace = await Workspace.findById(req.user.workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found." });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update workspace onboarding." });
    }

    workspace.onboardingCompleted = true;
    await workspace.save();

    res.json({
      message: "Onboarding skipped.",
      workspace: {
        _id: workspace._id,
        name: workspace.name,
        onboardingCompleted: workspace.onboardingCompleted,
      }
    });
  } catch (error) {
    console.error("Skip Onboarding Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update workspace name/details
// @route   PUT /api/workspaces
// @access  Private (Admin only)
export const updateWorkspace = async (req, res) => {
  try {
    const { name, businessType } = req.body;

    if (!req.user.workspaceId) {
      return res.status(400).json({ message: "No workspace associated with this user." });
    }

    const workspace = await Workspace.findById(req.user.workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found." });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update workspace." });
    }

    if (name) workspace.name = name;
    if (businessType !== undefined) workspace.businessType = businessType;

    await workspace.save();

    res.json({
      message: "Workspace updated successfully.",
      workspace: {
        _id: workspace._id,
        name: workspace.name,
        businessType: workspace.businessType,
      }
    });
  } catch (error) {
    console.error("Update Workspace Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get workspace details
// @route   GET /api/workspaces
// @access  Private
export const getWorkspaceDetails = async (req, res) => {
  try {
    if (!req.user.workspaceId) {
      return res.status(400).json({ message: "No workspace associated with this user." });
    }

    const workspace = await Workspace.findById(req.user.workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found." });
    }

    res.json(workspace);
  } catch (error) {
    console.error("Get Workspace Details Error:", error);
    res.status(500).json({ message: error.message });
  }
};
