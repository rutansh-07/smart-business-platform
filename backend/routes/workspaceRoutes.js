import express from "express";
import { getWorkspaceInvite, verifyInviteToken } from "../controllers/workspaceController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/invite", protect, isAdmin, getWorkspaceInvite);
router.get("/verify-invite/:token", verifyInviteToken);

export default router;
