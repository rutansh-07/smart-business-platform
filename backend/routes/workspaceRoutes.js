import express from "express";
import { getWorkspaceInvite, regenerateWorkspaceInvite, verifyInviteToken, getWorkspaceMembers, removeWorkspaceMember, inviteMemberByEmail } from "../controllers/workspaceController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/invite", protect, isAdmin, getWorkspaceInvite);
router.post("/regenerate-invite", protect, isAdmin, regenerateWorkspaceInvite);
router.get("/verify-invite/:token", verifyInviteToken);

router.get("/members", protect, isAdmin, getWorkspaceMembers);
router.delete("/members/:id", protect, isAdmin, removeWorkspaceMember);
router.post("/invite-email", protect, isAdmin, inviteMemberByEmail);

export default router;
