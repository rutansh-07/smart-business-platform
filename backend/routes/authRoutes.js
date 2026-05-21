import express from "express";
import { registerUser, loginUser, updateUserProfile, updateUserPassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, updateUserProfile);
router.put("/password", protect, updateUserPassword);

export default router;
