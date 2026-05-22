import express from "express";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authorization protection middleware to all project routes
router.use(protect);

router.route("/")
  .get(getProjects)
  .post(createProject);

router.route("/:id")
  .put(updateProject)
  .delete(isAdmin, deleteProject);

export default router;
