import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

// @desc    Get dashboard metrics/stats
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ message: "No workspace associated with your account." });
    }

    // 1. Projects Count
    const totalProjects = await Project.countDocuments({ workspaceId });

    // 2. Tasks count by status
    const totalTasks = await Task.countDocuments({ workspaceId });
    const completedTasks = await Task.countDocuments({ workspaceId, status: "done" });
    const todoTasks = await Task.countDocuments({ workspaceId, status: "todo" });
    const inProgressTasks = await Task.countDocuments({ workspaceId, status: "inprogress" });

    // 3. Team size count
    const teamMembers = await User.countDocuments({ workspaceId });

    // 4. Recent tasks
    // Populate assignee and project details
    const recentTasks = await Task.find({ workspaceId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("assignee", "name email avatar")
      .populate("project", "name client");

    // 5. Project breakdown (for chart)
    const projects = await Project.find({ workspaceId }).select("name client progress status");

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      todoTasks,
      inProgressTasks,
      teamMembers,
      recentTasks,
      projects
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};
