import Workspace from "../models/Workspace.js";

// @desc    Get the invite token for the admin's workspace
// @route   GET /api/workspaces/invite
// @access  Private (Admin only)
export const getWorkspaceInvite = async (req, res) => {
  try {
    if (!req.user.workspaceId) {
      return res.status(404).json({ message: "No workspace associated with this old user account. Please create a new account." });
    }

    const workspace = await Workspace.findById(req.user.workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    res.json({ token: workspace.inviteToken });
  } catch (error) {
    console.error("Get Invite Token Error:", error);
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
      return res.status(404).json({ message: "Invalid or expired invite link" });
    }

    res.json({ name: workspace.name });
  } catch (error) {
    console.error("Verify Invite Token Error:", error);
    res.status(500).json({ message: error.message });
  }
};
