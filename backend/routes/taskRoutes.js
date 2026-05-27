import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from "../controllers/taskController.js";

const router = express.Router();

// All task routes require authentication
router.use(protect);

// GET tasks for a specific project
router.get("/project/:projectId", getTasksByProject);

// POST create a new task
router.post("/", createTask);

// PUT bulk reorder (must be before /:id route)
router.put("/reorder", reorderTasks);

// PUT update a specific task
router.put("/:id", updateTask);

// DELETE a specific task
router.delete("/:id", deleteTask);

export default router;
